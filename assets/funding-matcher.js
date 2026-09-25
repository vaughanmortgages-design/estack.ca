(()=>{"use strict";
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const state={category:"",amount_range:"",urgency:"",business_age:"",monthly_revenue:"",fund_use:"",equipment_type:"",equipment_value:"",new_or_used:"",credit_range:"",purpose:""};
const labels={business:"Business financing",equipment:"Equipment financing",personal:"Personal financing",debt:"Debt consolidation",vehicle:"Vehicle financing",other:"Other financing"};
const questions={
category:{title:"What do you need financing for?",options:[["business","Business"],["equipment","Equipment"],["personal","Personal expenses"],["debt","Debt consolidation"],["vehicle","Vehicle"],["other","Something else"]]},
amount_range:{title:"How much are you looking for?",options:[["under-10k","Under $10,000"],["10-25k","$10K–$25K"],["25-50k","$25K–$50K"],["50-100k","$50K–$100K"],["100-250k","$100K–$250K"],["250k-plus","$250K+"]]},
business_age:{title:"How long has your business been operating?",options:[["under-6m","Less than 6 months"],["6-12m","6–12 months"],["1-2y","1–2 years"],["2y-plus","More than 2 years"]]},
monthly_revenue:{title:"Approximate monthly business revenue?",options:[["under-10k","Under $10K"],["10-25k","$10K–$25K"],["25-50k","$25K–$50K"],["50-100k","$50K–$100K"],["100k-plus","$100K+"]]},
fund_use:{title:"What do you need the money for?",options:[["working-capital","Working capital"],["inventory","Inventory"],["expansion","Expansion"],["payroll","Payroll"],["equipment","Equipment"],["renovations","Renovations"],["other","Other"]]},
equipment_type:{title:"What are you financing?",options:[["construction","Construction equipment"],["vehicle","Commercial vehicle"],["manufacturing","Manufacturing equipment"],["restaurant","Restaurant equipment"],["medical","Medical equipment"],["other","Other"]]},
new_or_used:{title:"Is the equipment new or used?",options:[["new","New"],["used","Used"],["undecided","Not decided"]]},
purpose:{title:"What is the financing mainly for?",options:[["debt-consolidation","Debt consolidation"],["major-purchase","Major purchase"],["home-expense","Home expense"],["emergency","Emergency expense"],["other","Other"]]},
credit_range:{title:"How would you describe your credit?",note:"No exact score is required.",options:[["excellent","Excellent"],["good","Good"],["fair","Fair"],["challenged","Challenged"],["unsure","Not sure"]]},
urgency:{title:"How quickly do you need financing?",options:[["asap","ASAP"],["7-days","Within 7 days"],["30-days","Within 30 days"],["research","Just researching"]]}
};
let flow=[],index=0,partners=[];
function track(name,params={}){window.dataLayer=window.dataLayer||[];window.dataLayer.push(Object.assign({event:name},params));if(typeof window.gtag==="function")window.gtag("event",name,params);}
window.eStackTrack=track;
function buildFlow(){flow=["category","amount_range"];if(state.category==="business")flow.push("business_age","monthly_revenue","fund_use");if(state.category==="equipment")flow.push("equipment_type","equipment_value","new_or_used");if(state.category==="personal")flow.push("purpose","credit_range");if(state.category==="debt")flow.push("credit_range");flow.push("urgency","lead");}
function clearBranch(){["business_age","monthly_revenue","fund_use","equipment_type","equipment_value","new_or_used","credit_range","purpose"].forEach(k=>state[k]="");}
function render(){
 const stage=$("#questionStage"),lead=$("#leadStage"),result=$("#resultStage");
 stage.classList.add("hidden");lead.classList.add("hidden");result.classList.remove("active");
 const key=flow[index];
 $("#stepText").textContent="Step "+(index+1)+" of "+flow.length;
 $("#bar").style.width=(((index+1)/flow.length)*100)+"%";
 if(key==="lead"){lead.classList.remove("hidden");track("lead_form_view",{category:state.category});populateHidden();return;}
 stage.classList.remove("hidden");
 if(key==="equipment_value"){
   stage.innerHTML='<div class="eyebrow">Purchase amount</div><h2>Approximate equipment price?</h2><p class="question-note">A rough figure is fine.</p><div class="field money-input"><input id="equipmentValueInput" type="number" inputmode="decimal" min="1" step="1" placeholder="75000" aria-label="Approximate equipment price" value="'+(state.equipment_value||"")+'"></div><div class="qnav"><button class="btn btn-soft" id="backBtn" type="button">Back</button><button class="btn btn-green" id="nextBtn" type="button">Continue</button></div>';
   $("#backBtn").addEventListener("click",back);
   $("#nextBtn").addEventListener("click",()=>{const v=$("#equipmentValueInput").value.trim();if(!v||Number(v)<=0)return;state.equipment_value=v;next();});
   return;
 }
 const q=questions[key];
 stage.innerHTML='<div class="eyebrow">Funding matcher</div><h2>'+q.title+'</h2>'+(q.note?'<p class="question-note">'+q.note+'</p>':'')+'<div class="options" id="options"></div><div class="qnav"><button class="btn btn-soft" id="backBtn" type="button"'+(index===0?' disabled':'')+'>Back</button><button class="btn btn-green" id="nextBtn" type="button" disabled>Continue</button></div>';
 const opts=$("#options");
 q.options.forEach(pair=>{
   const value=pair[0],label=pair[1],b=document.createElement("button");
   b.type="button";b.className="choice"+(state[key]===value?" selected":"");b.textContent=label;
   b.addEventListener("click",()=>{
     $$(".choice",opts).forEach(x=>x.classList.remove("selected"));
     b.classList.add("selected");
     if(key==="category"&&state.category&&state.category!==value)clearBranch();
     state[key]=value;$("#nextBtn").disabled=false;
     if(key==="category")track("category_selected",{category:value});
     if(key==="amount_range")track("amount_selected",{amount_range:value});
   });
   opts.appendChild(b);
 });
 $("#backBtn").addEventListener("click",back);
 $("#nextBtn").disabled=!state[key];
 $("#nextBtn").addEventListener("click",next);
}
function next(){const key=flow[index];if(key==="category"){buildFlow();track("matcher_start",{category:state.category});}index=Math.min(index+1,flow.length-1);if(index>=Math.ceil(flow.length/2))track("matcher_50_percent",{category:state.category});render();}
function back(){if(index===0)return;index--;render();}
function populateHidden(){
 Object.entries(state).forEach(entry=>{const el=$('[name="'+entry[0]+'"]');if(el)el.value=entry[1];});
 const u=new URL(location.href);
 [["source","utm_source"],["medium","utm_medium"],["campaign","utm_campaign"]].forEach(pair=>{const el=$('[name="'+pair[0]+'"]');if(el)el.value=u.searchParams.get(pair[1])||"";});
 $('[name="landing_page"]').value=location.pathname;
 $('[name="referrer"]').value=document.referrer||"";
 $('[name="recommended_category"]').value=labels[state.category]||"Financing options";
 $('[name="status"]').value="MATCHED";
}
function encodeForm(form){return new URLSearchParams(new FormData(form)).toString();}
function moneyLower(range){return({"under-10k":0,"10-25k":10000,"25-50k":25000,"50-100k":50000,"100-250k":100000,"250k-plus":250000}[range]||0);}
function revenueLower(range){return({"under-10k":0,"10-25k":10000,"25-50k":25000,"50-100k":50000,"100k-plus":100000}[range]||0);}
function ageMonths(v){return({"under-6m":0,"6-12m":6,"1-2y":12,"2y-plus":24}[v]||0);}
function partnerMatches(p){if(!p.active||!Array.isArray(p.categories)||!p.categories.includes(state.category))return false;if(p.minAmount&&moneyLower(state.amount_range)<p.minAmount)return false;if(p.minBusinessMonths&&ageMonths(state.business_age)<p.minBusinessMonths)return false;if(p.minMonthlyRevenue&&revenueLower(state.monthly_revenue)<p.minMonthlyRevenue)return false;return true;}
function safeUrl(url){try{const u=new URL(url);return u.protocol==="https:"?u.href:"#";}catch(e){return"#";}}
function showResult(){
 $("#questionStage").classList.add("hidden");$("#leadStage").classList.add("hidden");$("#resultStage").classList.add("active");
 $("#stepText").textContent="Your starting point";$("#bar").style.width="100%";
 $("#resultTitle").textContent=labels[state.category]||"Financing options";
 $("#resultCopy").textContent="Based on what you told us, this is a sensible category to explore next. A provider—not eStack—decides eligibility, rates and terms.";
 const list=$("#partnerList");list.innerHTML="";
 const matched=partners.filter(partnerMatches);
 if(matched.length){
   matched.forEach(p=>{
     const div=document.createElement("div");div.className="partner";
     const strong=document.createElement("strong");strong.textContent=p.name;
     const desc=document.createElement("p");desc.textContent=p.notes||"Review the provider's current eligibility and terms directly.";
     const a=document.createElement("a");a.className="btn btn-green";a.href=safeUrl(p.destinationUrl);a.target="_blank";a.rel="sponsored nofollow noopener";a.textContent="Review provider →";
     a.addEventListener("click",()=>track("partner_click",{partner:p.name,category:state.category}));
     div.append(strong,desc,a);list.appendChild(div);
   });
 }else{
   const div=document.createElement("div");div.className="partner";
   const strong=document.createElement("strong");strong.textContent="No active partner route is being shown for this profile yet.";
   const p=document.createElement("p");p.textContent="Your information was saved. eStack can follow up with a relevant next step without pretending a lender match exists.";
   div.append(strong,p);list.appendChild(div);
 }
 track("lead_submit",{category:state.category,amount_range:state.amount_range,urgency:state.urgency});
}
async function loadPartners(){try{const r=await fetch("/data/funding-partners.json",{cache:"no-store"});if(r.ok)partners=await r.json();}catch(e){partners=[];}}
document.addEventListener("DOMContentLoaded",()=>{
 track("matcher_view",{path:location.pathname});buildFlow();render();loadPartners();
 const form=$("#leadForm");
 form.addEventListener("submit",async e=>{
   e.preventDefault();populateHidden();const err=$("#formError");err.classList.remove("show");
   const consent=$('[name="consent"]');
   if(!form.checkValidity()||!consent.checked){form.reportValidity();return;}
   $('[name="consent_timestamp"]').value=new Date().toISOString();
   $("#submitBtn").disabled=true;$("#submitBtn").textContent="Saving…";
   try{
     const res=await fetch("/funding-finder",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:encodeForm(form)});
     if(!res.ok)throw new Error("submit");
     showResult();
   }catch(e){
     err.textContent="We couldn't save your request. Please try again or email info@estack.ca.";
     err.classList.add("show");
   }finally{
     $("#submitBtn").disabled=false;$("#submitBtn").textContent="Show My Options";
   }
 });
 $("#restart").addEventListener("click",()=>{Object.keys(state).forEach(k=>state[k]="");flow=[];index=0;buildFlow();$("#resultStage").classList.remove("active");render();window.scrollTo({top:0,behavior:"smooth"});});
});
})();