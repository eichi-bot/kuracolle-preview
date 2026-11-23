/* ===================================================================
   簡易パスワードゲート（くらコレ 非公開プレビュー用）
   ※カジュアルな鍵です。本番公開のときは、このファイルを読み込まない。
   合言葉は PW を書き換えるだけで変えられます。
=================================================================== */
(function () {
  "use strict";
  var PW = "kurakore";
  var KEY = "kuracolle_gate_v2";
  var authed = false;
  // 全角・大文字・前後の空白のちがいは同じとみなす（スマホの自動大文字・日本語入力対策）
  function normalize(v) {
    v = String(v || "");
    if (v.normalize) v = v.normalize("NFKC");
    return v.replace(/\s+/g, "").toLowerCase();
  }
  var EYE = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  var EYE_OFF = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 20L20 4" stroke="currentColor" stroke-width="1.6"/></svg>';
  try { authed = sessionStorage.getItem(KEY) === "1"; } catch (e) { authed = true; }
  var st = document.createElement("style");
  st.textContent =
    'html[data-gate="wait"] body{visibility:hidden!important;overflow:hidden!important}' +
    'html[data-gate="wait"] #kc-gate{visibility:visible!important}' +
    '#kc-gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#fff;padding:1rem;font-family:"Noto Sans JP","Hiragino Sans","Yu Gothic",sans-serif;color:#1f1a1c}' +
    '#kc-gate .g-card{max-width:360px;width:100%;padding:2.4rem 1.6rem 2rem;text-align:center;border-top:1px solid #1f1a1c;border-bottom:1px solid #e5e5ea}' +
    '#kc-gate .logo{font-weight:900;font-size:2.4rem;line-height:1;letter-spacing:.02em;margin:0 0 .4rem}' +
    '#kc-gate .logo em{font-style:normal;color:#e5006e}' +
    '#kc-gate .en{font-family:Roboto,Arial,sans-serif;font-style:italic;font-weight:700;font-size:.75rem;letter-spacing:.14em;color:#7e6129;margin:0 0 1.4rem}' +
    '#kc-gate p.msg{font-size:.85rem;color:#4a4245;margin:0 0 1.3rem;line-height:1.9}' +
    '#kc-gate .pw-wrap{position:relative;margin-bottom:.8rem}' +
    '#kc-gate .pw-wrap input{margin-bottom:0;padding-right:3rem;padding-left:3rem}' +
    '#kc-gate .eye{position:absolute;right:.35rem;top:50%;transform:translateY(-50%);width:2.6rem;height:2.6rem;padding:0;border:0;border-radius:6px;background:transparent;color:#847a7d;cursor:pointer;display:flex;align-items:center;justify-content:center}' +
    '#kc-gate .eye:hover,#kc-gate .eye[aria-pressed="true"]{color:#e5006e;background:#fbe9f1}' +
    '#kc-gate input{width:100%;padding:.8rem;border:1.5px solid #e5e5ea;border-radius:6px;font-size:1rem;margin-bottom:.8rem;text-align:center;box-sizing:border-box}' +
    '#kc-gate input:focus{outline:none;border-color:#e5006e}' +
    '#kc-gate #kc-gate-go{width:100%;padding:.85rem;border:0;border-radius:999px;background:#e5006e;color:#fff;font-size:1rem;font-weight:700;cursor:pointer;letter-spacing:.1em}' +
    '#kc-gate #kc-gate-go:hover{background:#c2005d}' +
    '#kc-gate .err{color:#b3261e;font-size:.8rem;min-height:1.1em;margin-top:.6rem}';
  (document.head || document.documentElement).appendChild(st);
  if (!authed) document.documentElement.setAttribute("data-gate", "wait");
  function reveal() {
    var g = document.getElementById("kc-gate");
    if (g && g.parentNode) g.parentNode.removeChild(g);
    document.documentElement.removeAttribute("data-gate");
  }
  document.addEventListener("DOMContentLoaded", function () {
    if (authed) { reveal(); return; }
    var g = document.createElement("div");
    g.id = "kc-gate";
    g.innerHTML =
      '<div class="g-card"><p class="logo">くら<em>コレ</em></p><p class="en">KURA COLLE</p>' +
      '<p class="msg">ホームページの<strong>試作（非公開プレビュー）</strong>です。<br>合言葉を入力してください。</p>' +
      '<div class="pw-wrap"><input id="kc-gate-pw" type="password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="合言葉" aria-label="合言葉" />' +
      '<button type="button" id="kc-gate-eye" class="eye" aria-label="入力した合言葉を表示する" aria-pressed="false">' + EYE + '</button></div>' +
      '<button id="kc-gate-go" type="button">見る</button>' +
      '<div class="err" id="kc-gate-err" role="alert"></div></div>';
    document.body.appendChild(g);
    var input = document.getElementById("kc-gate-pw");
    var err = document.getElementById("kc-gate-err");
    function submit() {
      if (normalize(input.value) === normalize(PW)) {
        try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
        reveal();
        // 合言葉のあとにオープニングを最初から見せる
        try { sessionStorage.removeItem("kc-opening"); } catch (e) {}
        if (document.documentElement.classList.contains("is-opening") || document.querySelector(".opening")) location.reload();
      } else { err.textContent = "合言葉が違います"; input.value = ""; input.focus(); }
    }
    input.addEventListener("input", function () { err.textContent = ""; });
    var eye = document.getElementById("kc-gate-eye");
    eye.addEventListener("click", function () {
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      eye.innerHTML = show ? EYE_OFF : EYE;
      eye.setAttribute("aria-pressed", String(show));
      eye.setAttribute("aria-label", show ? "合言葉を隠す" : "入力した合言葉を表示する");
      input.focus();
    });
    document.getElementById("kc-gate-go").addEventListener("click", submit);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    input.focus();
  });
})();
