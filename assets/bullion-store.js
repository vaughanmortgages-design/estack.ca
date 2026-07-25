const PRODUCT_ROOT='/data/products';
const DEALER_SOURCE='/data/dealers/dealers.json';

export function createDealerBadge(dealer){
  const badge=document.createElement('span');
  badge.className='dealer-pill';
  badge.textContent=dealer.badge||dealer.name;
  badge.setAttribute('aria-label',`Dealer: ${dealer.name}`);
  return badge;
}

function verifiedAffiliateUrl(product,dealer){
  if(product.affiliateVerified!==true||!product.affiliateUrl)return '';
  try{
    const url=new URL(product.affiliateUrl);
    const validation=dealer.affiliateValidation;
    if(url.protocol!=='https:'||!validation)return '';
    if(validation.hosts?.length&&!validation.hosts.includes(url.hostname.toLowerCase()))return '';
    return Object.entries(validation.requiredQuery||{}).every(([name,value])=>url.searchParams.get(name)===String(value))
      ? url.toString()
      : '';
  }catch{
    return '';
  }
}

function verifiedPrice(product){
  if(product.priceDisplay)return product.priceDisplay;
  if(product.price===null||product.price===undefined||product.price==='')return 'See dealer for price';
  const price=Number(product.price);
  if(!Number.isFinite(price))return 'See dealer for price';
  try{
    return new Intl.NumberFormat('en-CA',{style:'currency',currency:product.currency||'CAD'}).format(price);
  }catch{
    return `${price.toFixed(2)} ${product.currency||'CAD'}`;
  }
}

export function createProductCard(product,dealer){
  const article=document.createElement('article');
  article.className='product-card';
  const image=document.createElement('div');
  image.className='product-image';
  if(product.image){
    const img=document.createElement('img');
    img.src=product.image;
    img.alt=product.content?.altText||product.imageAlt||product.title;
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
  description.textContent=product.content?.shortDescription||product.shortDescription||product.description||'Verified product details will appear with the dealer feed.';
  const meta=document.createElement('div');
  meta.className='product-meta';
  meta.append(createDealerBadge(dealer));
  const price=document.createElement('span');
  price.className='price-placeholder';
  price.textContent=verifiedPrice(product);
  meta.append(price);
  const affiliateUrl=verifiedAffiliateUrl(product,dealer);
  const cta=document.createElement(affiliateUrl?'a':'span');
  cta.className='product-cta';
  cta.textContent=affiliateUrl?'Shop Now':'Coming Soon';
  if(affiliateUrl){
    cta.href=affiliateUrl;
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
  const affiliateUrl=verifiedAffiliateUrl(product,dealer);
  if(affiliateUrl&&product.price!==null){
    schema.offers={
      '@type':'Offer',
      url:affiliateUrl,
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
    img.alt=product.content?.altText||product.imageAlt||product.title;
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
  description.textContent=product.content?.shortDescription||product.description||'Verified product details will appear with the dealer feed.';
  const affiliateUrl=verifiedAffiliateUrl(product,dealer);
  const cta=document.createElement(affiliateUrl?'a':'span');
  cta.className='ig-shop-button';
  cta.textContent=affiliateUrl?'Shop Now':'Coming Soon';
  if(affiliateUrl){
    cta.href=affiliateUrl;
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
  const featuredGrid=document.querySelector('[data-showroom-grid="featured"]');
  if(!featuredGrid)return;
  try{
    const [showroomResponse,dealerData]=await Promise.all([
      fetch('/data/products/showroom-products.json'),
      loadDealers()
    ]);
    if(!showroomResponse.ok)throw new Error('Showroom data unavailable');
    const {sections={}}=await showroomResponse.json();
    const dealerMap=new Map(dealerData.dealers.map(dealer=>[dealer.id,dealer]));
    const sectionMap=[
      ['featured','today'],
      ['gold','gold'],
      ['silver','silver'],
      ['platinum','platinum'],
      ['new-releases','newReleases'],
      ['best-value','bestValue']
    ];
    sectionMap.forEach(([gridName,dataName])=>{
      const products=sections[dataName]||[];
      if(!products.length)return;
      const grid=document.querySelector(`[data-showroom-grid="${gridName}"]`);
      if(!grid)return;
      grid.innerHTML='';
      grid.className='product-grid showroom-grid';
      products.forEach(product=>{
        const dealer=dealerMap.get(product.dealerId);
        if(dealer)grid.append(createProductCard(product,dealer));
      });
      document.querySelector(`[data-showroom-empty="${gridName}"]`)?.remove();
    });
    const lead=sections.today?.[0];
    if(lead){
      const dealer=dealerMap.get(lead.dealerId);
      const title=document.querySelector('[data-featured-hero-title]');
      const description=document.querySelector('[data-featured-hero-description]');
      const cta=document.querySelector('[data-featured-hero-cta]');
      if(title)title.textContent=lead.title;
      if(description)description.textContent=`${lead.content?.shortDescription||lead.description||lead.title} Featured through ${dealer?.name||lead.dealerId}.`;
      const affiliateUrl=dealer?verifiedAffiliateUrl(lead,dealer):'';
      if(cta&&affiliateUrl){cta.href=affiliateUrl;cta.target='_blank';cta.rel='sponsored nofollow noopener noreferrer';cta.textContent='Shop Now'}
    }
  }catch(error){
    featuredGrid.setAttribute('data-featured-error','true');
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
