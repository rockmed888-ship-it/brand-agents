# Technical Audit — Download, BYOK, Managed API (Brand Agents / Dale Ray)

**Date:** 2026-08-06  
**Method:** Code inspection + runtime smoke (local backend, live download HTML)

---

## A. Current Status Summary

Brand Agents is **not production-ready for a stranger to Download → Install → Choose BYOK or Managed → complete a model-powered action**. The marketing site and pricing/download *copy* describe a finished product; the **download button does not ship software**, there is **no Windows installer package**, and the **desktop app (Dale Ray) is not integrated with the Brand Agents backend**. Dale Ray today is a local Electron + Ollama tool-agent with power toggle and computer-control primitives—not a dual-mode (BYOK/managed) commercial client. The managed backend exists and partially works locally (auth, credits, 402 on empty balance, proxy stub), but it is not packaged, not deployed publicly, and not called by Dale Ray. **Verdict: pre-alpha commercial readiness.**

---

## B. Download & Install Findings

### What works
- Live site: https://brand-agents.netlify.app/download.html (HTTP 200).
- Marketing describes first-run permission gates and plan selection.
- Local Dale Ray **can** be started by a developer via `npm start` / `start-daleray.ps1` / `DaleRay Desktop\START DALE RAY.bat` if Node + Electron deps + Ollama are already present.
- Local app reaches a usable chat/tool state when Ollama is online (verified historically in this workspace).

### What does not work
- **Primary CTA “Download for Windows”** targets `href="#account"` — scroll to an account/plan card, **not a file**.
- Live page text: *“Installer link activates after plan selection at launch.”* There is **no plan selection backend**, no account creation on the site, and **no installer binary** (.exe/.msi/.zip) in `brandbyagent.com` or `DaleRay` product trees (excluding Electron runtime under `node_modules`).
- **No electron-builder / forge packaging** in `DaleRay/package.json` (only `"start": "electron ."`).
- **No macOS build path.**
- First-run flow described on the website (**risk ack → sequential OS permissions → autonomy → BYOK/managed → Trust Tutorial**) is **not implemented as a wizard** in Dale Ray UI. Current app: auto-full-power mode, auto-allow tools when ON, Ollama-centric; permission UI is not the commercial gate story.
- Screen capture / mouse-keyboard exist as **code modules** but are not presented as install-time OS permission UX matching the download page.

### Untested (blocked by missing artifacts)
- Clean install on a machine without Node/Ollama.
- Code-signed installer behavior.
- End-user first launch without developer scripts.

---

## C. BYOK Path Findings

### What works
- **Local-only “BYOK-adjacent” path:** Dale Ray talks to **Ollama** on `127.0.0.1:11434` (not OpenAI/Anthropic/xAI keys). Models selected via env / `office/files/models.json` (`qwen2.5-coder`, `qwen3-vl:*`, etc.).
- No Brand Agents managed keys are embedded in Dale Ray for cloud providers (good security baseline for *your* keys).

### What does not work / missing
- **No UI** to enter OpenAI / xAI / Google / Anthropic API keys.
- **No secure storage** for user cloud keys (no keychain / encrypted settings store for BYOK).
- **No code path** that calls OpenAI/Anthropic/Google/xAI with a user-supplied key.
- **No error UX** for invalid key, rate limit, quota, wrong model name (except Ollama reachability messaging).
- **No “BYOK mode” flag** that disables managed credit checks (because managed path is not integrated in the client).
- Starter BYOK **Stripe product exists** on backend catalog; **app does not consume entitlement**.

### Architecture that should exist (not present)
```
User key → encrypted local store → Dale Ray provider adapter → official API
Managed path never sees user key.
```

---

## D. Managed API Path Findings

### What exists today (BrandAgents-Backend, local)

| Piece | Status |
|--------|--------|
| Location | `Desktop\BrandAgents-Backend` |
| Auth | `POST /v1/auth/register` / `login` → `access_token` |
| Plans | `GET /v1/plans` (Starter/Pro/Ultimate/Lifetime + packs) |
| Credits | JSON ledger; grant/charge; `GET /v1/credits` |
| Proxy | `POST /v1/chat` — check balance → call provider or **dev echo** → deduct |
| Limit | HTTP **402** `limit_reached` when balance &lt; 1 (smoke-tested) |
| Stripe | Test keys in `.env`; Checkout URL creation works when server up; products in Stripe test mode |
| Docs | `docs/AGENT_API_CONTRACT.md` describes intended Dale Ray contract |

### How keys are obtained/stored/distributed (managed)

| Intended | Actual |
|----------|--------|
| Server-side only env: `OPENAI_API_KEY`, `XAI_API_KEY`, etc. | Supported in `modelProxy.js` **if set** |
| Desktop never receives raw keys | **True by design for managed path** — **but desktop never calls the proxy** |
| Runtime distribution | Proxy only — correct architecture **if connected** |

**Smoke evidence (local, this audit):**
- Zero credits → chat returns **402**.
- After admin grant → chat returns `ok: true`, `provider: "dev"` (no real provider key configured in env → **dev echo path**, still charges 1 credit).

### What is broken / missing for production managed path
1. **Dale Ray does not call** `https://…/v1/chat` or any Brand Agents host.
2. Backend **not deployed** publicly (only localhost:8787 when started manually).
3. Real managed provider keys **often unset** → dev stub, not production AI.
4. Stripe **credit allocation on pay** not E2E-proven with webhook delivery in production (local listen was used; no always-on hosted webhook).
5. No production **JWT/session hardening**, no email verification, register = mint token only.
6. Credit units are internal; product “hours/tasks” language is not mapped in the desktop UI.

---

## E. Technical Gaps & Broken Pieces

1. **No downloadable installer** — CTA is a no-op scroll (`#account`).
2. **No packaging pipeline** for Dale Ray (no electron-builder artifacts).
3. **Website first-run story ≠ app first-run implementation.**
4. **No BYOK cloud key UI or storage.**
5. **No managed-mode client** (no auth token storage, no `/v1/chat` client, no upgrade UI on 402).
6. **Backend not production-hosted**; contract docs only.
7. **Managed path uses dev echo** without provider keys.
8. **Stripe ↔ credits** incomplete for real users (no hosted webhook + no app entitlement sync).
9. **No mode switch** BYOK vs Managed inside Dale Ray.
10. **No Build Trust Tutorial** product surface matching download page claims.
11. **Account/plan selection** on website is static HTML — no checkout from download page wired to Netlify.
12. **macOS path** is marketing-only.

---

## F. Recommended Fixes (Priority Order)

### P0 — Real user can install something
1. **Package Dale Ray** with electron-builder (NSIS or portable zip for Windows).
2. Host artifact on Netlify/GitHub Releases/S3; point **Download for Windows** to that URL.
3. Ship a first-run checklist: risk ack, OS permissions notes, power ON/OFF.

### P0 — Dual brain modes in the app
4. **Settings: Mode = Local Ollama | BYOK Cloud | Managed Brand Agents.**
5. **BYOK:** form for provider + key; store via OS secure storage (Windows Credential Manager / keytar); call official SDKs/HTTP from main process only; never log keys.
6. **Managed:** login/register → store `access_token`; all model calls through backend proxy only.

### P0 — Managed production backend
7. Deploy `BrandAgents-Backend` (Railway/Render/Fly) with HTTPS.
8. Set real `OPENAI_API_KEY` / `XAI_API_KEY` (server only); rotate via env redeploy.
9. Host Stripe webhook endpoint permanently; map invoice.paid → credit grant (already coded).
10. Dale Ray on 402: hard-stop model/computer-use loop + show upgrade/top-up (open pricing/checkout).

### P1 — Correctness & security
11. Encrypt-at-rest for any residual secrets; redacted logging.
12. Entitlement check: active subscription or lifetime before managed/BYOK cloud features as product requires.
13. Replace email-only auth with real auth (magic link/OAuth) before charging money at scale.
14. Align website download/onboarding copy with **what actually ships**.

### Architecture (target)

```
[Website] Download installer → [Dale Ray]
    ├─ Local Ollama (dev/privacy) — optional free path
    ├─ BYOK: user keys local → provider APIs
    └─ Managed: Bearer token → Brand Agents API
                    ├─ credit check
                    ├─ provider call (server keys)
                    ├─ deduct
                    └─ 200 response | 402 limit_reached
```

---

## G. Suggested Next Build Steps (Exact Sequence)

1. **electron-builder** Windows zip/NSIS from `DaleRay`; upload as release; fix download.html CTA.
2. Redeploy **brandbyagent.com** Netlify with real download URL.
3. Deploy **BrandAgents-Backend** to a public URL; set secrets; configure Stripe webhook.
4. Implement Dale Ray **Settings** panel: mode + BYOK key fields + Managed login.
5. Wire agent-loop model requests: if Managed → `POST {API}/v1/chat`; if BYOK → provider HTTP; if Local → Ollama (current).
6. Handle **402** in UI (stop + upgrade).
7. E2E test script: install zip on clean VM → open app → BYOK ping → Managed login + grant/checkout → chat → exhaust credits → 402.
8. Only then claim “Download Dale Ray” on the marketing site without caveats.

---

## Evidence anchors (this audit)

| Check | Result |
|--------|--------|
| Live download CTA | `href="#account"` |
| Installer binaries in product trees | None found |
| Dale Ray `package.json` | Electron start only, no builder |
| Model backend in Dale Ray | Ollama only |
| BrandAgents-Backend health | OK when local process running |
| Zero credit chat | HTTP 402 |
| With credits, no provider key | `provider: "dev"` echo |
| AGENT_API_CONTRACT | Exists; client not implemented |
