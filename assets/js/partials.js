/** Brand Agents — shared chrome */
function brandHeader(active) {
  const items = [
    ["index.html", "Home"],
    ["how-it-works.html", "How it works"],
    ["connect.html", "Trial"],
    ["download.html", "Get"],
  ];
  const navMap = {
    "try.html": "connect.html",
    "dd.html": "download.html",
    "beedee.html": "download.html",
  };
  const navOn = navMap[active] || active;
  const links = items
    .map(
      ([href, label]) =>
        `<a href="${href}" data-nav class="${navOn === href ? "active" : ""}">${label}</a>`
    )
    .join("");

  const journeyMap = {
    "index.html": "index.html",
    "how-it-works.html": "how-it-works.html",
    "connect.html": "connect.html",
    "try.html": "connect.html",
    "download.html": "download.html",
    "dd.html": "download.html",
    "beedee.html": "download.html",
  };
  const journeyOn = journeyMap[active] || active;
  const journey = [
    ["index.html", "Home"],
    ["connect.html", "Trial"],
    ["download.html", "Get"],
    ["how-it-works.html#in-app", "App"],
  ]
    .map(([href, label], i) => {
      const key = href.split("#")[0];
      const on = journeyOn === key || (label === "App" && active === "how-it-works.html");
      const arrow = i ? `<span class="journey-arrow" aria-hidden="true">→</span>` : "";
      return `${arrow}<a href="${href}" class="${on ? "on" : ""}">${label}</a>`;
    })
    .join("");

  return `
  <header class="site-header store-chrome">
    <div class="container nav">
      <a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true"></span> Brand Agents</a>
      <label class="store-search"><input data-store-search type="search" placeholder="Search Patch, BeeDee, Windows" aria-label="Search apps" /></label>
      <button class="menu-btn" type="button" data-menu aria-label="Menu">Menu</button>
      <nav class="nav-links" data-nav-links>
        ${links}
      </nav>
      <div class="nav-actions">
        <button class="theme-toggle" type="button" data-theme-toggle title="Light or dark">◐</button>
        <a class="btn btn-primary btn-get" href="connect.html">Start trial</a>
      </div>
    </div>
  </header>
  <nav class="journey-bar" aria-label="Your path">${journey}</nav>`;
}

function brandFooter() {
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="brand" href="index.html"><span class="brand-mark"></span> Brand Agents</a>
          <p class="footer-note">Grok is the brain. Pets click. You stay on Send, Pay, and Post.</p>
          <p class="footer-note">Join the Click · brandbyagents.com</p>
        </div>
        <div>
          <h4>Product</h4>
          <a href="index.html#explore">Explore Patch &amp; BeeDee</a>
          <a href="how-it-works.html">How it works</a>
          <a href="connect.html">Start trial</a>
          <a href="download.html">Get Brand Agents</a>
          <a href="dd.html">Patch on Android</a>
          <a href="beedee.html">BeeDee on Android</a>
        </div>
        <div>
          <h4>Resources</h4>
          <a href="try.html">Try on your phone</a>
          <a href="trust.html">Trust</a>
          <a href="compare.html">Why Brand Agents</a>
          <a href="business.html">Organizations</a>
          <a href="roadmap.html">Roadmap</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="about.html">About</a>
          <a href="about.html#contact">Contact</a>
          <a href="pricing.html">Pricing</a>
        </div>
        <div>
          <h4>Legal</h4>
          <a href="legal/privacy.html">Privacy</a>
          <a href="legal/terms.html">Terms</a>
          <a href="legal/disclaimer.html">Risk disclosure</a>
          <a href="legal/acceptable-use.html">Acceptable use</a>
          <a href="trust.html">Permissions &amp; control</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span data-year></span> Brand Agents</span>
        <span>Phone apps are free. The trial is the Grok Server URL.</span>
      </div>
    </div>
  </footer>`;
}
