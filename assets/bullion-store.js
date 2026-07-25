const PRODUCT_ROOT='/data/products';
const DEALER_SOURCE='/data/dealers/dealers.json';

export function createDealerBadge(dealer){
  const badge=document.createElement('span');
  badge.className='dealer-pill';
  badge.textContent=dealer.badge||dealer.name;
  badge.setAttribute('aria-label',`Dealer: ${dealer.name}`);
  return badge;
}

export function createProductCard(product,dealer){
  const article=document.createElement('article');
  article.className='product-card';
  const image=document.createElement('div');
  image.className='product-image';
  if(product.image){
    const img=document.createElement('img');
    img.src=product.image;
    img.alt=product.imageAlt||product.title;
    img.loading='lazy';
    img.decoding='async';
    image.append(img);
  }
  const body=document.createElement('div');
  body.className='product-body';
  const title=document.createElement('h3');
  title.textContent=product.title;
  const description=document.createElement('p');
  description.className='product-description';
  description.textContent=product.shortDescription||product.description||'Verified product details will appear with the dealer feed.';
  const meta=document.createElement('div');
  meta.className='product-meta';
  meta.append(createDealerBadge(dealer));
  const price=document.createElement('span');
  price.className='price-placeholder';
  price.textContent=product.priceDisplay||'See dealer for price';
  meta.append(price);
  const cta=document.createElement(product.affiliateUrl?'a':'span');
  cta.className='product-cta';
  cta.textContent=product.affiliateUrl?'Shop Now':'Coming Soon';
  if(product.affiliateUrl){
    cta.href=product.affiliateUrl;
    cta.target='_blank';
    cta.rel='sponsored nofollow noopener noreferrer';
  }else{
    cta.setAttribute('aria-disabled','true');
  }
  body.append(title,description,meta,cta);
  article.append(image,body);
  return article;
}

function productSchema(product,dealer){
  const schema={
    '@context':'https://schema.org',
    '@type':'Product',
    name:product.title,
    image:product.image,
    description:product.description,
    brand:{'@type':'Brand',name:product.brand||dealer.name}
  };
  if(product.affiliateUrl&&product.price!==null){
    schema.offers={
      '@type':'Offer',
      url:product.affiliateUrl,
      priceCurrency:product.currency,
      price:product.price,
      availability:product.availability==='in stock'?'https://schema.org/InStock':product.availability==='preorder'?'https://schema.org/PreOrder':'https://schema.org/OutOfStock',
      seller:{'@type':'Organization',name:dealer.name}
    };
  }
  return schema;
}

async function loadDealers(){
  const response=await fetch(DEALER_SOURCE);
  if(!response.ok)throw new Error('Dealer data unavailable');
  return response.json();
}

async function renderDealers(){
  const grid=document.querySelector('[data-dealer-grid]');
  if(!grid)return;
  try{
    const {dealers}=await loadDealers();
    dealers.forEach(dealer=>{
      const card=document.createElement('article');
      card.className='dealer-card';
      card.innerHTML=`<span class="dealer-badge" aria-hidden="true">${dealer.badge}</span><h3>${dealer.name}</h3><p>${dealer.description}</p><small>Approved dealer badge</small>`;
      grid.append(card);
    });
  }catch(error){
    grid.innerHTML='<p>Dealer profiles are temporarily unavailable.</p>';
  }
}

function createIgProductCard(product,dealer){
  const article=document.createElement('article');
  article.className='ig-product-card';
  article.dataset.collection=product.collection||'all';
  article.dataset.dealer=dealer.id;
  article.dataset.search=`${product.title} ${product.description||''} ${dealer.name}`.toLowerCase();
  const image=document.createElement('div');
  image.className='ig-square-image';
  if(product.image){
    const img=document.createElement('img');
    img.src=product.image;
    img.alt=product.imageAlt||product.title;
    img.loading='lazy';
    img.decoding='async';
    image.append(img);
  }else{
    image.innerHTML='<span aria-hidden="true">eS</span>';
  }
  const body=document.createElement('div');
  body.className='ig-product-body';
  const badge=createDealerBadge(dealer);
  const title=document.createElement('h3');
  title.textContent=product.title;
  const description=document.createElement('p');
  description.textContent=product.description||'Verified product details will appear with the dealer feed.';
  const cta=document.createElement(product.affiliateUrl?'a':'span');
  cta.className='ig-shop-button';
  cta.textContent=product.affiliateUrl?'Shop Now':'Coming Soon';
  if(product.affiliateUrl){
    cta.href=product.affiliateUrl;
    cta.target='_blank';
    cta.rel='sponsored nofollow noopener noreferrer';
  }else{
    cta.setAttribute('aria-disabled','true');
  }
  body.append(badge,title,description,cta);
  article.append(image,body);
  return article;
}

async function renderIgStore(){
  const grid=document.querySelector('[data-ig-product-grid]');
  const dealerList=document.querySelector('[data-ig-dealer-list]');
  if(!grid&&!dealerList)return;
  try{
    const [productsResponse,featuredResponse,dealerData]=await Promise.all([
      fetch('/data/products/catalog.json'),
      fetch('/data/products/featured-products.json'),
      loadDealers()
    ]);
    if(!productsResponse.ok)throw new Error('Instagram product data unavailable');
    const {products=[]}=await productsResponse.json();
    const featuredData=featuredResponse.ok?await featuredResponse.json():{products:[]};
    const featured=featuredData.products||[];
    const dealerMap=new Map(dealerData.dealers.map(dealer=>[dealer.id,dealer]));
    if(dealerList){
      dealerData.dealers.forEach(dealer=>{
        const card=document.createElement('button');
        card.type='button';
        card.dataset.dealer=dealer.id;
        card.innerHTML=`<span class="dealer-badge">${dealer.badge}</span><span><strong>${dealer.name}</strong><small>Browse dealer products</small></span><span>→</span>`;
        dealerList.append(card);
      });
    }
    if(grid&&products.length){
      grid.innerHTML='';
      products.slice(0,20).forEach(product=>{
        const dealer=dealerMap.get(product.dealerId);
        if(dealer)grid.append(createIgProductCard(product,dealer));
      });
    }
    const carousel=document.querySelector('[data-featured-carousel]');
    if(carousel&&featured.length){
      carousel.innerHTML='';
      featured.forEach(product=>{
        const dealer=dealerMap.get(product.dealerId);
        if(dealer)carousel.append(createIgProductCard(product,dealer));
      });
    }
    const selectedId=new URLSearchParams(window.location.search).get('product');
    const selected=featured.find(product=>product.id===selectedId);
    if(selected?.seo)applyProductSeo(selected);
  }catch(error){
    grid?.setAttribute('data-error','true');
  }
}

async function renderProducts(){
  const grid=document.querySelector('[data-product-grid]');
  if(!grid)return;
  const category=grid.dataset.category;
  try{
    const [productResponse,dealerData]=await Promise.all([
      fetch(`${PRODUCT_ROOT}/${category}.json`),
      loadDealers()
    ]);
    if(!productResponse.ok)throw new Error('Product data unavailable');
    const {products=[]}=await productResponse.json();
    const dealerMap=new Map(dealerData.dealers.map(dealer=>[dealer.id,dealer]));
    const schemas=[];
    products.slice(0,12).forEach(product=>{
      const dealer=dealerMap.get(product.dealerId);
      if(!dealer)return;
      grid.append(createProductCard(product,dealer));
      if(product.price&&product.currency&&product.image)schemas.push(productSchema(product,dealer));
    });
    if(products.length){
      document.querySelector('[data-empty-state]')?.remove();
    }
    schemas.forEach(schema=>{
      const node=document.createElement('script');
      node.type='application/ld+json';
      node.textContent=JSON.stringify(schema);
      document.head.append(node);
    });
  }catch(error){
    grid.setAttribute('data-error','true');
  }
}

function setMeta(selector,attribute,value){
  if(!value)return;
  let node=document.head.querySelector(selector);
  if(!node){
    node=document.createElement('meta');
    const [name,content]=selector.match(/\[(.+?)="(.+?)"\]/)?.slice(1)||[];
    if(name)node.setAttribute(name,content);
    document.head.append(node);
  }
  node.setAttribute(attribute,value);
}

function applyProductSeo(product){
  const seo=product.seo;
  document.title=seo.openGraph?.title||document.title;
  const canonical=document.head.querySelector('link[rel="canonical"]');
  if(canonical&&seo.canonicalUrl)canonical.href=seo.canonicalUrl;
  setMeta('meta[property="og:title"]','content',seo.openGraph?.title);
  setMeta('meta[property="og:description"]','content',seo.openGraph?.description);
  setMeta('meta[property="og:image"]','content',seo.openGraph?.image);
  setMeta('meta[name="twitter:title"]','content',seo.twitterCard?.title);
  setMeta('meta[name="twitter:description"]','content',seo.twitterCard?.description);
  setMeta('meta[name="twitter:image"]','content',seo.twitterCard?.image);
  if(seo.jsonLd){
    const node=document.createElement('script');
    node.type='application/ld+json';
    node.textContent=JSON.stringify(seo.jsonLd);
    document.head.append(node);
  }
}

async function renderDailyHomepage(){
  const grid=document.querySelector('[data-showroom-grid="featured"]');
  if(!grid)return;
  try{
    const [featuredResponse,dealerData]=await Promise.all([
      fetch('/data/products/featured-products.json'),
      loadDealers()
    ]);
    if(!featuredResponse.ok)return;
    const {products=[]}=await featuredResponse.json();
    if(!products.length)return;
    const dealerMap=new Map(dealerData.dealers.map(dealer=>[dealer.id,dealer]));
    const curated=products.slice(0,6);
    grid.innerHTML='';
    grid.className='product-grid';
    curated.forEach(product=>{
      const dealer=dealerMap.get(product.dealerId);
      if(dealer)grid.append(createProductCard(product,dealer));
    });
    const newGrid=document.querySelector('[data-showroom-grid="new"]');
    const newest=[...products].sort((left,right)=>String(right.createdAt||'').localeCompare(String(left.createdAt||''))).slice(0,4);
    newest.forEach(product=>{const dealer=dealerMap.get(product.dealerId);if(dealer)newGrid?.append(createProductCard(product,dealer))});
    if(newest.length)document.querySelector('[data-showroom-empty="new"]')?.remove();
    const valueGrid=document.querySelector('[data-showroom-grid="value"]');
    const value=products.filter(product=>product.scoreBreakdown?.priceReduction>0||product.merchantPriority>0).slice(0,4);
    value.forEach(product=>{const dealer=dealerMap.get(product.dealerId);if(dealer)valueGrid?.append(createProductCard(product,dealer))});
    if(value.length)document.querySelector('[data-showroom-empty="value"]')?.remove();
    const lead=curated[0];
    if(lead){
      const dealer=dealerMap.get(lead.dealerId);
      const title=document.querySelector('[data-featured-hero-title]');
      const description=document.querySelector('[data-featured-hero-description]');
      const cta=document.querySelector('[data-featured-hero-cta]');
      if(title)title.textContent=lead.title;
      if(description)description.textContent=`${lead.description} Featured through ${dealer?.name||lead.dealerId}.`;
      if(cta&&lead.affiliateUrl){cta.href=lead.affiliateUrl;cta.target='_blank';cta.rel='sponsored nofollow noopener noreferrer';cta.textContent='Shop Now'}
    }
  }catch(error){
    grid.setAttribute('data-featured-error','true');
  }
}

const menu=document.querySelector('.store-menu');
const navigation=document.querySelector('.store-links');
menu?.addEventListener('click',()=>{
  const open=menu.getAttribute('aria-expanded')==='true';
  menu.setAttribute('aria-expanded',String(!open));
  navigation?.classList.toggle('open',!open);
});

renderDealers();
renderProducts();
renderIgStore();
renderDailyHomepage();

const searchForm=document.querySelector('[data-product-search]');
const searchInput=document.querySelector('#ig-product-search');
const applyIgFilters=()=>{
  const active=document.querySelector('[data-filter-row] .active')?.dataset.filter||'all';
  const dealer=document.querySelector('[data-ig-dealer-list] .active')?.dataset.dealer||'all';
  const query=(searchInput?.value||'').trim().toLowerCase();
  document.querySelectorAll('.ig-product-card').forEach(card=>{
    const categoryMatch=active==='all'||card.dataset.collection===active;
    const dealerMatch=dealer==='all'||card.dataset.dealer===dealer;
    const searchMatch=!query||card.dataset.search.includes(query);
    card.hidden=!(categoryMatch&&dealerMatch&&searchMatch);
  });
};
searchForm?.addEventListener('submit',event=>{event.preventDefault();applyIgFilters()});
searchInput?.addEventListener('input',applyIgFilters);
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-filter]').forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  applyIgFilters();
}));
document.querySelector('[data-ig-dealer-list]')?.addEventListener('click',event=>{
  const button=event.target.closest('[data-dealer]');
  if(!button)return;
  const wasActive=button.classList.contains('active');
  document.querySelectorAll('[data-ig-dealer-list] [data-dealer]').forEach(item=>item.classList.remove('active'));
  if(!wasActive)button.classList.add('active');
  applyIgFilters();
});
document.querySelector('[data-carousel-prev]')?.addEventListener('click',()=>document.querySelector('[data-featured-carousel]')?.scrollBy({left:-300,behavior:'smooth'}));
document.querySelector('[data-carousel-next]')?.addEventListener('click',()=>document.querySelector('[data-featured-carousel]')?.scrollBy({left:300,behavior:'smooth'}));

