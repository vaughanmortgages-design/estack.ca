document.querySelector('[data-menu]')?.addEventListener('click',e=>{const n=document.querySelector('[data-nav]');const open=n.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open))});

document.querySelectorAll('a[href="https://leadscout.ca/?ref=ZX3kIzQG"], a[href="https://leadscout.ca/?ref=ZX3klzQG"]').forEach(link=>{
  link.setAttribute('href','/leadscout-canada-loans.html');
  link.removeAttribute('target');
  link.setAttribute('rel','');
});

const tiktokAffiliate='https://getstartedtiktok.partnerlinks.io/19gddff1jq85';
const beehiivAffiliate='https://www.beehiiv.com/?via=paul-malandrino';
const windsorAffiliate='https://windsor.ai/?fpr=paul17';

function createPartnerCard({tag,title,copy,href,cta,guide,guideText}){
  const card=document.createElement('article');
  card.className='card';
  card.innerHTML='<span class="tag">'+tag+'</span><h3>'+title+'</h3><p>'+copy+'</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+href+'">'+cta+' →</a>'+(guide?'<br><a class="text-link" href="'+guide+'">'+guideText+' →</a>':'');
  return card;
}

// Feature TikTok for Business, beehiiv and Windsor.ai near Shopify on Tech & AI Tools.
if(location.pathname.endsWith('/tech-ai-tools.html') || location.pathname === '/tech-ai-tools.html'){
  const shopifyLink=document.querySelector('a[href="https://shopify.pxf.io/PzRMVN"]');
  const shopifyCard=shopifyLink?.closest('article.card');

  if(shopifyCard && !document.querySelector(`a[href="${tiktokAffiliate}"]`)){
    shopifyCard.insertAdjacentElement('afterend',createPartnerCard({tag:'Business growth',title:'TikTok for Business',copy:'Reach new customers with TikTok advertising, lead generation and ecommerce campaigns.',href:tiktokAffiliate,cta:'Start Advertising',guide:'tiktok-business-canada.html',guideText:'Read the 2026 guide'}));
  }

  const tiktokCard=document.querySelector(`a[href="${tiktokAffiliate}"]`)?.closest('article.card');
  if((tiktokCard||shopifyCard) && !document.querySelector(`a[href="${beehiivAffiliate}"]`)?.closest('article.card')){
    (tiktokCard||shopifyCard).insertAdjacentElement('afterend',createPartnerCard({tag:'Newsletter growth',title:'beehiiv',copy:'Build an owned email audience with newsletter publishing, audience growth and monetization tools.',href:beehiivAffiliate,cta:'Start a Newsletter',guide:'best-newsletter-platforms-canadian-business.html',guideText:'Read the guide'}));
  }

  const beehiivCard=document.querySelector(`a[href="${beehiivAffiliate}"]`)?.closest('article.card');
  const existingWindsor=document.querySelector(`a[href="${windsorAffiliate}"]`)?.closest('article.card');
  if((beehiivCard||tiktokCard||shopifyCard) && !existingWindsor){
    (beehiivCard||tiktokCard||shopifyCard).insertAdjacentElement('afterend',createPartnerCard({tag:'Marketing analytics',title:'Windsor.ai',copy:'Connect advertising and ecommerce data in one reporting workflow for clearer cross-channel measurement.',href:windsorAffiliate,cta:'Try Windsor.ai',guide:'windsor-ai-review-canada.html',guideText:'Read the full review'}));
  } else if(existingWindsor && beehiivCard && existingWindsor.previousElementSibling!==beehiivCard){
    beehiivCard.insertAdjacentElement('afterend',existingWindsor);
  }
}

// Put flagship business tools on the homepage.
if(location.pathname==='/' || location.pathname.endsWith('/index.html')){
  const shopifyLink=document.querySelector('a[href="https://shopify.pxf.io/PzRMVN"]');
  const shopifyCard=shopifyLink?.closest('article.card');

  if(shopifyCard && !document.querySelector(`a[href="${tiktokAffiliate}"]`)){
    shopifyCard.insertAdjacentElement('afterend',createPartnerCard({tag:'Business advertising',title:'TikTok for Business',copy:'Launch campaigns to reach customers, generate leads and support ecommerce growth.',href:tiktokAffiliate,cta:'Get Started',guide:'tiktok-business-canada.html',guideText:'Read the guide'}));
  }

  const tiktokCard=document.querySelector(`a[href="${tiktokAffiliate}"]`)?.closest('article.card');
  if((tiktokCard||shopifyCard) && !document.querySelector(`a[href="${beehiivAffiliate}"]`)?.closest('article.card')){
    (tiktokCard||shopifyCard).insertAdjacentElement('afterend',createPartnerCard({tag:'Audience ownership',title:'beehiiv',copy:'Launch a newsletter, grow an email list and build a direct audience you control.',href:beehiivAffiliate,cta:'Start a Newsletter',guide:'best-newsletter-platforms-canadian-business.html',guideText:'Read the guide'}));
  }

  const beehiivCard=document.querySelector(`a[href="${beehiivAffiliate}"]`)?.closest('article.card');
  const existingWindsor=document.querySelector(`a[href="${windsorAffiliate}"]`)?.closest('article.card');
  if((beehiivCard||tiktokCard||shopifyCard) && !existingWindsor){
    (beehiivCard||tiktokCard||shopifyCard).insertAdjacentElement('afterend',createPartnerCard({tag:'Measure',title:'Windsor.ai',copy:'Bring marketing data together to compare performance across channels and improve reporting.',href:windsorAffiliate,cta:'View Platform',guide:'windsor-ai-review-canada.html',guideText:'Read the review'}));
  } else if(existingWindsor && beehiivCard && existingWindsor.previousElementSibling!==beehiivCard){
    beehiivCard.insertAdjacentElement('afterend',existingWindsor);
  }

  const featuredSection=shopifyCard?.closest('section');
  if(featuredSection && !document.getElementById('start-grow-business')){
    const callout=document.createElement('section');
    callout.className='section';
    callout.id='start-grow-business';
    callout.innerHTML='<div class="wrap"><div class="section-head"><span class="eyebrow">Start & Grow Your Business</span><h2>Build. Reach. Own. Measure.</h2><p>Launch with Shopify, reach customers with TikTok, own the relationship with beehiiv and measure performance with Windsor.ai.</p></div><div class="grid-3"><article class="card"><span class="tag">Build</span><h3>Shopify</h3><p>Create and manage your ecommerce store.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="https://shopify.pxf.io/PzRMVN">View Shopify →</a></article><article class="card"><span class="tag">Grow</span><h3>TikTok for Business</h3><p>Run advertising campaigns for awareness, leads and sales.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+tiktokAffiliate+'">Start Advertising →</a></article><article class="card"><span class="tag">Own</span><h3>beehiiv</h3><p>Build a newsletter and an owned email audience.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+beehiivAffiliate+'">Start a Newsletter →</a></article></div><div class="grid-3" style="margin-top:1.5rem"><article class="card"><span class="tag">Measure</span><h3>Windsor.ai</h3><p>Connect marketing data and build clearer cross-channel reporting.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="'+windsorAffiliate+'">Try Windsor.ai →</a><br><a class="text-link" href="windsor-ai-review-canada.html">Read the review →</a></article></div></div>';
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

// Strengthen the Windsor.ai review with an above-the-fold CTA and verified partner reward note.
if(location.pathname.endsWith('/windsor-ai-review-canada.html')){
  const h1=document.querySelector('h1');
  if(h1 && !document.getElementById('windsor-featured-offer')){
    const offer=document.createElement('div');
    offer.id='windsor-featured-offer';
    offer.className='cta-box';
    offer.innerHTML='<h3>Connect Your Marketing Data with Windsor.ai</h3><p>Use one reporting workflow for data from advertising, ecommerce and analytics platforms. Confirm current plans, integrations and trial availability directly with Windsor.ai.</p><a class="btn" href="'+windsorAffiliate+'" target="_blank" rel="sponsored nofollow noopener">Explore Windsor.ai →</a><p style="margin-top:1rem;font-size:.78rem;opacity:.7">Affiliate disclosure: eStack.ca may earn a commission. Partner dashboard rewards shown August 5, 2026: 30% recurring commission and 5% second-tier commission. These rewards are paid to eStack and do not change the customer price.</p>';
    h1.insertAdjacentElement('afterend',offer);
  }
}

// AFN account and offer are disabled. Remove every AFN destination from rendered pages.
document.querySelectorAll('a[href*="advancefundsnetwork.com"]').forEach(link=>{
  const card=link.closest('article,.card');
  if(card){card.remove();return;}
  link.remove();
});
