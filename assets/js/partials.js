/** Brand Agents — brandbyagent.com shared chrome */
function brandHeader(active) {
  const items = [
    ["index.html", "Home"],
    ["index.html#choose", "Choose"],
    ["business.html", "Organizations"],
    ["download.html", "Get"],
    ["try.html", "Try"],
    ["connect.html", "Connector"],
  ];
  const links = items
    .map(
      ([href, label]) =>
        `<a href="${href}" data-nav class="${active === href ? "active" : ""}">${label}</a>`
    )
    .join("");
  return `
  <header class="site-header store-chrome">
    <div class="container nav">
      <a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true"></span> Brand Agents</a>
      <label class="store-search"><input data-store-search type="search" placeholder="Search apps" aria-label="Search apps" /></label>
      <button class="menu-btn" type="button" data-menu aria-label="Menu">Menu</button>
      <nav class="nav-links" data-nav-links>
        ${links}
      </nav>
      <div class="nav-actions">
        <button class="theme-toggle" type="button" data-theme-toggle title="Light or dark">◐</button>
        <a class="btn btn-primary btn-get" href="connect.html">Join the Click</a>
      </div>
    </div>
  </header>`;
}

function brandFooter() {
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="brand" href="index.html"><span class="brand-mark"></span> Brand Agents</a>
          <p class="footer-note">Grok is the brain. They click for you. You keep Send, Pay, and Post.</p>
          <p class="footer-note">brandbyagent.com · they click for you</p>
        </div>
        <div>
          <h4>Product</h4>
          <a href="index.html#choose">Choose your click</a>
          <a href="agents.html">Dale</a>
          <a href="dd.html">DD</a>
          <a href="beedee.html">BeeDee</a>
          <a href="business.html">Organizations</a>
          <a href="pricing.html">Pricing</a>
          <a href="download.html">Download</a>
        </div>
        <div>
          <h4>Resources</h4>
          <a href="how-it-works.html">How it works</a>
          <a href="trust.html">Trust</a>
          <a href="compare.html">Why Brand Agents</a>
          <a href="roadmap.html">Roadmap</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="about.html">About</a>
          <a href="about.html#contact">Contact</a>
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
        <span>More Brand Agents coming.</span>
      </div>
    </div>
  </footer>`;
}
