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
  const meta=document.createElement('div');
  meta.className='product-meta';
  meta.append(createDealerBadge(dealer));
  const price=document.createElement('span');
  price.className='price-placeholder';
  price.textContent=product.priceDisplay||'Price pending verification';
  meta.append(price);
  const cta=document.createElement('a');
  cta.className='product-cta';
  cta.textContent=product.cta||'View at dealer';
  cta.href=product.url;
  cta.target='_blank';
  cta.rel='sponsored nofollow noopener noreferrer';
  body.append(title,meta,cta);
  article.append(image,body);
  return article;
}

function productSchema(product,dealer){
  return {
    '@context':'https://schema.org',
    '@type':'Product',
    name:product.title,
    image:product.image,
    brand:{'@type':'Brand',name:product.brand||dealer.name},
    offers:{
      '@type':'Offer',
      url:product.url,
      priceCurrency:product.currency,
      price:product.price,
      availability:product.availability||'https://schema.org/InStock',
      seller:{'@type':'Organization',name:dealer.name}
    }
  };
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
    const [productsResponse,dealerData]=await Promise.all([
      fetch('/data/products/instagram.json'),
      loadDealers()
    ]);
    if(!productsResponse.ok)throw new Error('Instagram product data unavailable');
    const {products=[]}=await productsResponse.json();
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
      products.forEach(product=>{
        const dealer=dealerMap.get(product.dealerId);
        if(dealer)grid.append(createIgProductCard(product,dealer));
      });
    }
    const carousel=document.querySelector('[data-featured-carousel]');
    const featured=products.filter(product=>product.featured&&product.affiliateUrl);
    if(carousel&&featured.length){
      carousel.innerHTML='';
      featured.forEach(product=>{
        const dealer=dealerMap.get(product.dealerId);
        if(dealer)carousel.append(createIgProductCard(product,dealer));
      });
    }
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
    products.forEach(product=>{
      const dealer=dealerMap.get(product.dealerId);
      if(!dealer||!product.url)return;
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

const searchForm=document.querySelector('[data-product-search]');
const searchInput=document.querySelector('#ig-product-search');
const applyIgFilters=()=>{
  const active=document.querySelector('[data-filter-row] .active')?.dataset.filter||'all';
  const query=(searchInput?.value||'').trim().toLowerCase();
  document.querySelectorAll('.ig-product-card').forEach(card=>{
    const categoryMatch=active==='all'||card.dataset.collection===active;
    const searchMatch=!query||card.dataset.search.includes(query);
    card.hidden=!(categoryMatch&&searchMatch);
  });
};
searchForm?.addEventListener('submit',event=>{event.preventDefault();applyIgFilters()});
searchInput?.addEventListener('input',applyIgFilters);
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-filter]').forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  applyIgFilters();
}));
document.querySelector('[data-carousel-prev]')?.addEventListener('click',()=>document.querySelector('[data-featured-carousel]')?.scrollBy({left:-300,behavior:'smooth'}));
document.querySelector('[data-carousel-next]')?.addEventListener('click',()=>document.querySelector('[data-featured-carousel]')?.scrollBy({left:300,behavior:'smooth'}));
