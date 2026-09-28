#!/usr/bin/env node
import fs from "fs";

const connector = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const actions = new Set(connector.actions || []);

function tools() {
  const ask = {
    name: "brain_ask",
    description: "Answer only from the material attached to this connector.",
    inputSchema: { type: "object", properties: { question: { type: "string" } }, required: ["question"] },
  };
  if (connector.kind === "assistant" || connector.kind === "automation") {
    return [
      ask,
      {
        name: "brain_act",
        description: "Choose one allowed action.",
        inputSchema: { type: "object", properties: { said: { type: "string" } }, required: ["said"] },
      },
    ];
  }
  return [
    ask,
    {
      name: "brain_page",
      description: "Answer about one part of the attached site material.",
      inputSchema: { type: "object", properties: { question: { type: "string" }, where: { type: "string" } }, required: ["question"] },
    },
    {
      name: "brain_guide",
      description: "Say what to do next using only the attached material.",
      inputSchema: { type: "object", properties: { where: { type: "string" }, question: { type: "string" } } },
    },
  ];
}

function answer(question) {
  const source = String(connector.source || "");
  const words = String(question || "")
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  const sentences = source.split(/(?<=[.!?])\s+/).filter(Boolean);
  const hit = sentences.find((s) => words.some((w) => s.toLowerCase().includes(w)));
  return hit || sentences.slice(0, 2).join(" ") || "I only know the notes that were attached to this connector.";
}

function act(said) {
  const text = String(said || "").toLowerCase();
  const action = [...actions].find((name) => text.includes(name.replace(/_/g, " ")) || text.includes(name));
  return { action: action || null, args: {}, say: action ? `I can ${action}.` : "That action is not on the list." };
}

function rpc(msg) {
  const id = Object.prototype.hasOwnProperty.call(msg, "id") ? msg.id : null;
  if (msg.method === "notifications/initialized" || msg.method === "initialized") return null;
  if (msg.method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "brain-connector", version: "1.0.0" },
      },
    };
  }
  if (msg.method === "tools/list") return { jsonrpc: "2.0", id, result: { tools: tools() } };
  if (msg.method === "tools/call") {
    const name = msg.params?.name;
    const args = msg.params?.arguments || {};
    let text = "Unknown tool";
    let isError = true;
    if (name === "brain_ask" || name === "brain_page" || name === "brain_guide") {
      text = answer(args.question || args.where || "");
      isError = false;
    } else if (name === "brain_act") {
      text = JSON.stringify(act(args.said));
      isError = false;
    }
    return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text }], isError } };
  }
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
