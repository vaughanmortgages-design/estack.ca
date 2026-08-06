document.querySelector('[data-menu]')?.addEventListener('click',e=>{const n=document.querySelector('[data-nav]');const open=n.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open))});

document.querySelectorAll('a[href="https://leadscout.ca/?ref=ZX3kIzQG"], a[href="https://leadscout.ca/?ref=ZX3klzQG"]').forEach(link=>{
  link.setAttribute('href','/leadscout-canada-loans.html');
  link.removeAttribute('target');
  link.setAttribute('rel','');
});

const tiktokAffiliate='https://getstartedtiktok.partnerlinks.io/19gddff1jq85';

// Feature TikTok for Business directly beside Shopify on the Tech & AI Tools page.
if(location.pathname.endsWith('/tech-ai-tools.html') || location.pathname === '/tech-ai-tools.html'){
  const shopifyLink=document.querySelector('a[href="https://shopify.pxf.io/PzRMVN"]');
  const shopifyCard=shopifyLink?.closest('article.card');
  if(shopifyCard && !document.querySelector(`a[href="${tiktokAffiliate}"]`)){
    const tiktokCard=document.createElement('article');
    tiktokCard.className='card';
    tiktokCard.innerHTML='<span class="tag">Business growth</span><h3>TikTok for Business</h3><p>Reach new customers with TikTok advertising, lead generation and ecommerce campaigns.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+tiktokAffiliate+'">Start Advertising →</a><br><a class="text-link" href="tiktok-business-canada.html">Read the 2026 guide →</a>';
    shopifyCard.insertAdjacentElement('afterend',tiktokCard);
  }
}

// Put TikTok beside Shopify in the homepage Featured Opportunities grid.
if(location.pathname==='/' || location.pathname.endsWith('/index.html')){
  const shopifyLink=document.querySelector('a[href="https://shopify.pxf.io/PzRMVN"]');
  const shopifyCard=shopifyLink?.closest('article.card');
  if(shopifyCard && !document.querySelector(`a[href="${tiktokAffiliate}"]`)){
    const tiktokCard=document.createElement('article');
    tiktokCard.className='card';
    tiktokCard.innerHTML='<span class="tag">Business advertising</span><h3>TikTok for Business</h3><p>Launch campaigns to reach customers, generate leads and support ecommerce growth.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+tiktokAffiliate+'">Get Started →</a><br><a class="text-link" href="tiktok-business-canada.html">Read the guide →</a>';
    shopifyCard.insertAdjacentElement('afterend',tiktokCard);
  }

  const featuredSection=shopifyCard?.closest('section');
  if(featuredSection && !document.getElementById('start-grow-business')){
    const callout=document.createElement('section');
    callout.className='section';
    callout.id='start-grow-business';
    callout.innerHTML='<div class="wrap"><div class="section-head"><span class="eyebrow">Start & Grow Your Business</span><h2>Build with Shopify. Grow with TikTok.</h2><p>Launch an online store, then use TikTok for Business to reach new customers with short-form video advertising.</p></div><div class="grid-3"><article class="card"><span class="tag">Build</span><h3>Shopify</h3><p>Create and manage your ecommerce store.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="https://shopify.pxf.io/PzRMVN">View Shopify →</a></article><article class="card"><span class="tag">Grow</span><h3>TikTok for Business</h3><p>Run advertising campaigns for awareness, leads and sales.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+tiktokAffiliate+'">Start Advertising →</a></article><article class="card"><span class="tag">Learn</span><h3>TikTok Business Guide</h3><p>Understand setup, targeting, budgets and common mistakes.</p><a class="text-link" href="tiktok-business-canada.html">Read the 2026 guide →</a></article></div></div>';
    featuredSection.insertAdjacentElement('afterend',callout);
  }
}

// AFN account and offer are disabled. Remove every AFN destination from rendered pages.
document.querySelectorAll('a[href*="advancefundsnetwork.com"]').forEach(link=>{
  const card=link.closest('article,.card');
  if(card){card.remove();return;}
  link.remove();
});
