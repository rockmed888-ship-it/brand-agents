#!/usr/bin/env node
import fs from "fs";
import path from "path";

const recordPath = process.argv[2];
const connector = JSON.parse(fs.readFileSync(recordPath, "utf8"));
const actions = new Set(connector.actions || []);
const NEVER = new Set(["send", "post", "pay", "publish", "delete"]);
const STOP = new Set([
  "what", "this", "that", "with", "from", "your", "have", "does", "when", "where",
  "which", "about", "into", "they", "them", "then", "than", "just", "only", "also",
  "some", "been", "were", "will", "would", "could", "should", "there", "their",
  "here",
]);

function tools() {
  const ask = {
    name: "brain_ask",
    description: "Answer only from the material attached to this connector. Say when the notes do not contain the answer.",
    inputSchema: { type: "object", properties: { question: { type: "string" } }, required: ["question"] },
  };
  if (connector.kind === "assistant" || connector.kind === "automation") {
    return [
      ask,
      {
        name: "brain_act",
        description: "Record one allowed action. Never send, post, or pay.",
        inputSchema: { type: "object", properties: { said: { type: "string" } }, required: ["said"] },
      },
    ];
  }
  return [
    ask,
    {
      name: "brain_page",
      description: "Answer about one named part of the attached notes.",
      inputSchema: {
        type: "object",
        properties: { question: { type: "string" }, where: { type: "string" } },
        required: ["question"],
      },
    },
    {
      name: "brain_guide",
      description: "Say what to do next using only the attached notes.",
      inputSchema: { type: "object", properties: { where: { type: "string" }, question: { type: "string" } } },
    },
  ];
}

function pieces(source) {
  return String(source || "")
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function words(text) {
  return String(text || "")
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

function answer(question, where) {
  const source = String(connector.source || "");
  const bits = pieces(source);
  const place = String(where || "").trim().toLowerCase();
  if (!source.trim()) return "No notes were attached to this connector.";
  if (place && !source.toLowerCase().includes(place)) {
    return "That part is not in the notes attached to this connector.";
  }
  const pool = place ? bits.filter((s) => s.toLowerCase().includes(place)) : bits;
  const qWords = words(question);
  if (qWords.length === 0) {
    return pool.slice(0, 2).join(" ") || "I only know the notes that were attached to this connector.";
  }
  const ranked = pool
    .map((s) => ({ s, n: qWords.filter((w) => s.toLowerCase().includes(w)).length }))
    .filter((row) => row.n > 0)
    .sort((a, b) => b.n - a.n);
  if (!ranked.length) return "That is not in the notes attached to this connector.";
  return ranked[0].s;
}

function act(said) {
  const text = String(said || "").toLowerCase();
  const blocked = [...NEVER].find((name) => text.includes(name));
  if (blocked) {
    return { action: null, args: {}, say: "I do not send, post, or pay. That stays with you." };
  }
  const action = [...actions].find((name) => text.includes(name.replace(/_/g, " ")) || text.includes(name));
  if (!action) return { action: null, args: {}, say: "That action is not on the list." };
  const entry = { at: new Date().toISOString(), action, said: String(said || "") };
  fs.appendFileSync(path.join(path.dirname(recordPath), "actions.jsonl"), JSON.stringify(entry) + "\n");
  return { action, args: { said: entry.said }, say: `Noted ${action}. Nothing was sent, posted, or paid.` };
}

function spend() {
  const left = Number(connector.calls);
  if (!Number.isFinite(left)) return null;
  if (left <= 0) {
    return `No calls left on the ${connector.tier || "hobby"} tier.`;
  }
  connector.calls = left - 1;
  connector.used = Number(connector.used || 0) + 1;
  try {
    fs.writeFileSync(recordPath, JSON.stringify(connector, null, 2));
  } catch {
    /* still answer; the count stays in this process */
  }
  return null;
}

function rpc(msg) {
  const id = Object.prototype.hasOwnProperty.call(msg, "id") ? msg.id : null;
  if (msg.method === "notifications/initialized" || msg.method === "initialized") return null;
  if (msg.method === "ping") return { jsonrpc: "2.0", id, result: {} };
  if (msg.method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "brain-connector", version: "1.1.0" },
      },
    };
  }
  if (msg.method === "tools/list") return { jsonrpc: "2.0", id, result: { tools: tools() } };
  if (msg.method === "tools/call") {
    const empty = spend();
    if (empty) {
      return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: empty }], isError: true } };
    }
    const name = msg.params?.name;
    const args = msg.params?.arguments || {};
    let text = "Unknown tool";
    let isError = true;
    if (name === "brain_ask" || name === "brain_page" || name === "brain_guide") {
      text = answer(args.question || "", args.where || "");
      isError = false;
    } else if (name === "brain_act") {
      text = JSON.stringify(act(args.said));
      isError = false;
    }
    return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text }], isError } };
  }
  if (id === null) return null;
  return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } };
}

function send(obj) {
  if (!obj) return;
  const body = Buffer.from(JSON.stringify(obj), "utf8");
  process.stdout.write(`Content-Length: ${body.length}\r\n\r\n`);
  process.stdout.write(body);
}

let buf = Buffer.alloc(0);
process.stdin.on("data", (chunk) => {
  buf = Buffer.concat([buf, chunk]);
  while (buf.length) {
    const headerEnd = buf.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;
    const match = buf.slice(0, headerEnd).toString("utf8").match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      buf = buf.slice(headerEnd + 4);
      continue;
    }
    const start = headerEnd + 4;
    const len = Number(match[1]);
    if (buf.length < start + len) return;
    const raw = buf.slice(start, start + len).toString("utf8");
    buf = buf.slice(start + len);
    try {
      send(rpc(JSON.parse(raw)));
    } catch {
      send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    }
  }
});
