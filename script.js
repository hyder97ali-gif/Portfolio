(() => {
  "use strict";

  const root = document.getElementById("pilot-root");
  const rm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const INTRO_SEQUENCE = true;
  let frozen = false;

  // ---------- clock ----------
  function tickClock() {
    const el = document.getElementById("hud-clock");
    if (el) el.textContent = new Date().toISOString().slice(11, 19);
  }
  tickClock();
  setInterval(tickClock, 1000);

  // ---------- hero entrance ----------
  function prepHidden() {
    const base = INTRO_SEQUENCE ? 2150 : 120;
    document.querySelectorAll("[data-hero-in]").forEach((el, i) => {
      const plx = el.hasAttribute("data-parallax");
      el.style.animation = (plx ? "heroFade" : "heroRise") + " .85s cubic-bezier(.2,.7,.2,1) both";
      el.style.animationDelay = base + i * 80 + "ms";
    });
  }

  function guardVisibility() {
    const forceAll = () => {
      document.querySelectorAll("[data-hero-in],[data-reveal]").forEach((el) => {
        el.style.animation = "none";
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.filter = "none";
      });
    };
    const forceHero = () => {
      document.querySelectorAll("[data-hero-in]").forEach((el) => {
        el.style.animation = "none";
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    };
    setTimeout(() => {
      const el = document.querySelector("[data-hero-in]");
      let pending = false;
      if (el && el.getAnimations) {
        const a = el.getAnimations()[0];
        if (a && a.startTime == null) pending = true;
      }
      if (pending) {
        frozen = true;
        forceAll();
      }
    }, 320);
    const base = INTRO_SEQUENCE ? 2150 : 120;
    setTimeout(forceHero, base + 1500);
  }

  // ---------- scroll reveal ----------
  let io;
  function setupReveal() {
    if (rm) {
      document.querySelectorAll("[data-reveal]").forEach((e) => {
        e.style.opacity = "1";
        e.style.transform = "none";
        e.style.filter = "none";
      });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const el = en.target;
            io.unobserve(el);
            const plx = el.hasAttribute("data-parallax");
            if (frozen) {
              el.style.animation = "none";
              el.style.opacity = "1";
              el.style.transform = "none";
              el.style.filter = "none";
              return;
            }
            const d = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
            el.style.opacity = "";
            el.style.animation = (plx ? "revealFade" : "revealRise") + " .9s cubic-bezier(.2,.7,.2,1) both";
            el.style.animationDelay = d + "ms";
            setTimeout(() => {
              el.style.animation = "none";
              el.style.opacity = "1";
              if (!plx) el.style.transform = "none";
              el.style.filter = "none";
            }, d + 1400);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
    }
    document.querySelectorAll("[data-reveal]:not([data-rev-init])").forEach((el) => {
      el.setAttribute("data-rev-init", "1");
      el.style.opacity = "0";
      io.observe(el);
    });
  }

  // ---------- nav spy ----------
  let nio;
  function setupNavSpy() {
    const links = [...document.querySelectorAll("[data-navlink]")];
    if (!links.length) return;
    const secs = [...document.querySelectorAll("main section[id]")];
    if (!secs.length) return;
    if (nio) nio.disconnect();
    nio = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const id = en.target.id;
            links.forEach((l) => {
              const on = l.getAttribute("data-navlink") === id;
              l.style.color = on ? "var(--ink)" : "";
              const u = l.querySelector("[data-underline]");
              if (u) u.style.width = on ? "100%" : "0";
            });
          }
        });
      },
      { threshold: 0, rootMargin: "-45% 0px -50% 0px" }
    );
    secs.forEach((s) => nio.observe(s));
  }

  // ---------- résumé links ----------
  function setupResume() {
    const url = "assets/docs/Shaikh-Hyder-Ali-Ahmed-Resume.pdf";
    document.querySelectorAll("[data-resume]").forEach((a) => {
      a.setAttribute("href", url);
      a.setAttribute("download", "Shaikh-Hyder-Ali-Ahmed-Resume.pdf");
    });
  }

  // ---------- mobile menu ----------
  function toggleMenu() {
    const m = document.querySelector("[data-menu]");
    if (!m) return;
    const open = m.getAttribute("data-open") === "1";
    m.setAttribute("data-open", open ? "0" : "1");
    m.style.opacity = open ? "0" : "1";
    m.style.pointerEvents = open ? "none" : "auto";
    m.style.transform = open ? "translateY(-8px)" : "none";
  }
  function closeMenu() {
    const m = document.querySelector("[data-menu]");
    if (!m) return;
    m.setAttribute("data-open", "0");
    m.style.opacity = "0";
    m.style.pointerEvents = "none";
    m.style.transform = "translateY(-8px)";
  }

  // ---------- PILOT wireframe tabs ----------
  const WF_TITLES = { dash: "Command Dashboard", osint: "OSINT Workspace", threat: "Threat Monitor", audit: "Operations & AI Audit" };
  function setWF(id) {
    document.querySelectorAll("[data-wf-screen]").forEach((s) => {
      s.classList.toggle("active", s.getAttribute("data-wf-screen") === id);
    });
    document.querySelectorAll("[data-wf]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-wf") === id);
    });
    document.querySelectorAll("[data-rail]").forEach((r) => {
      r.classList.toggle("active", r.getAttribute("data-rail") === id);
    });
    const t = document.querySelector("[data-wf-title]");
    if (t && WF_TITLES[id]) t.textContent = WF_TITLES[id];
  }

  // ---------- contact form ----------
  function handleSubmit(f) {
    const g = (k) => f.querySelector('[data-field="' + k + '"]');
    const setErr = (k, msg) => {
      const el = f.querySelector('[data-err="' + k + '"]');
      if (el) {
        el.textContent = msg || "";
        el.classList.toggle("show", !!msg);
      }
      const inp = g(k);
      if (inp) inp.style.borderColor = msg ? "#ff5d6c" : "var(--line)";
    };
    const name = (g("name") && g("name").value.trim()) || "";
    const email = (g("email") && g("email").value.trim()) || "";
    const msg = (g("message") && g("message").value.trim()) || "";
    let ok = true;
    if (!name) { setErr("name", "Enter your name"); ok = false; } else setErr("name", "");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr("email", "Enter a valid email"); ok = false; } else setErr("email", "");
    if (msg.length < 6) { setErr("message", "Tell me a little more"); ok = false; } else setErr("message", "");
    if (!ok) return;

    const btn = f.querySelector("[data-submit]");
    const succ = f.querySelector("[data-success]");
    const errBox = f.querySelector("[data-form-error]");
    if (errBox) errBox.classList.remove("show");
    if (btn) { btn.disabled = true; btn.textContent = "Transmitting…"; }

    fetch(f.action, {
      method: "POST",
      body: new FormData(f),
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Form submission failed");
        if (succ) succ.classList.add("show");
        f.querySelectorAll("[data-field]").forEach((i) => (i.value = ""));
        if (btn) btn.textContent = "Message sent ✓";
      })
      .catch(() => {
        if (errBox) errBox.classList.add("show");
        if (btn) { btn.disabled = false; btn.textContent = "Send message"; }
      });
  }

  // ---------- loader ----------
  function runLoader(loader) {
    const num = loader.querySelector("[data-load-num]");
    const bar = loader.querySelector("[data-load-bar]");
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 13 + 7;
      if (p >= 100) { p = 100; clearInterval(iv); }
      if (num) num.textContent = String(Math.floor(p)).padStart(3, "0");
      if (bar) bar.style.width = p + "%";
    }, 110);
    setTimeout(() => {
      loader.style.transition = "opacity .55s ease, transform .8s cubic-bezier(.7,0,.2,1)";
      loader.style.transform = "translateY(-100%)";
      loader.style.opacity = "0";
      setTimeout(() => { loader.style.display = "none"; }, 760);
    }, 2200);
  }

  // ---------- cursor / parallax / orbs / progress / nav bg ----------
  function startMotion(showCursor) {
    const ring = document.getElementById("cur-ring");
    const dot = document.getElementById("cur-dot");
    const trail = [...document.querySelectorAll("[data-trail]")];
    const orbs = [...document.querySelectorAll("[data-orb]")].map((el) => ({
      el,
      depth: parseFloat(el.getAttribute("data-depth")) || 20,
      amp: parseFloat(el.getAttribute("data-amp")) || 30,
      phase: parseFloat(el.getAttribute("data-phase")) || 0,
      speed: parseFloat(el.getAttribute("data-speed")) || 0.0002,
    }));
    const plx = [...document.querySelectorAll("[data-parallax]")].map((el) => ({
      el,
      depth: parseFloat(el.getAttribute("data-depth")) || 16,
      x: 0,
      y: 0,
    }));
    const spot = document.getElementById("spotlight");
    const nav = document.getElementById("nav");
    const bar = document.getElementById("progress");
    const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
    const cur = { x: mouse.x, y: mouse.y };
    const drg = { x: mouse.x, y: mouse.y };
    const tp = trail.map(() => ({ x: mouse.x, y: mouse.y }));
    let hover = false;
    let magEl = null;

    if (showCursor) {
      document.documentElement.style.cursor = "none";
      if (ring) ring.style.display = "block";
      if (dot) dot.style.display = "block";
      trail.forEach((t) => (t.style.display = "block"));
    }

    window.addEventListener(
      "mousemove",
      (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.nx = e.clientX / innerWidth - 0.5;
        mouse.ny = e.clientY / innerHeight - 0.5;
        const mag = e.target.closest && e.target.closest("[data-magnetic]");
        if (magEl && magEl !== mag) { magEl.style.transform = ""; magEl = null; }
        if (mag) {
          const r = mag.getBoundingClientRect();
          mag.style.transform =
            "translate(" +
            (e.clientX - (r.left + r.width / 2)) * 0.22 +
            "px," +
            (e.clientY - (r.top + r.height / 2)) * 0.3 +
            "px)";
          magEl = mag;
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "mouseover",
      (e) => { hover = !!(e.target.closest && e.target.closest("[data-cursor]")); },
      { passive: true }
    );

    window.addEventListener(
      "pointerdown",
      (e) => {
        const r = document.createElement("div");
        r.style.cssText =
          "position:fixed;left:" + e.clientX + "px;top:" + e.clientY +
          "px;width:10px;height:10px;margin:-5px 0 0 -5px;border:1px solid var(--accent);border-radius:50%;pointer-events:none;z-index:60";
        (root || document.body).appendChild(r);
        const a = r.animate(
          [
            { width: "10px", height: "10px", margin: "-5px 0 0 -5px", opacity: 0.7 },
            { width: "240px", height: "240px", margin: "-120px 0 0 -120px", opacity: 0 },
          ],
          { duration: 680, easing: "cubic-bezier(.2,.7,.2,1)" }
        );
        a.onfinish = () => r.remove();
      },
      { passive: true }
    );

    const t0 = performance.now();
    function loop(now) {
      const t = now - t0;
      orbs.forEach((o) => {
        const dx = Math.sin(t * o.speed + o.phase) * o.amp + mouse.nx * o.depth;
        const dy = Math.cos(t * o.speed * 0.92 + o.phase) * o.amp + mouse.ny * o.depth;
        o.el.style.transform = "translate3d(" + dx.toFixed(2) + "px," + dy.toFixed(2) + "px,0)";
      });
      plx.forEach((p) => {
        const tx = mouse.nx * p.depth, ty = mouse.ny * p.depth;
        p.x += (tx - p.x) * 0.08;
        p.y += (ty - p.y) * 0.08;
        p.el.style.transform = "translate3d(" + p.x.toFixed(2) + "px," + p.y.toFixed(2) + "px,0)";
      });
      if (spot) {
        spot.style.left = mouse.x - spot.offsetWidth / 2 + "px";
        spot.style.top = mouse.y - spot.offsetHeight / 2 + "px";
      }
      if (showCursor && ring && dot) {
        cur.x += (mouse.x - cur.x) * 0.4;
        cur.y += (mouse.y - cur.y) * 0.4;
        drg.x += (mouse.x - drg.x) * 0.16;
        drg.y += (mouse.y - drg.y) * 0.16;
        dot.style.transform = "translate3d(" + cur.x + "px," + cur.y + "px,0) translate(-50%,-50%)";
        const sc = hover ? 2.3 : 1;
        ring.style.transform = "translate3d(" + drg.x + "px," + drg.y + "px,0) translate(-50%,-50%) scale(" + sc + ")";
        ring.style.borderColor = hover ? "var(--accent)" : "rgba(255,255,255,.5)";
        let px = drg.x, py = drg.y;
        tp.forEach((pp, i) => {
          pp.x += (px - pp.x) * 0.4;
          pp.y += (py - pp.y) * 0.4;
          const el = trail[i];
          el.style.transform = "translate3d(" + pp.x + "px," + pp.y + "px,0) translate(-50%,-50%)";
          el.style.opacity = String((1 - i / tp.length) * 0.35);
          px = pp.x; py = pp.y;
        });
      }
      const scy = window.scrollY || 0;
      const h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (h > 0 ? (scy / h) * 100 : 0) + "%";
      if (nav) {
        nav.style.background = scy > 40 ? "rgba(9,12,24,.72)" : "rgba(9,12,24,.30)";
        nav.style.borderColor = scy > 40 ? "var(--line)" : "rgba(255,255,255,.06)";
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // ---------- click delegation ----------
  document.addEventListener("click", (e) => {
    const st = e.target.closest && e.target.closest("[data-scroll-to]");
    if (st) {
      e.preventDefault();
      const el = document.getElementById(st.getAttribute("data-scroll-to"));
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: y, behavior: rm ? "auto" : "smooth" });
      }
      closeMenu();
      return;
    }
    const mt = e.target.closest && e.target.closest("[data-menu-toggle]");
    if (mt) { toggleMenu(); return; }
    const wf = e.target.closest && e.target.closest("[data-wf]");
    if (wf) { setWF(wf.getAttribute("data-wf")); return; }
    const pcv = e.target.closest && e.target.closest("[data-print-cv]");
    if (pcv) { window.print(); return; }
    const tp = e.target.closest && e.target.closest("[data-top]");
    if (tp) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: rm ? "auto" : "smooth" });
      return;
    }
  });

  document.addEventListener("submit", (e) => {
    const f = e.target.closest && e.target.closest("#contact-form");
    if (!f) return;
    e.preventDefault();
    handleSubmit(f);
  });

  // ---------- boot ----------
  function boot() {
    setupResume();
    setupNavSpy();
    const loader = document.getElementById("loader");

    if (rm) {
      document.querySelectorAll("[data-hero-in],[data-reveal]").forEach((e) => {
        e.style.opacity = "1";
        e.style.transform = "none";
        e.style.filter = "none";
      });
      if (loader) loader.style.display = "none";
      setWF("dash");
      return;
    }

    prepHidden();
    setupReveal();
    startMotion(false); // reticleCursor default is off
    guardVisibility();
    setWF("dash");

    if (loader && INTRO_SEQUENCE) runLoader(loader);
    else if (loader) loader.style.display = "none";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
