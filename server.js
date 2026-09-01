/**
 * Static host for brandbyagents.com (Railway).
 * Pretty paths match netlify.toml redirects.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8080;

const PRETTY = {
  "/": "/index.html",
  "/try": "/try.html",
  "/connect": "/connect.html",
  "/grok": "/connect.html",
  "/download": "/download.html",
  "/dd": "/dd.html",
  "/beedee": "/beedee.html",
  "/how-it-works": "/how-it-works.html",
  "/trust": "/trust.html",
  "/compare": "/compare.html",
  "/pricing": "/pricing.html",
  "/about": "/about.html",
  "/business": "/business.html",
  "/roadmap": "/roadmap.html",
  "/agents": "/agents.html",
  "/jarvis": "/jarvis.html",
  "/download/dd": "/dd.html",
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".glb": "model/gltf-binary",
  ".apk": "application/vnd.android.package-archive",
  ".exe": "application/octet-stream",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function safeJoin(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const mapped = PRETTY[decoded.replace(/\/$/, "") || "/"] || decoded;
  const rel = path.normalize(mapped).replace(/^(\.\.[/\\])+/, "");
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) return null;
  return file;
}

function send(res, code, headers, body) {
  res.writeHead(code, headers);
  res.end(body);
}

const server = http.createServer((req, res) => {
  let file = safeJoin(req.url || "/");
  if (!file) return send(res, 403, { "Content-Type": "text/plain" }, "forbidden");

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      if (!path.extname(file)) {
        const html = file + ".html";
        if (fs.existsSync(html)) file = html;
        else return send(res, 404, { "Content-Type": "text/plain" }, "not found");
      } else {
        return send(res, 404, { "Content-Type": "text/plain" }, "not found");
      }
    }
    const ext = path.extname(file).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    const headers = {
      "Content-Type": type,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    };
    if (ext === ".apk") {
      headers["Content-Disposition"] = `attachment; filename="${path.basename(file)}"`;
    }
    res.writeHead(200, headers);
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Brand Agents site http://0.0.0.0:${PORT}`);
});
