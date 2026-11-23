(function () {
  "use strict";

  /* ---------- オープニング ---------- */
  var root = document.documentElement;
  var opening = document.querySelector(".opening");
  if (opening && root.classList.contains("is-opening")) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var i = 0;
    // 1文字ずつ span に分けて、少しずつ遅らせて出す
    opening.querySelectorAll(".opening-line").forEach(function (line) {
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split("").forEach(function (c) {
              var s = document.createElement("span");
              s.className = "ch"; s.textContent = c;
              s.style.animationDelay = (0.35 + i * 0.075).toFixed(3) + "s";
              i++; frag.appendChild(s);
            });
            node.replaceChild(frag, n);
          } else { walk(n); }
        });
      };
      walk(line);
    });
    var done = false;
    var close = function () {
      if (done) return; done = true;
      opening.classList.add("is-out");
      try { sessionStorage.setItem("kc-opening", "1"); } catch (e) {}
      setTimeout(function () { root.classList.remove("is-opening"); }, 900);
    };
    opening.addEventListener("click", close);
    // ?hold-opening を付けると止めたまま（確認・撮影用）
    if (location.search.indexOf("hold-opening") < 0) setTimeout(close, reduce ? 1400 : 3600);
  }

  /* ---------- ヘッダー：スクロールで下線 ---------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- スマホのメニュー ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var drawer = document.getElementById("drawer");
  var setMenu = function (open) {
    toggle.setAttribute("aria-expanded", String(open));
    drawer.hidden = !open;
  };
  toggle.addEventListener("click", function () { setMenu(drawer.hidden); });
  drawer.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });

  /* ---------- 実績（data/stats.js から） ---------- */
  var data = window.KURACOLLE_STATS || { events: [] };
  var events = (data.events || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  var totalsEl = document.getElementById("record-totals");
  var tableEl = document.getElementById("record-table");

  var sum = function (key) {
    var known = events.filter(function (e) { return typeof e[key] === "number"; });
    if (!known.length) return null;
    return known.reduce(function (s, e) { return s + e[key]; }, 0);
  };
  var fmt = function (n) { return n.toLocaleString("ja-JP"); };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  };

  if (!totalsEl) {
    // 実績の欄がないページ（申込みページなど）では何もしない
  } else if (!events.length) {
    totalsEl.className = "record-empty";
    totalsEl.innerHTML =
      '<p class="total-num">00</p>' +
      "<p><b>第1回の開催後に掲載します。</b>出演した組数・来場者数・アンケートの結果など、くらコレの歩みをここに記録していきます。</p>";
  } else {
    var items = [
      { label: "開催回数", value: events.length, unit: "回" },
      { label: "出演したふたり", value: sum("pairs"), unit: "組" },
      { label: "出演した介護事業所", value: sum("offices"), unit: "事業所" },
      { label: "来場者数（延べ）", value: sum("visitors"), unit: "人" },
      { label: "協賛・出展企業（延べ）", value: sum("sponsors"), unit: "社" },
      { label: "ボランティア（延べ）", value: sum("volunteers"), unit: "人" },
    ].filter(function (i) { return i.value !== null; }).slice(0, 4);

    totalsEl.innerHTML = items.map(function (i) {
      return '<div class="total"><p class="total-label">' + i.label + '</p><p class="total-num">' +
        fmt(i.value) + "<small>" + i.unit + "</small></p></div>";
    }).join("");

    var cell = function (v, unit) { return typeof v === "number" ? fmt(v) + unit : "—"; };
    tableEl.innerHTML =
      '<table class="record-table"><thead><tr><th>回</th><th>開催日</th><th>会場</th><th>出演</th><th>来場者</th><th>「介護のイメージが良くなった」</th></tr></thead><tbody>' +
      events.map(function (e) {
        var s = e.survey || {};
        return "<tr><td>" + (e.no ? "第" + e.no + "回" : "—") + "</td><td class=\"num\">" + esc(e.date.replace(/-/g, ".")) +
          "</td><td>" + esc(e.place || "—") + "</td><td>" + cell(e.pairs, "組") + "</td><td>" + cell(e.visitors, "人") +
          "</td><td>" + cell(s.imageUp, "%") + "</td></tr>";
      }).join("") +
      "</tbody></table>";
  }

  /* ---------- お知らせ（data/news.js）：サムネつきの横に流れるカード ---------- */
  var newsEl = document.getElementById("news-cards");
  if (newsEl && window.KURACOLLE_NEWS) {
    var WD = ["日", "月", "火", "水", "木", "金", "土"];
    var TAGS = { "開催": "event", "募集": "entry", "お知らせ": "info", "レポート": "report" };
    var list = window.KURACOLLE_NEWS.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    newsEl.innerHTML = list.map(function (n) {
      var d = n.date.split("-"), dt = new Date(+d[0], +d[1] - 1, +d[2]);
      var kind = TAGS[n.tag] || "info";
      var thumb = n.img
        ? '<img src="' + esc(n.img) + '" alt="" loading="lazy" decoding="async">'
        : '<span class="news-art" aria-hidden="true"><i></i><i></i><i></i></span>';
      return '<li class="news-item"><a class="news-link" href="' + esc(n.href || "#") + '">' +
        '<span class="news-thumb news-thumb--' + kind + '">' + thumb +
        '<span class="news-date" aria-hidden="true"><span class="news-y">' + d[0] + '</span><span class="news-md">' + (+d[1]) + "." + d[2] + '</span><span class="news-wd">' + WD[dt.getDay()] + "曜日</span></span></span>" +
        '<span class="news-tag news-tag--' + kind + '">' + esc(n.tag) + "</span>" +
        '<span class="news-card-title">' + esc(n.title) + "</span>" +
        '<span class="news-lead"><time class="sr-only" datetime="' + esc(n.date) + '">' + (+d[0]) + "年" + (+d[1]) + "月" + (+d[2]) + "日</time>" + esc(n.lead || "") + "</span>" +
        "</a></li>";
    }).join("");
    var nPrev = document.querySelector("[data-news-prev]"), nNext = document.querySelector("[data-news-next]");
    var nStep = function () { var it = newsEl.querySelector(".news-item"); return it ? it.getBoundingClientRect().width + 24 : newsEl.clientWidth; };
    var nHow = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"; };
    var nUpdate = function () {
      var max = newsEl.scrollWidth - newsEl.clientWidth - 2;
      document.querySelector("[data-news-btns]").hidden = max <= 0; // 全部見えているときはボタンを出さない
      nPrev.setAttribute("aria-disabled", newsEl.scrollLeft <= 2 ? "true" : "false");
      nNext.setAttribute("aria-disabled", newsEl.scrollLeft >= max ? "true" : "false");
    };
    nPrev.addEventListener("click", function () { newsEl.scrollBy({ left: -nStep(), behavior: nHow() }); });
    nNext.addEventListener("click", function () { newsEl.scrollBy({ left: nStep(), behavior: nHow() }); });
    newsEl.addEventListener("scroll", nUpdate, { passive: true });
    window.addEventListener("resize", nUpdate);
    nUpdate();
  }

  /* ---------- フォーム（お問い合わせ・出演申込み）共通 ---------- */
  // 送信先は data/config.js の KURACOLLE_FORM_ENDPOINT（Googleの仕組みのURL）。空のあいだは試作として送らない
  var ENDPOINT = (window.KURACOLLE_CONFIG || {}).formEndpoint || "";

  var setupForm = function (form, switchName) {
    var extras = form.querySelectorAll(".cform-extra");
    var errEl = form.querySelector(".cform-error");
    var doneEl = form.querySelector(".cform-done");
    var btn = form.querySelector(".cform-submit");

    var showType = function (type) {
      extras.forEach(function (box) {
        var on = box.getAttribute("data-for") === type;
        box.hidden = !on;
        // 隠れている項目は送信・入力チェックの対象から外す
        box.querySelectorAll("input, textarea, select").forEach(function (el) { el.disabled = !on; });
      });
    };
    form.addEventListener("change", function (e) {
      if (e.target.name === switchName) showType(e.target.value);
      if (e.target.classList) e.target.classList.remove("is-invalid");
    });
    var checked = form.querySelector('input[name="' + switchName + '"]:checked');
    if (checked) showType(checked.value);

    var validate = function () {
      var bad = [];
      form.querySelectorAll("[required]:not(:disabled)").forEach(function (el) {
        var ok;
        if (el.type === "radio" || el.type === "checkbox") {
          // 同じ名前のどれか1つに印があればよい
          ok = !!form.querySelector('input[name="' + el.name + '"]:checked:not(:disabled)');
        } else {
          ok = el.value.trim() !== "" && (el.type !== "email" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim()));
        }
        if (!ok) { bad.push(el); if (el.type !== "radio" && el.type !== "checkbox") el.classList.add("is-invalid"); }
      });
      return bad;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errEl.hidden = true; doneEl.hidden = true;
      var bad = validate();
      if (bad.length) {
        errEl.textContent = "入力が必要な項目があります。赤い枠の項目と、必須の選択をご確認ください。";
        errEl.hidden = false;
        bad[0].focus();
        return;
      }
      if (!ENDPOINT) {
        doneEl.textContent = "（試作）入力内容のチェックは通りました。送信先の設定後に、実際に送れるようになります。";
        doneEl.hidden = false;
        return;
      }
      // 同じ名前の項目（チェックボックスなど）は「、」でつなげて1つにして送る
      var fd = new FormData(form), merged = {};
      fd.forEach(function (v, k) { merged[k] = merged[k] ? merged[k] + "、" + v : String(v); });
      var body = new URLSearchParams(merged);
      btn.disabled = true; btn.textContent = "送信しています…";
      fetch(ENDPOINT, { method: "POST", body: body })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res || !res.ok) throw new Error("ng");
          form.reset();
          var c = form.querySelector('input[name="' + switchName + '"]:checked');
          if (c) showType(c.value);
          doneEl.textContent = form.getAttribute("data-kind") === "entry"
            ? "お申し込みを受け付けました。ありがとうございます。確認のメールをお送りしました。事務局から追ってご連絡します。"
            : "お問い合わせを受け付けました。ありがとうございます。確認のメールをお送りしました。";
          doneEl.hidden = false;
          doneEl.scrollIntoView({ block: "center" });
        })
        .catch(function () {
          errEl.textContent = "送信できませんでした。時間をおいてもう一度お試しください。";
          errEl.hidden = false;
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = form.getAttribute("data-kind") === "entry" ? "申し込む" : "送信する";
        });
    });
    return showType;
  };

  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    var showContact = setupForm(contactForm, "type");
    // 「出展・協賛について問い合わせる」などのボタンから来たら、種類を選んだ状態にする
    document.querySelectorAll("[data-contact-type]").forEach(function (a) {
      a.addEventListener("click", function () {
        var t = a.getAttribute("data-contact-type");
        var r = contactForm.querySelector('input[name="type"][value="' + t + '"]');
        if (r) { r.checked = true; showContact(t); }
      });
    });
  }
  var entryForm = document.getElementById("entry-form");
  if (entryForm) setupForm(entryForm, "entry_kind");

  /* ---------- よくある質問：下にすっと伸びて開く ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".faq-item").forEach(function (d) {
    var sum = d.querySelector("summary"), body = d.querySelector(".faq-body");
    if (!sum || !body || reduceMotion) return;
    d.classList.add("is-anim");
    sum.addEventListener("click", function (e) {
      e.preventDefault();
      if (d.open) {
        body.style.height = body.scrollHeight + "px";
        requestAnimationFrame(function () { body.style.height = "0px"; });
        setTimeout(function () { d.open = false; body.style.height = ""; }, 350);
      } else {
        d.open = true;
        body.style.height = "0px";
        requestAnimationFrame(function () { body.style.height = body.scrollHeight + "px"; });
        setTimeout(function () { body.style.height = ""; }, 350);
      }
    });
  });

  /* ---------- スクロールで静かに出す ---------- */
  var targets = document.querySelectorAll(".sec-head, .story-body, .aims, .trio, .pillar, .promise-inner, .record-totals, .join-cols, .merits, .outline-list");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    targets.forEach(function (t) { t.classList.add("reveal"); io.observe(t); });
  }
})();
