#!/usr/bin/env node
import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";

const home = path.join(os.homedir(), "AppData", "Local", "BrainConnector");
const stateFile = path.join(home, "plug.json");
fs.mkdirSync(home, { recursive: true });

function readState() {
  try {
    return JSON.parse(fs.readFileSync(stateFile, "utf8"));
  } catch {
    return { plug: null };
  }
}
function writeState(state) {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function scan() {
  const bases = [process.env.ProgramFiles, process.env["ProgramFiles(x86)"], path.join(os.homedir(), "AppData", "Local")].filter(Boolean);
  const editors = [
    ["premiere", "Adobe Premiere Pro", ["Adobe"]],
    ["davinci", "DaVinci Resolve", ["Blackmagic Design"]],
    ["capcut", "CapCut", ["CapCut"]],
  ];
  const plugs = [
    { id: "calculator", label: "Calculator", found: true, where: "calc.exe" },
    { id: "website", label: "Website", found: true, where: "a folder or URL you name" },
  ];
  for (const [id, label, roots] of editors) {
    let where = "";
    for (const base of bases) {
      for (const root of roots) {
        const dir = path.join(base, root);
        if (fs.existsSync(dir)) where = dir;
      }
    }
    plugs.push({ id, label, found: Boolean(where), where: where || "not installed" });
  }
  return plugs;
}

function printPlugs() {
  for (const plug of scan()) console.log(`${plug.found ? "ready" : "missing"}  ${plug.id}  ${plug.label}  ${plug.where}`);
  const current = readState().plug;
  console.log(current ? `Plugged into ${current.label}.` : "Nothing plugged in.");
}

function play(plug) {
  if (!plug) return console.log("Plug something first.");
  if (plug.id === "calculator") {
    spawn("calc.exe", [], { detached: true, stdio: "ignore" }).unref();
    return console.log("Calculator is open.");
  }
  const exe = path.join(plug.where || "", "Apps", "CapCut.exe");
  if (fs.existsSync(exe)) {
    spawn(exe, [], { detached: true, stdio: "ignore" }).unref();
    return console.log("CapCut is open.");
  }
  if (plug.where && fs.existsSync(plug.where)) spawn("explorer.exe", [plug.where], { detached: true, stdio: "ignore" }).unref();
  console.log(`${plug.label} is plugged in.`);
}

function mcpServer() {
  const beside = path.join(home, "local-mcp.mjs");
  if (fs.existsSync(beside)) return beside;
  const nextToCli = path.join(path.dirname(process.argv[1] || ""), "local-mcp.mjs");
  if (fs.existsSync(nextToCli)) return nextToCli;
  return beside;
}

function build(argv) {
  const val = (flag) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] || "" : "";
  };
  const kind = (val("--kind") || "website").toLowerCase();
  const tier = (val("--tier") || "hobby").toLowerCase();
  const name = val("--name").trim();
  const source = val("--source").trim();
  const actions = (val("--actions") || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const tiers = { hobby: 1000, learner: 3000, brilliant: 10000 };
  const usage = [
    'Usage: brain build --kind website --tier hobby --name "Your shop" --source "What the brain is allowed to know."',
    'For an assistant or an automation, add --actions "book,quote".',
    "The brain answers only from that note. It does not send, post, or pay.",
  ];
  if (!name || !source) {
    console.log(usage.join("\n"));
    process.exit(1);
  }
  if (!["website", "assistant", "automation"].includes(kind)) {
    console.log("Kind must be website, assistant, or automation.");
    process.exit(1);
  }
  if ((kind === "assistant" || kind === "automation") && actions.length === 0) {
    console.log('List --actions this assistant or automation may take. Example: --actions "book,quote"');
    process.exit(1);
  }
  if (!tiers[tier]) {
    console.log("Tier must be hobby, learner, or brilliant.");
    process.exit(1);
  }
  const blocked = actions.filter((name) => ["send", "post", "pay", "publish", "delete"].includes(name));
  if (blocked.length) {
    console.log("Send, post, and pay stay with you. Leave those off --actions.");
    process.exit(1);
  }
  const id = "bc_" + Date.now().toString(16);
  const dir = path.join(home, "connectors", id);
  fs.mkdirSync(dir, { recursive: true });
  const server = mcpServer();
  const record = {
    id,
    name,
    kind,
    tier,
    calls: tiers[tier],
    used: 0,
    source,
    actions: kind === "website" ? [] : actions,
  };
  const recordPath = path.join(dir, "connector.json");
  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shop";
  const mcp = {
    mcpServers: {
      [slug + "-brain"]: {
        command: process.execPath,
        args: [server, recordPath],
      },
    },
  };
  const file = path.join(dir, "mcp.json");
  fs.writeFileSync(file, JSON.stringify(mcp, null, 2));
  if (!fs.existsSync(server)) {
    console.log("Built the connector, but local-mcp.mjs is missing next to brain.");
    console.log("Run the Brain Connector install again, then rebuild.");
  }
  console.log(`Built ${kind} on ${tier}. ${tiers[tier]} calls.`);
  console.log(`MCP file: ${file}`);
  console.log("It answers only from the notes you passed. It does not send, post, or pay.");
}

const args = process.argv.slice(2);
if (args[0] === "plugs") printPlugs();
else if (args[0] === "plug") {
  const plugs = scan();
  const found = plugs.find((p) => p.id === args[1]);
  if (!found || !found.found) console.log("Cannot plug that. Type: brain plugs");
  else {
    if (args[1] === "website" && args[2]) found.where = args.slice(2).join(" ");
    const state = readState();
    state.plug = found;
    writeState(state);
    console.log(`Plugged into ${found.label}.`);
  }
} else if (args[0] === "play") play(readState().plug);
else if (args[0] === "build") build(args);
else {
  console.log("brain plugs");
  console.log("brain plug calculator | website <path> | capcut | premiere | davinci");
  console.log("brain play");
  console.log('brain build --kind website --tier hobby --name "Your shop" --source "What the brain is allowed to know."');
}
