/* ===================================================================
   簡易パスワードゲート（くらコレ 非公開プレビュー用）
   ※カジュアルな鍵です。本番公開のときは、このファイルを読み込まない。
   合言葉は PW を書き換えるだけで変えられます。
=================================================================== */
(function () {
  "use strict";
  var PW = "kuracolle2026";
  var KEY = "kuracolle_gate_v1";
  var authed = false;
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
    '#kc-gate input{width:100%;padding:.8rem;border:1.5px solid #e5e5ea;border-radius:6px;font-size:1rem;margin-bottom:.8rem;text-align:center;box-sizing:border-box}' +
    '#kc-gate input:focus{outline:none;border-color:#e5006e}' +
    '#kc-gate button{width:100%;padding:.85rem;border:0;border-radius:999px;background:#e5006e;color:#fff;font-size:1rem;font-weight:700;cursor:pointer;letter-spacing:.1em}' +
    '#kc-gate button:hover{background:#c2005d}' +
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
      '<input id="kc-gate-pw" type="password" autocomplete="off" placeholder="合言葉" aria-label="合言葉" />' +
      '<button id="kc-gate-go" type="button">見る</button>' +
      '<div class="err" id="kc-gate-err" role="alert"></div></div>';
    document.body.appendChild(g);
    var input = document.getElementById("kc-gate-pw");
    var err = document.getElementById("kc-gate-err");
    function submit() {
      if (input.value.trim() === PW) {
        try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
        reveal();
        // 合言葉のあとにオープニングを最初から見せる
        try { sessionStorage.removeItem("kc-opening"); } catch (e) {}
        if (document.documentElement.classList.contains("is-opening") || document.querySelector(".opening")) location.reload();
      } else { err.textContent = "合言葉が違います"; input.value = ""; input.focus(); }
    }
    document.getElementById("kc-gate-go").addEventListener("click", submit);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    input.focus();
  });
})();
