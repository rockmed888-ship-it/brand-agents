# Brand Agents site

**Website for Brand Agents** (the business and product).

| | |
|--|--|
| **Business name** | Brand Agents |
| **Product** | A named agent on your desk. It clicks. You stay on Send. |
| **SKU** | Starter · 3-day trial · then $29/mo |
| **Domain** | https://brandbyagents.com |

> This folder is the **website only**.  
> It does **not** modify the Windows desktop app at `Desktop\DaleRay`.

## Open locally

Double-click `index.html`, or:

```powershell
cd "$env:USERPROFILE\OneDrive\Desktop\brandbyagent.com"
Start-Process index.html
```

## Site map

| Page | File |
|------|------|
| Home | `index.html` |
| How it works | `how-it-works.html` |
| Trust & control | `trust.html` |
| Compare | `compare.html` |
| Pricing | `pricing.html` |
| Download | `download.html` |
| Agents | `agents.html` |
| About | `about.html` |
| Roadmap | `roadmap.html` |
| Legal | `legal/*` |
| Spec | `docs/PRODUCT_SPEC.md` |

## Deploy

Live: https://brandbyagents.com  
GitHub Pages fallback: https://rockmed888-ship-it.github.io/brand-agents/

```powershell
cd "$env:USERPROFILE\OneDrive\Desktop\brandbyagent.com"
npx netlify-cli deploy --prod --dir .
```
