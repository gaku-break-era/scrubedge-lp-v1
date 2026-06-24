/* ========================================================================
   ScrubEdge - Cookie Consent + Analytics Loader
   ------------------------------------------------------------------------
   - ユーザーが「同意する」を選んだ場合のみ GA4 / Microsoft Clarity を読込
   - 「同意しない」を選んだ場合は計測タグを一切読み込まない
   - 選択結果は localStorage に保存し、以降はバナーを再表示しない

   ⚠ 設定: 下記の GA4_ID / CLARITY_ID を実際のIDに置き換えてください。
     - GA4: Google Analytics 4 の測定ID (例: G-ABCD1234EF)
     - Clarity: Microsoft Clarity プロジェクトID (例: rg9x8yzabc)
   未設定（XXXXXのまま）の場合は、計測タグは読み込まれません。
   ======================================================================== */
(function () {
  'use strict';

  // ============================================================
  //   設定（ここを置き換える）
  // ============================================================
  var GA4_ID = 'G-XXXXXXXXXX';        // ← Google Analytics 4 測定ID
  var CLARITY_ID = 'XXXXXXXXXX';      // ← Microsoft Clarity プロジェクトID

  var STORAGE_KEY = 'scrubedge_cookie_consent';
  var ACCEPTED = 'accepted';
  var REJECTED = 'rejected';

  // ============================================================
  //   計測タグローダー
  // ============================================================
  function loadGA4() {
    if (!GA4_ID || GA4_ID.indexOf('XXXX') !== -1) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { anonymize_ip: true });
  }

  function loadClarity() {
    if (!CLARITY_ID || CLARITY_ID.indexOf('XXXX') !== -1) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function loadAnalytics() {
    try { loadGA4(); } catch (e) { console.warn('GA4 load failed:', e); }
    try { loadClarity(); } catch (e) { console.warn('Clarity load failed:', e); }
  }

  // ============================================================
  //   Cookie同意バナー
  // ============================================================
  function injectBanner() {
    if (document.getElementById('cookie-consent-banner')) return;

    var style = document.createElement('style');
    style.textContent = [
      '#cookie-consent-banner{',
      '  position:fixed;bottom:0;left:0;right:0;z-index:10000;',
      '  background:rgba(15,31,71,.97);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
      '  color:#fff;padding:14px 20px;',
      '  font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic UI","Noto Sans JP",sans-serif;',
      '  font-size:13px;line-height:1.7;',
      '  box-shadow:0 -8px 24px rgba(15,31,71,.2);',
      '  animation:cc-slide-up .4s ease;',
      '}',
      '@keyframes cc-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}',
      '#cookie-consent-banner .cc-inner{',
      '  max-width:1180px;margin:0 auto;',
      '  display:flex;gap:18px;align-items:center;flex-wrap:wrap;',
      '}',
      '#cookie-consent-banner .cc-text{flex:1;min-width:240px;color:rgba(255,255,255,.92)}',
      '#cookie-consent-banner .cc-text a{color:#93c5fd;text-decoration:underline}',
      '#cookie-consent-banner .cc-text a:hover{color:#bfdbfe}',
      '#cookie-consent-banner .cc-actions{display:flex;gap:8px;flex-shrink:0}',
      '#cookie-consent-banner .cc-btn{',
      '  padding:9px 18px;border:0;border-radius:999px;',
      '  font-weight:700;font-size:13px;font-family:inherit;cursor:pointer;',
      '  transition:all .2s ease;',
      '}',
      '#cookie-consent-banner .cc-btn-accept{',
      '  background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;',
      '  box-shadow:0 4px 14px rgba(37,99,235,.4);',
      '}',
      '#cookie-consent-banner .cc-btn-accept:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(37,99,235,.55)}',
      '#cookie-consent-banner .cc-btn-reject{background:rgba(255,255,255,.1);color:rgba(255,255,255,.85)}',
      '#cookie-consent-banner .cc-btn-reject:hover{background:rgba(255,255,255,.18)}',
      '@media (max-width:640px){',
      '  #cookie-consent-banner{padding:12px 14px;font-size:12.5px}',
      '  #cookie-consent-banner .cc-inner{gap:12px}',
      '  #cookie-consent-banner .cc-actions{width:100%;justify-content:center}',
      '  #cookie-consent-banner .cc-btn{padding:8px 16px;font-size:12.5px;flex:1}',
      '}'
    ].join('');
    document.head.appendChild(style);

    var banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie使用に関する同意');
    banner.innerHTML = [
      '<div class="cc-inner">',
      '  <p class="cc-text">',
      '    当サイトでは、サイト利用状況の分析・サービス改善のためCookieを使用します。',
      '    詳細は <a href="privacy.html">プライバシーポリシー</a> をご覧ください。',
      '  </p>',
      '  <div class="cc-actions">',
      '    <button type="button" class="cc-btn cc-btn-reject" data-cc-action="reject">同意しない</button>',
      '    <button type="button" class="cc-btn cc-btn-accept" data-cc-action="accept">同意する</button>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(banner);

    banner.addEventListener('click', function (e) {
      var action = e.target.getAttribute('data-cc-action');
      if (action === 'accept') {
        try { localStorage.setItem(STORAGE_KEY, ACCEPTED); } catch (err) {}
        banner.style.display = 'none';
        loadAnalytics();
      } else if (action === 'reject') {
        try { localStorage.setItem(STORAGE_KEY, REJECTED); } catch (err) {}
        banner.style.display = 'none';
      }
    });
  }

  // ============================================================
  //   起動
  // ============================================================
  function init() {
    var consent = null;
    try { consent = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (consent === ACCEPTED) {
      loadAnalytics();
    } else if (consent === REJECTED) {
      // 計測タグは読み込まない
    } else {
      injectBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
