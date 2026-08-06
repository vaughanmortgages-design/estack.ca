document.querySelector('[data-menu]')?.addEventListener('click',e=>{const n=document.querySelector('[data-nav]');const open=n.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open))});

document.querySelectorAll('a[href="https://leadscout.ca/?ref=ZX3kIzQG"], a[href="https://leadscout.ca/?ref=ZX3klzQG"]').forEach(link=>{
  link.setAttribute('href','/leadscout-canada-loans.html');
  link.removeAttribute('target');
  link.setAttribute('rel','');
});

const tiktokAffiliate='https://getstartedtiktok.partnerlinks.io/19gddff1jq85';
const beehiivAffiliate='https://www.beehiiv.com/?via=paul-malandrino';

// Feature TikTok for Business and beehiiv near Shopify on the Tech & AI Tools page.
if(location.pathname.endsWith('/tech-ai-tools.html') || location.pathname === '/tech-ai-tools.html'){
  const shopifyLink=document.querySelector('a[href="https://shopify.pxf.io/PzRMVN"]');
  const shopifyCard=shopifyLink?.closest('article.card');
  if(shopifyCard && !document.querySelector(`a[href="${tiktokAffiliate}"]`)){
    const tiktokCard=document.createElement('article');
    tiktokCard.className='card';
    tiktokCard.innerHTML='<span class="tag">Business growth</span><h3>TikTok for Business</h3><p>Reach new customers with TikTok advertising, lead generation and ecommerce campaigns.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+tiktokAffiliate+'">Start Advertising →</a><br><a class="text-link" href="tiktok-business-canada.html">Read the 2026 guide →</a>';
    shopifyCard.insertAdjacentElement('afterend',tiktokCard);
  }
  const tiktokCard=document.querySelector(`a[href="${tiktokAffiliate}"]`)?.closest('article.card');
  if((tiktokCard||shopifyCard) && !document.querySelector(`a[href="${beehiivAffiliate}"]`)?.closest('article.card')){
    const beehiivCard=document.createElement('article');
    beehiivCard.className='card';
    beehiivCard.innerHTML='<span class="tag">Newsletter growth</span><h3>beehiiv</h3><p>Build an owned email audience with newsletter publishing, audience growth and monetization tools.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+beehiivAffiliate+'">Start a Newsletter →</a><br><a class="text-link" href="best-newsletter-platforms-canadian-business.html">Read the guide →</a>';
    (tiktokCard||shopifyCard).insertAdjacentElement('afterend',beehiivCard);
  }
}

// Put TikTok and beehiiv beside Shopify in the homepage Featured Opportunities grid.
if(location.pathname==='/' || location.pathname.endsWith('/index.html')){
  const shopifyLink=document.querySelector('a[href="https://shopify.pxf.io/PzRMVN"]');
  const shopifyCard=shopifyLink?.closest('article.card');
  if(shopifyCard && !document.querySelector(`a[href="${tiktokAffiliate}"]`)){
    const tiktokCard=document.createElement('article');
    tiktokCard.className='card';
    tiktokCard.innerHTML='<span class="tag">Business advertising</span><h3>TikTok for Business</h3><p>Launch campaigns to reach customers, generate leads and support ecommerce growth.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+tiktokAffiliate+'">Get Started →</a><br><a class="text-link" href="tiktok-business-canada.html">Read the guide →</a>';
    shopifyCard.insertAdjacentElement('afterend',tiktokCard);
  }
  const tiktokCard=document.querySelector(`a[href="${tiktokAffiliate}"]`)?.closest('article.card');
  if((tiktokCard||shopifyCard) && !document.querySelector(`a[href="${beehiivAffiliate}"]`)?.closest('article.card')){
    const beehiivCard=document.createElement('article');
    beehiivCard.className='card';
    beehiivCard.innerHTML='<span class="tag">Audience ownership</span><h3>beehiiv</h3><p>Launch a newsletter, grow an email list and build a direct audience you control.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+beehiivAffiliate+'">Start a Newsletter →</a><br><a class="text-link" href="best-newsletter-platforms-canadian-business.html">Read the guide →</a>';
    (tiktokCard||shopifyCard).insertAdjacentElement('afterend',beehiivCard);
  }

  const featuredSection=shopifyCard?.closest('section');
  if(featuredSection && !document.getElementById('start-grow-business')){
    const callout=document.createElement('section');
    callout.className='section';
    callout.id='start-grow-business';
    callout.innerHTML='<div class="wrap"><div class="section-head"><span class="eyebrow">Start & Grow Your Business</span><h2>Build with Shopify. Grow with TikTok. Own the audience with beehiiv.</h2><p>Launch an online store, reach new customers and keep the relationship through an email list you control.</p></div><div class="grid-3"><article class="card"><span class="tag">Build</span><h3>Shopify</h3><p>Create and manage your ecommerce store.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="https://shopify.pxf.io/PzRMVN">View Shopify →</a></article><article class="card"><span class="tag">Grow</span><h3>TikTok for Business</h3><p>Run advertising campaigns for awareness, leads and sales.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+tiktokAffiliate+'">Start Advertising →</a></article><article class="card"><span class="tag">Own</span><h3>beehiiv</h3><p>Build a newsletter and an owned email audience.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+beehiivAffiliate+'">Start a Newsletter →</a></article></div></div>';
    featuredSection.insertAdjacentElement('afterend',callout);
  }
}

// Add current partner terms and a stronger CTA to the newsletter guide.
if(location.pathname.endsWith('/best-newsletter-platforms-canadian-business.html')){
  const h1=document.querySelector('h1');
  if(h1 && !document.getElementById('beehiiv-partner-offer')){
    const offer=document.createElement('div');
    offer.id='beehiiv-partner-offer';
    offer.className='acard';
    offer.innerHTML='<span class="badge">Featured partner offer</span><h3>Start with beehiiv</h3><p>Current partner dashboard terms shown August 5, 2026: a 14-day trial and 20% off for 3 months for referred customers. Terms can change, so confirm them on beehiiv before signing up.</p><a class="btn" href="'+beehiivAffiliate+'" rel="sponsored nofollow noopener" target="_blank">Start Your Newsletter →</a>';
    h1.insertAdjacentElement('afterend',offer);
  }
}

// AFN account and offer are disabled. Remove every AFN destination from rendered pages.
document.querySelectorAll('a[href*="advancefundsnetwork.com"]').forEach(link=>{
  const card=link.closest('article,.card');
  if(card){card.remove();return;}
  link.remove();
});
