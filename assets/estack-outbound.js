/* eStack GA4 affiliate outbound measurement. No names, contact information or credit data sent. */
(function () {
  'use strict';
  if (window.__estackAffiliateAnalytics) return;
  window.__estackAffiliateAnalytics = true;
  const id = 'G-1M3ZKZHNWE';
  if (typeof window.gtag !== 'function') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id);
    if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
      document.head.appendChild(s);
    }
  }
  const known = /(?:^|\.)(?:amazon\.|ebay\.|temu\.|dhgate\.|gumroad\.|etsy\.|loanscanada\.|cmi\.rocks$|awin1\.com$|shareasale\.com$|impact\.com$|dwin2\.com$|dpbolvw\.net$|prf\.hn$|partnerize\.com$|kitco\.com$)/i;
  document.addEventListener('click', function (event) {
    const anchor = event.target.closest && event.target.closest('a[href]');
    if (!anchor) return;
    let url;
    try { url = new URL(anchor.href, location.href); } catch (_) { return; }
    if (!/^https?:$/.test(url.protocol) || url.origin === location.origin) return;
    if (!known.test(url.hostname) && !(anchor.rel || '').toLowerCase().includes('sponsored')) return;
    window.gtag('event', 'affiliate_click', {
      retailer: url.hostname.toLowerCase(),
      link_domain: url.hostname.toLowerCase(),
      source_page: location.pathname
    });
  }, {capture: true});
})();
