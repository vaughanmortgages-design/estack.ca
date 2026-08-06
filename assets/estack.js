document.querySelector('[data-menu]')?.addEventListener('click',e=>{const n=document.querySelector('[data-nav]');const open=n.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open))});

document.querySelectorAll('a[href="https://leadscout.ca/?ref=ZX3kIzQG"], a[href="https://leadscout.ca/?ref=ZX3klzQG"]').forEach(link=>{
  link.setAttribute('href','/leadscout-canada-loans.html');
  link.removeAttribute('target');
  link.setAttribute('rel','');
});

// Feature TikTok for Business directly beside Shopify on the Tech & AI Tools page.
if(location.pathname.endsWith('/tech-ai-tools.html') || location.pathname === '/tech-ai-tools.html'){
  const shopifyLink=document.querySelector('a[href="https://shopify.pxf.io/PzRMVN"]');
  const shopifyCard=shopifyLink?.closest('article.card');
  if(shopifyCard && !document.querySelector('a[href="https://getstartedtiktok.partnerlinks.io/19gddff1jq85"]')){
    const tiktokCard=document.createElement('article');
    tiktokCard.className='card';
    tiktokCard.innerHTML='<span class="tag">Business growth</span><h3>TikTok for Business</h3><p>Create advertising campaigns designed to help businesses reach new customers and drive measurable growth.</p><a class="card-link" target="_blank" rel="sponsored nofollow noopener" href="https://getstartedtiktok.partnerlinks.io/19gddff1jq85">Start Advertising →</a>';
    shopifyCard.insertAdjacentElement('afterend',tiktokCard);
  }
}

// AFN account and offer are disabled. Remove every AFN destination from rendered pages.
document.querySelectorAll('a[href*="advancefundsnetwork.com"]').forEach(link=>{
  const card=link.closest('article,.card');
  if(card){card.remove();return;}
  link.remove();
});
