document.querySelector('[data-menu]')?.addEventListener('click',e=>{const n=document.querySelector('[data-nav]');const open=n.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open))});

document.querySelectorAll('a[href="https://leadscout.ca/?ref=ZX3kIzQG"], a[href="https://leadscout.ca/?ref=ZX3klzQG"]').forEach(link=>{
  link.setAttribute('href','/leadscout-canada-loans.html');
  link.removeAttribute('target');
  link.setAttribute('rel','');
});

// AFN account and offer are disabled. Remove every AFN destination from rendered pages.
document.querySelectorAll('a[href*="advancefundsnetwork.com"]').forEach(link=>{
  const card=link.closest('article,.card');
  if(card){card.remove();return;}
  link.remove();
});
