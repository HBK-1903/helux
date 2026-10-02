(function () {
  var FALLBACK_STATUS = {
    fw: "v5.5", online: false, player: { name: "HELUX" },
    scores: {
      dino: { best: 0, name: "—" },
      breakout: { best: 0, name: "—" },
      snake: { best: 0, name: "—" },
      pong: { wins: 0, name: "—" },
      slot: { best: 0, coins: 100, name: "—" }
    },
    stats: { gamesPlayed: 0, pomoTotal: 0, pomoToday: 0, achCount: 0, achTotal: 13 },
    achievements: [
      { name: "İlk Oyun", desc: "Bir oyun bitir", unlocked: false },
      { name: "Dino 20", desc: "Dino'da 20 puan", unlocked: false },
      { name: "Breakout 300", desc: "Breakout'ta 300 puan", unlocked: false },
      { name: "Snake 15", desc: "Snake'te 15 puan", unlocked: false },
      { name: "Pong Galibi", desc: "Pong'da AI'yi yen", unlocked: false },
      { name: "Jackpot!", desc: "Slotta 3'lü yakala", unlocked: false },
      { name: "Zengin", desc: "Slotta 500 jeton", unlocked: false },
      { name: "Obur Helux", desc: "Helux'u 10 kez besle", unlocked: false },
      { name: "Odak", desc: "1 pomodoro bitir", unlocked: false },
      { name: "Odak x4", desc: "4 pomodoro bitir", unlocked: false },
      { name: "Morseci", desc: "Morse'ta 5 harf yaz", unlocked: false },
      { name: "Zamançı", desc: "Saati ayarla", unlocked: false },
      { name: "Kararsız", desc: "Karar ver 10 kez", unlocked: false }
    ]
  };

  var FALLBACK_WEB = {
    current: "2.0",
    entries: [
      { ver: "2.0", date: "2026-03-27", tag: "yapı", summary: "Yayına hazır vitrin.", items: ["pin şeması", "OG", "zaman çizgisi"] }
    ]
  };

  var GAMES = [
    { key: "dino", title: "Dino", field: "best" },
    { key: "breakout", title: "Breakout", field: "best" },
    { key: "snake", title: "Snake", field: "best" },
    { key: "pong", title: "Pong galibiyeti", field: "wins" },
    { key: "slot", title: "Slot rekoru", field: "best" }
  ];

  var TALKS = [
    "DHT'yi özledim.",
    "GPIO 12'ye basma.",
    "Skorlar kablosuz değil.",
    "Kablo yok, sıkıldım.",
    "B kısa geri.",
    "Ölmem. Üzülürüm.",
    "UTF-8 kaydet.",
    "v5.5. Karakteri var."
  ];

  function reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function list(arr) {
    if (!arr || !arr.length) return "";
    return "<ul>" + arr.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>";
  }

  function load(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw 0;
      return r.json();
    });
  }

  function initTheme() {
    var t = localStorage.getItem("helux-theme");
    if (!t) t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    function paint(x, animate) {
      if (animate && !reduceMotion()) {
        document.documentElement.classList.add("theme-anim");
        window.setTimeout(function () {
          document.documentElement.classList.remove("theme-anim");
        }, 320);
      }
      document.documentElement.setAttribute("data-theme", x);
      btn.textContent = x === "dark" ? "☀" : "☾";
    }
    paint(t, false);
    btn.addEventListener("click", function () {
      var n = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem("helux-theme", n);
      paint(n, true);
    });
  }

  function initScrollNav() {
    var nav = document.getElementById("sectionNav");
    if (!nav) return;
    var links = [].slice.call(nav.querySelectorAll('a[href^="#"]'));
    var sections = links.map(function (a) {
      return document.getElementById(a.getAttribute("href").slice(1));
    }).filter(Boolean);

    function setActive(id) {
      links.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + id);
      });
    }

    nav.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(a.getAttribute("href").slice(1));
    });

    if (!("IntersectionObserver" in window) || !sections.length) return;
    var io = new IntersectionObserver(function (entries) {
      var vis = entries.filter(function (en) { return en.isIntersecting; });
      if (!vis.length) return;
      vis.sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      setActive(vis[0].target.id);
    }, { rootMargin: "-18% 0px -55% 0px", threshold: [0.1, 0.35] });
    sections.forEach(function (s) { io.observe(s); });
  }

  function initSearch() {
    var box = document.getElementById("updateSearch");
    if (!box) return;
    box.addEventListener("input", function () {
      var q = box.value.toLowerCase().trim();
      document.querySelectorAll("#fwLog li, #webLog li").forEach(function (li) {
        var hay = li.getAttribute("data-q") || li.textContent.toLowerCase();
        li.classList.toggle("hidden", q && hay.indexOf(q) === -1);
      });
    });
  }

  function injectChrome() {
    if (!document.getElementById("readBar")) {
      var bar = document.createElement("div");
      bar.id = "readBar";
      bar.setAttribute("aria-hidden", "true");
      document.body.insertBefore(bar, document.body.firstChild);
    }
    if (!document.getElementById("toTop")) {
      var top = document.createElement("button");
      top.id = "toTop";
      top.type = "button";
      top.title = "Başa dön";
      top.setAttribute("aria-label", "Başa dön");
      top.textContent = "↑";
      document.body.appendChild(top);
      top.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
      });
    }
    if (!document.getElementById("lightbox")) {
      var lb = document.createElement("div");
      lb.id = "lightbox";
      lb.hidden = true;
      lb.innerHTML = "<button type='button' class='lb-close' aria-label='Kapat'>×</button><img alt=''>";
      document.body.appendChild(lb);
    }
    document.querySelectorAll("h1").forEach(function (h) { h.classList.add("glitch"); });
    document.querySelectorAll(".face").forEach(function (face) {
      if (face.querySelector(".shades")) return;
      var s = document.createElement("div");
      s.className = "shades";
      s.setAttribute("aria-hidden", "true");
      s.innerHTML = "<span></span><i></i><span></span>";
      face.appendChild(s);
    });
  }

  function initProgress() {
    var bar = document.getElementById("readBar");
    var top = document.getElementById("toTop");
    function tick() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (bar) bar.style.width = p + "%";
      if (top) top.classList.toggle("show", window.scrollY > 420);
    }
    window.addEventListener("scroll", tick, { passive: true });
    tick();
  }

  function initReveal() {
    var nodes = document.querySelectorAll(".card, .broken, .story, details.faq, table, .hero, .api, .log li, .pins");
    if (reduceMotion() || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("reveal", "in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "40px 0px" });
    nodes.forEach(function (el) {
      if (el.classList.contains("in")) return;
      el.classList.add("reveal");
      io.observe(el);
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
    });
  }

  function lookAt(x, y) {
    document.querySelectorAll(".eye").forEach(function (eye) {
      var r = eye.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = Math.max(-6, Math.min(6, (x - cx) / 22));
      var dy = Math.max(-6, Math.min(6, (y - cy) / 22));
      var p = eye.querySelector(".pupil");
      if (p) p.style.transform = "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px))";
    });
  }

  function initEyes() {
    if (!document.querySelector(".pupil") || reduceMotion()) return;
    window.addEventListener("mousemove", function (e) { lookAt(e.clientX, e.clientY); }, { passive: true });
    window.addEventListener("touchmove", function (e) {
      if (!e.touches[0]) return;
      lookAt(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }

  function initKonami() {
    var seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    var i = 0;
    window.addEventListener("keydown", function (e) {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === seq[i]) {
        i++;
        if (i === seq.length) {
          document.querySelectorAll(".face").forEach(function (f) { f.classList.add("cool"); });
          i = 0;
        }
      } else {
        i = k === seq[0] ? 1 : 0;
      }
    });
  }

  function initCopy() {
    document.querySelectorAll(".api").forEach(function (box) {
      if (box.querySelector(".copy-api")) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-api";
      btn.textContent = "Kopyala";
      box.appendChild(btn);
      btn.addEventListener("click", function () {
        var t = box.innerText.replace("Kopyala", "").replace("Kopyalandı", "").trim();
        function ok() {
          btn.textContent = "Kopyalandı";
          btn.classList.add("ok");
          setTimeout(function () { btn.textContent = "Kopyala"; btn.classList.remove("ok"); }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(t).then(ok).catch(ok);
        } else ok();
      });
    });
  }

  function initLightbox() {
    var lb = document.getElementById("lightbox");
    if (!lb) return;
    var img = lb.querySelector("img");
    function close() { lb.hidden = true; img.removeAttribute("src"); }
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    document.body.addEventListener("click", function (e) {
      var a = e.target.closest("a.lightbox");
      var im = e.target.closest("img.zoom");
      if (!a && !im) return;
      e.preventDefault();
      img.src = a ? a.href : (im.getAttribute("data-full") || im.src);
      img.alt = (a && a.querySelector("img") ? a.querySelector("img").alt : (im && im.alt)) || "";
      lb.hidden = false;
    });
  }

  function initTalk() {
    var face = document.querySelector(".hero .face");
    if (!face || face.querySelector(".talk")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "talk";
    b.setAttribute("aria-label", "Helux konuşuyor");
    var i = 0;
    function say() { b.textContent = TALKS[i % TALKS.length]; }
    say();
    b.addEventListener("click", function () { i++; say(); });
    face.appendChild(b);
    window.setInterval(function () { i++; say(); }, 5600);
  }

  function initBoot() {
    if (sessionStorage.getItem("helux-booted")) return;
    sessionStorage.setItem("helux-booted", "1");
    if (reduceMotion()) return;
    var el = document.createElement("div");
    el.id = "boot";
    el.innerHTML =
      "<div class='boot-eyes'><div class='boot-eye'></div><div class='boot-eye'></div></div>" +
      "<div class='boot-word'>HELUX</div>" +
      "<button type='button' class='boot-skip'>A:geç</button>";
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("open"); });
    function done() {
      el.classList.add("out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 480);
    }
    el.querySelector(".boot-skip").addEventListener("click", done);
    el.addEventListener("click", function (e) {
      if (e.target.classList.contains("boot-skip")) return;
      done();
    });
    setTimeout(done, 1500);
  }

  var PUPPET_MENU = ["Helux", "Oyunlar", "Bilgiler", "Araçlar", "Ayarlar"];
  var puppet = { screen: "home", idx: 0 };

  function puppetDraw() {
    var body = document.getElementById("oledBody");
    var foot = document.getElementById("oledFoot");
    var head = document.getElementById("oledHead");
    if (!body) return;
    if (puppet.screen === "home") {
      if (head) head.textContent = "HELUX";
      body.innerHTML = "<div class='oled-eyes'>● ●</div><div class='oled-center'>A:Menü</div>";
      if (foot) foot.textContent = "UP/DN bakış";
    } else if (puppet.screen === "menu") {
      if (head) head.textContent = "ANA MENÜ";
      body.innerHTML = PUPPET_MENU.map(function (n, i) {
        return "<div class='oled-row" + (i === puppet.idx ? " on" : "") + "'>" +
          (i === puppet.idx ? "▸ " : "  ") + n + "</div>";
      }).join("");
      if (foot) foot.textContent = "A:Seç B:Geri";
    } else {
      if (head) head.textContent = puppet.screen.toUpperCase();
      body.innerHTML = "<div class='oled-center'>" + puppet.screen + "<br>B:Geri</div>";
      if (foot) foot.textContent = "maket · v5.5";
    }
  }

  function puppetKey(k) {
    if (k === "up" && puppet.screen === "menu") puppet.idx = (puppet.idx + 4) % 5;
    else if (k === "dn" && puppet.screen === "menu") puppet.idx = (puppet.idx + 1) % 5;
    else if (k === "a") {
      if (puppet.screen === "home") { puppet.screen = "menu"; puppet.idx = 0; }
      else if (puppet.screen === "menu") puppet.screen = PUPPET_MENU[puppet.idx];
    } else if (k === "b") {
      if (puppet.screen === "menu") puppet.screen = "home";
      else if (puppet.screen !== "home") puppet.screen = "menu";
    }
    puppetDraw();
  }

  function initPuppet() {
    if (!document.getElementById("oledBody")) return;
    puppetDraw();
    document.querySelectorAll(".pads [data-k]").forEach(function (btn) {
      btn.addEventListener("click", function () { puppetKey(btn.getAttribute("data-k")); });
    });
    window.addEventListener("keydown", function (e) {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (!document.getElementById("oledBody")) return;
      var map = { ArrowUp: "up", ArrowDown: "dn", a: "a", A: "a", b: "b", B: "b" };
      if (map[e.key]) { e.preventDefault(); puppetKey(map[e.key]); }
    });
  }

  function renderStatus(d, src) {
    var fw = document.getElementById("pillFw");
    var player = document.getElementById("pillPlayer");
    var link = document.getElementById("pillLink");
    var hint = document.getElementById("scoreHint");
    if (fw) fw.textContent = "Cihaz " + (d.fw || "v5.5");
    if (player) player.textContent = "Oyuncu: " + ((d.player && d.player.name) || "HELUX");
    if (link) {
      if (d.online) {
        link.textContent = "Bağlı";
        link.className = "badge on";
      } else {
        link.textContent = src === "json" ? "JSON (offline)" : "Bağlı değil";
        link.className = "badge off";
      }
    }
    var sg = document.getElementById("scoreGrid");
    if (!sg) return;

    var empty = !d.online;
    if (empty && d.scores) {
      var sc = d.scores;
      empty = !(sc.dino && sc.dino.best) && !(sc.breakout && sc.breakout.best) &&
              !(sc.snake && sc.snake.best) && !(sc.pong && sc.pong.wins) &&
              !(sc.slot && sc.slot.best);
    }
    if (hint) {
      hint.textContent = d.online
        ? "Canlı cihaz verisi."
        : (empty
            ? "Cihaz henüz konuşmuyor. Bu sıfırlar yedek — rekor değil."
            : (src === "json" ? "JSON yüklendi (offline)." : "Yerel yedek."));
    }
    sg.classList.toggle("score-mute", !!empty);

    sg.innerHTML = "";
    GAMES.forEach(function (g) {
      var s = (d.scores && d.scores[g.key]) || {};
      var el = document.createElement("div");
      el.className = "card";
      el.innerHTML = "<h3>" + g.title + "</h3><div class='big'>" +
        (s[g.field] != null ? s[g.field] : 0) + "</div><div class='who'>" +
        (s.name || "—") + "</div>";
      sg.appendChild(el);
    });
    var st = d.stats || {};
    [["Oyun", st.gamesPlayed || 0], ["Pomodoro", st.pomoTotal || 0],
     ["Bugün", st.pomoToday || 0], ["Başarım", (st.achCount || 0) + "/" + (st.achTotal || 13)]
    ].forEach(function (p) {
      var el = document.createElement("div");
      el.className = "card";
      el.innerHTML = "<h3>" + p[0] + "</h3><div class='big'>" + p[1] + "</div>";
      sg.appendChild(el);
    });
    var ag = document.getElementById("achGrid");
    if (!ag) return;
    var total = (d.achievements && d.achievements.length) || st.achTotal || 13;
    var got = st.achCount;
    if (got == null && d.achievements) {
      got = d.achievements.filter(function (a) { return a.unlocked; }).length;
    }
    got = got || 0;
    var host = ag.parentNode;
    var lab = document.getElementById("achBarLabel");
    if (!lab) {
      lab = document.createElement("div");
      lab.id = "achBarLabel";
      lab.className = "ach-bar-label";
      var wrap = document.createElement("div");
      wrap.className = "ach-bar-wrap";
      wrap.innerHTML = "<div class='ach-bar' id='achBar'></div>";
      host.insertBefore(lab, ag);
      host.insertBefore(wrap, ag);
    }
    lab.textContent = "Başarımlar " + got + " / " + total;
    var bar = document.getElementById("achBar");
    if (bar) bar.style.width = (total ? (got / total) * 100 : 0) + "%";
    ag.innerHTML = "";
    (d.achievements || []).forEach(function (a) {
      var el = document.createElement("div");
      el.className = "card";
      el.innerHTML = "<div class='ach'><div class='dot " + (a.unlocked ? "yes" : "") +
        "'></div><div><h3>" + a.name + "</h3><p>" + (a.desc || "") + "</p></div></div>";
      ag.appendChild(el);
    });
  }

  function entryHTML(e) {
    return "<li data-q=\"" +
      ((e.ver || "") + " " + (e.tag || "") + " " + (e.summary || "") + " " +
        (e.added || []).join(" ") + " " + (e.fixed || []).join(" ") + " " +
        (e.notes || []).join(" ") + " " + (e.items || []).join(" ")).toLowerCase().replace(/"/g, "") +
      "\"><div class='meta'><span>" + (e.ver || "") +
      "</span><span class='tag'>" + (e.tag || "") + "</span>" +
      (e.era ? "<span>" + e.era + "</span>" : "") +
      (e.date ? "<span>" + e.date + "</span>" : "") +
      "</div><h3>" + (e.summary || "") + "</h3>" +
      (e.added && e.added.length ? "<p>Eklendi</p>" + list(e.added) : "") +
      (e.fixed && e.fixed.length ? "<p>Düzeltildi</p>" + list(e.fixed) : "") +
      (e.notes && e.notes.length ? "<p>Not</p>" + list(e.notes) : "") +
      list(e.items) + "</li>";
  }

  function renderFw(d, target, limit) {
    var el = document.getElementById(target);
    if (!el) return;
    el.innerHTML = (d.entries || []).slice(0, limit || 99).map(entryHTML).join("");
  }

  function renderWeb(d, target, limit) {
    var pill = document.getElementById("pillWeb");
    if (pill && d.current) pill.textContent = "Site " + d.current;
    var el = document.getElementById(target);
    if (!el) return;
    el.innerHTML = (d.entries || []).slice(0, limit || 99).map(entryHTML).join("");
  }

  function boot() {
    injectChrome();
    initBoot();
    initTalk();
    initPuppet();
    initTheme();
    initScrollNav();
    initSearch();
    initProgress();
    initEyes();
    initKonami();
    initCopy();
    initLightbox();

    if (document.getElementById("scoreGrid")) {
      load("helux.json").then(function (d) { renderStatus(d, "json"); })
        .catch(function () { renderStatus(FALLBACK_STATUS, "fallback"); })
        .then(initReveal);
    } else {
      initReveal();
    }

    var fwFull = document.getElementById("fwLog");
    var fwPrev = document.getElementById("fwPreview");
    if (fwFull || fwPrev) {
      load("data/updates-fw.json")
        .then(function (d) {
          renderFw(d, fwFull ? "fwLog" : "fwPreview", fwFull ? 99 : 3);
          initReveal();
        })
        .catch(function () {
          if (fwPrev) fwPrev.innerHTML = "<li class='card'><p>Firmware defteri okunamadı. Live Server ile aç.</p></li>";
        });
    }

    var webFull = document.getElementById("webLog");
    var webPrev = document.getElementById("webPreview");
    load("data/updates-web.json")
      .then(function (d) {
        renderWeb(d, webFull ? "webLog" : "webPreview", webFull ? 99 : 2);
        initReveal();
      })
      .catch(function () { renderWeb(FALLBACK_WEB, webFull ? "webLog" : "webPreview", 2); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();