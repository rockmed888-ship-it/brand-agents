#!/usr/bin/env node
/**
 * Shared memory MCP. Grok, Cursor, and other MCP clients plug this in
 * to recall facts and the trail of builds. No API key. No paid calls.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const NEVER = new Set(["send", "post", "pay", "publish", "delete"]);

export function homeDir() {
  if (process.env.BRAIN_HOME) return process.env.BRAIN_HOME;
  if (process.env.LOCALAPPDATA) return path.join(process.env.LOCALAPPDATA, "BrainConnector");
  return path.join(os.homedir(), "AppData", "Local", "BrainConnector");
}

function memoryFile() {
  const dir = homeDir();
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "memory.json");
}

export function loadMemory() {
  try {
    const parsed = JSON.parse(fs.readFileSync(memoryFile(), "utf8"));
    return {
      facts: Array.isArray(parsed.facts) ? parsed.facts : [],
      trail: Array.isArray(parsed.trail) ? parsed.trail : [],
    };
  } catch {
    return { facts: [], trail: [] };
  }
}

export function saveMemory(mem) {
  fs.writeFileSync(
    memoryFile(),
    JSON.stringify(
      {
        facts: (mem.facts || []).slice(-40),
        trail: (mem.trail || []).slice(-20),
      },
      null,
      2,
    ),
  );
}

export function rememberFact(fact) {
  const text = String(fact || "").trim().slice(0, 400);
  if (!text) return { ok: false, text: "Nothing to remember." };
  const mem = loadMemory();
  mem.facts.push({ fact: text, at: new Date().toISOString() });
  mem.trail.push({ at: new Date().toISOString(), event: "remember", detail: text.slice(0, 120) });
  saveMemory(mem);
  return { ok: true, text: "Remembered.", fact: text };
}

export function recallFacts(query) {
  const facts = loadMemory().facts.map((m) => m.fact).filter(Boolean);
  const words = String(query || "")
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);
  if (!words.length) return facts.slice(-5);
  return facts
    .map((fact) => {
      const lower = fact.toLowerCase();
      let score = 0;
      for (const w of words) if (lower.includes(w)) score += 1;
      return { fact, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => r.fact);
}

export function addTrail(event, detail) {
  const mem = loadMemory();
  mem.trail.push({
    at: new Date().toISOString(),
    event: String(event || "note").slice(0, 40),
    detail: String(detail || "").slice(0, 240),
  });
  saveMemory(mem);
}

export function blockedAction(name) {
  return NEVER.has(String(name || "").toLowerCase());
}

const TOOLS = [
  {
    name: "brain_remember",
    description: "Store one short fact on this computer's Brain Connector memory.",
    inputSchema: { type: "object", properties: { fact: { type: "string" } }, required: ["fact"] },
  },
  {
    name: "brain_recall",
    description: "Search remembered facts by keyword. A local read; never spends a call.",
    inputSchema: { type: "object", properties: { query: { type: "string" } } },
  },
  {
    name: "brain_trail",
    description: "Show the recent trail of connects, builds, and remembers.",
    inputSchema: { type: "object", properties: {} },
  },
];

function callTool(name, args) {
  if (name === "brain_remember") {
    const out = rememberFact(args?.fact);
    return { isError: !out.ok, text: out.text };
  }
  if (name === "brain_recall") {
    const facts = recallFacts(args?.query);
    if (!facts.length) return { isError: false, text: "Nothing remembered about that yet." };
    return { isError: false, text: facts.map((f) => `- ${f}`).join("\n") };
  }
  if (name === "brain_trail") {
    const trail = loadMemory().trail.slice(-20);
    if (!trail.length) return { isError: false, text: "No trail yet." };
    return {
      isError: false,
      text: trail.map((t) => `${t.at}  ${t.event}  ${t.detail || ""}`).join("\n"),
    };
  }
  return { isError: true, text: `Unknown tool ${name}` };
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
        serverInfo: { name: "brain-memory", version: "1.1.0" },
      },
    };
  }
  if (msg.method === "tools/list") return { jsonrpc: "2.0", id, result: { tools: TOOLS } };
  if (msg.method === "tools/call") {
    const out = callTool(msg.params?.name, msg.params?.arguments || {});
    return {
      jsonrpc: "2.0",
      id,
      result: { content: [{ type: "text", text: out.text }], isError: out.isError },
    };
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

const runningThis = path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url);
if (runningThis) {
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
}
