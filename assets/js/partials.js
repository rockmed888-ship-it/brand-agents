/** Brand Agents — brandbyagent.com shared chrome */
function brandHeader(active) {
  const items = [
    ["index.html", "Product"],
    ["business.html", "Business"],
    ["how-it-works.html", "How it works"],
    ["pricing.html", "Pricing"],
    ["connect.html", "Grok connector"],
    ["try.html", "Try"],
    ["download.html", "Download"],
    ["dd.html", "DD phone"],
    ["beedee.html", "BeeDee"],
    ["trust.html", "Trust"],
  ];
  const links = items
    .map(
      ([href, label]) =>
        `<a href="${href}" data-nav class="${active === href ? "active" : ""}">${label}</a>`
    )
    .join("");
  return `
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true"></span> Brand Agents</a>
      <button class="menu-btn" type="button" data-menu aria-label="Menu">Menu</button>
      <nav class="nav-links" data-nav-links>
        ${links}
        <a href="about.html" data-nav class="${active === "about.html" ? "active" : ""}">About</a>
      </nav>
      <div class="nav-actions">
        <a class="link-quiet" href="download.html#account">Sign in</a>
        <a class="btn btn-primary" href="connect.html">Get hands</a>
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
          <p class="footer-note">Grok is the brain. Dale Ray is computer Jarvis. DD is phone Jarvis. You keep Send, Pay, and Post.</p>
          <p class="footer-note">brandbyagent.com</p>
        </div>
        <div>
          <h4>Product</h4>
          <a href="agents.html">Dale Ray</a>
          <a href="dd.html">DD phone</a>
          <a href="business.html">Business</a>
          <a href="pricing.html">Pricing</a>
          <a href="download.html">Download</a>
        </div>
        <div>
          <h4>Resources</h4>
          <a href="how-it-works.html">How it works</a>
          <a href="trust.html#tutorial">Trust tutorial</a>
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
