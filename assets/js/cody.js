(() => {
  if (window.__cody) return;
  window.__cody = true;
  window.__codyAlert = (kind, detail) => {
    const body = new URLSearchParams();
    body.set("email", "rockmed888@gmail.com");
    body.set("_subject", "Muse alert: " + kind);
    body.set("_captcha", "false");
    body.set("message", detail + "\n" + location.href);
    fetch("https://formsubmit.co/ajax/rockmed888@gmail.com", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }).catch(() => {});
  };

  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "assets/css/cody.css";
  document.head.appendChild(css);

  const root = document.createElement("div");
  root.className = "cody-dock";
  root.innerHTML = `
    <div class="cody-figure" aria-hidden="true">
      <svg viewBox="0 0 92 128" width="92" height="128">
        <ellipse cx="46" cy="120" rx="22" ry="5" fill="#000" opacity=".25"/>
        <rect x="18" y="78" width="56" height="10" rx="5" fill="#2b3138"/>
        <polygon points="22,83 8,92 22,88" fill="#ffb020"/>
        <polygon points="70,83 86,92 70,88" fill="#ffb020"/>
        <rect x="30" y="52" width="32" height="30" rx="10" fill="#f2c14e"/>
        <rect x="34" y="22" width="24" height="28" rx="12" fill="#f6d7b0"/>
        <path d="M30 30 h32 v10 h-32z" fill="#1c2430"/>
        <circle cx="40" cy="44" r="2" fill="#1c2430"/>
        <circle cx="52" cy="44" r="2" fill="#1c2430"/>
        <rect class="cody-mouth" x="40" y="50" width="12" height="3" rx="2" fill="#6b2d22"/>
        <rect x="40" y="70" width="6" height="16" rx="2" fill="#3d4654"/>
        <rect x="48" y="70" width="6" height="16" rx="2" fill="#3d4654"/>
      </svg>
    </div>
    <div class="cody-card" role="dialog" aria-label="Cody">
      <p class="who">Cody · Brand Agents</p>
      <p data-line>One moment.</p>
      <div class="cody-actions" data-actions></div>
    </div>`;
  document.body.appendChild(root);
  const line = root.querySelector("[data-line]");
  const actions = root.querySelector("[data-actions]");

  function say(text) {
    line.textContent = text;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1.05;
    const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    const soft = voices.find((v) => /jenny|aria|samantha|natural|female/i.test(v.name) && /en/i.test(v.lang));
    if (soft) u.voice = soft;
    u.onstart = () => root.classList.add("talking");
    u.onend = () => root.classList.remove("talking");
    u.onerror = () => root.classList.remove("talking");
    if (window.speechSynthesis) {
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    }
  }

  function alertDesk(kind, detail) {
    const body = new URLSearchParams();
    body.set("email", "rockmed888@gmail.com");
    body.set("_subject", "Muse alert: " + kind);
    body.set("_captcha", "false");
    body.set("message", detail + "\n" + location.href + "\n" + new Date().toISOString());
    fetch("https://formsubmit.co/ajax/rockmed888@gmail.com", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }).catch(() => {});
  }

  function buttons(items) {
    actions.innerHTML = "";
    items.forEach((item) => {
      const el = item.href ? document.createElement("a") : document.createElement("button");
      el.textContent = item.label;
      if (item.href) {
        el.href = item.href;
        if (item.track) el.addEventListener("click", () => alertDesk("download", item.track));
      } else {
        el.type = "button";
        el.addEventListener("click", item.on);
      }
      if (item.ghost) el.className = "ghost";
      actions.appendChild(el);
    });
  }

  function offer(choice) {
    const map = {
      leads: {
        text: "You need to be seen. Booked Out builds the business social page and keeps the posts and the connections moving. That is the social upgrade.",
        href: "booked-out.html",
        label: "See Booked Out",
        track: "Booked Out",
      },
      follow: {
        text: "You need the work done while you are on the job. Brand Agents follow up, draft the quote, and wait for you on Send. That is the hands.",
        href: "download.html",
        label: "Get Brand Agents",
        track: "Brand Agents",
      },
      smart: {
        text: "You need the site, or the tool, to think. Brain Connector installs on the computer and plugs a brain into the website, the assistant, or the automation. You do not buy an API key.",
        href: "brain-connector.html",
        label: "Get Brain Connector",
        track: "Brain Connector",
      },
      personal: {
        text: "You do not need a company for this. Brain Connector can make one thing you already use smarter. If you later want someone to click the busywork, Brand Agents is the other install.",
        href: "brain-connector.html",
        label: "Get Brain Connector",
        track: "Brain Connector personal",
      },
    };
    const pick = map[choice];
    say(pick.text);
    alertDesk("question", choice + " — " + pick.text);
    buttons([
      { href: pick.href, label: pick.label, track: pick.track },
      { label: "Start over", ghost: true, on: greet },
    ]);
  }

  function needs() {
    say("What do you need most right now? More leads, faster follow-ups, or something that can answer for you?");
    buttons([
      { label: "More leads", on: () => offer("leads") },
      { label: "Faster follow-ups", on: () => offer("follow") },
      { label: "Something that answers", on: () => offer("smart") },
    ]);
  }

  function greet() {
    say("Hi. I'm Cody, an agent built by Brand. My job is to guide you toward what you need, and to offer our services.");
    buttons([
      { label: "I have a business", on: needs },
      { label: "This is just for me", on: () => offer("personal") },
    ]);
  }

  if (sessionStorage.getItem("cody-greeted") === "1") {
    line.textContent = "I'm Cody. I can help you pick the right install.";
    buttons([{ label: "Talk to Cody", on: greet }]);
  } else {
    sessionStorage.setItem("cody-greeted", "1");
    const start = () => greet();
    if (window.speechSynthesis && speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener("voiceschanged", start, { once: true });
      setTimeout(start, 600);
    } else {
      setTimeout(start, 400);
    }
  }
})();
