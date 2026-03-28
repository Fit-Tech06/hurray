(function () {
  const cfg = window.BIRTHDAY_CONFIG || {};

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function ageFromBirthYear(birthYear, monthIndex, day) {
    const now = new Date();
    let age = now.getFullYear() - birthYear;
    if (now.getMonth() < monthIndex || (now.getMonth() === monthIndex && now.getDate() < day)) {
      age -= 1;
    }
    return age;
  }

  function applyConfig() {
    const name = cfg.sisterName || "Sis";
    const tag = cfg.heroTagline || "Happy Birthday";
    $("#heroName").textContent = `${tag}, ${name}`;

    const kicker = $("#heroKicker");
    if (kicker && cfg.birthYear) {
      const age = ageFromBirthYear(cfg.birthYear, 2, 28);
      kicker.textContent = `March 28 · born ${cfg.birthYear} · ${age} years of you`;
    }

    if (cfg.letter) {
      $("#letterGreeting").textContent = cfg.letter.greeting || "Dear sister,";
      $("#letterBody").textContent = cfg.letter.body || "";
      $("#letterSignoff").textContent = cfg.letter.signoff || "";
    }

    if (cfg.footer) {
      $("#footerLine").textContent = cfg.footer;
    }

    renderMemoryCards();
    renderGallery();
  }

  function renderMemoryCards() {
    const grid = $("#memoryCards");
    const items = cfg.memories || [];
    grid.innerHTML = "";
    items.forEach((m, i) => {
      const card = document.createElement("div");
      card.className = "memory-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `Memory ${i + 1}. Tap to flip.`);
      const frontText = m.frontText != null ? m.frontText : m.front || "";
      card.innerHTML = `
        <div class="memory-card__inner">
          <div class="memory-card__face memory-card__front">
            <div class="memory-card__bg" aria-hidden="true"></div>
            <div class="memory-card__scrim" aria-hidden="true"></div>
            <p class="memory-card__fronttext">${escapeHtml(frontText)}</p>
          </div>
          <div class="memory-card__face memory-card__back">${escapeHtml(m.back)}</div>
        </div>
      `;
      const bg = card.querySelector(".memory-card__bg");
      if (bg && m.frontImage) {
        bg.style.backgroundImage = `url("${String(m.frontImage).replace(/"/g, "\\\"")}")`;
      }
      function toggle() {
        card.classList.toggle("is-flipped");
      }
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
      grid.appendChild(card);
    });
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderGallery() {
    const el = $("#photoGallery");
    const photos = cfg.photos || [];
    el.innerHTML = "";
    photos.forEach((p) => {
      const item = document.createElement("div");
      item.className = "gallery__item";
      if (p.src) {
        const img = document.createElement("img");
        img.src = p.src;
        img.alt = p.alt || "";
        img.loading = "lazy";
        item.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "gallery__placeholder";
        ph.textContent = p.alt || "Add a photo in config.js";
        item.appendChild(ph);
      }
      el.appendChild(item);
    });
  }

  /* --- Twinkling stars --- */
  function initStars() {
    const canvas = $("#stars");
    const ctx = canvas.getContext("2d");
    let stars = [];
    let w = 0;
    let h = 0;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(120, Math.floor((w * h) / 14000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * Math.PI * 2,
        sp: 0.015 + Math.random() * 0.03,
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        s.tw += s.sp;
        const a = 0.35 + Math.sin(s.tw) * 0.35;
        ctx.beginPath();
        ctx.fillStyle = `rgba(245, 230, 255, ${a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    resize();
    frame();
  }

  /* --- Confetti --- */
  function initConfetti() {
    const btn = $("#confettiBtn");
    btn.addEventListener("click", burstConfetti);
  }

  function burstConfetti() {
    const n = 90;
    const colors = ["#e8a87c", "#f4c4a8", "#ffd8b8", "#c9a0dc", "#fff5ee", "#ff8cc8"];
    const rect = $("#confettiBtn").getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      const size = 6 + Math.random() * 8;
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const speed = 4 + Math.random() * 6;
      el.style.cssText = [
        "position:fixed",
        "left:" + cx + "px",
        "top:" + cy + "px",
        "width:" + size + "px",
        "height:" + (size * 0.4 + 4) + "px",
        "background:" + colors[Math.floor(Math.random() * colors.length)],
        "border-radius:2px",
        "pointer-events:none",
        "z-index:9999",
        "will-change:transform,opacity",
      ].join(";");
      document.body.appendChild(el);

      let vx = Math.cos(angle) * speed * (0.5 + Math.random());
      let vy = Math.sin(angle) * speed - 3;
      let x = 0;
      let y = 0;
      let rot = Math.random() * 360;
      let op = 1;
      const g = 0.18;

      function step() {
        vy += g;
        x += vx;
        y += vy;
        rot += vx * 2;
        op -= 0.008;
        el.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg)`;
        el.style.opacity = String(Math.max(0, op));
        if (op > 0) requestAnimationFrame(step);
        else el.remove();
      }
      requestAnimationFrame(step);
    }
  }

  /* --- Envelope --- */
  function initEnvelope() {
    const env = $("#envelope");
    function open() {
      env.classList.add("is-open");
      env.setAttribute("aria-expanded", "true");
    }
    env.addEventListener("click", open);
    env.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  }

  /* --- Secret number --- */
  function initSecret() {
    const form = $("#secretForm");
    const input = $("#secretInput");
    const msg = $("#secretMessage");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const expected = (cfg.secretNumber != null ? cfg.secretNumber : cfg.secretWord || "")
        .toString()
        .trim();
      const attempt = (input.value || "").trim();
      if (expected && attempt === expected) {
        msg.textContent = cfg.secretMessage || "Surprise!";
        msg.hidden = false;
        burstConfetti();
      } else {
        msg.textContent = "Not quite — try the number that started it all.";
        msg.hidden = false;
      }
    });
  }

  /* --- Candle --- */
  function initCandle() {
    const flame = $("#flame");
    const candle = $("#candle");
    const status = $("#wishStatus");
    let out = false;

    function blow() {
      if (out) return;
      out = true;
      flame.classList.add("is-out");
      status.textContent = "Wish made — may the next year move you closer to everything you’re working for.";
      burstConfetti();
    }

    candle.addEventListener("click", blow);
    candle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        blow();
      }
    });
  }

  /* --- Scroll reveal --- */
  function initReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            if (en.target.classList.contains("hero-kicker")) {
              en.target.nextElementSibling?.querySelectorAll(".hero-line").forEach((line, i) => {
                setTimeout(() => line.classList.add("is-visible"), 80 * i);
              });
            }
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    els.forEach((el) => io.observe(el));

    const heroBits = [".hero-kicker", ".hero-name", ".hero-sub", "#confettiBtn"];
    heroBits.forEach((sel, i) => {
      const el = $(sel);
      if (el) {
        setTimeout(() => el.classList.add("is-visible"), 120 * i);
      }
    });
    $(".hero-title .hero-line")?.classList.add("is-visible");
    setTimeout(() => $(".hero-title .hero-line--accent")?.classList.add("is-visible"), 200);
  }

  applyConfig();
  initStars();
  initConfetti();
  initEnvelope();
  initSecret();
  initCandle();
  initReveal();
})();

