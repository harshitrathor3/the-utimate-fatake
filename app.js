const $=s=>document.querySelector(s), fmt=n=>'\u20B9'+n.toLocaleString('en-IN');
let D, P={}, q='', cart=ld('cart',{}), cust=ld('cust',{name:'',phone:''});
function ld(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
function sv(){try{localStorage.setItem('cart',JSON.stringify(cart));localStorage.setItem('cust',JSON.stringify(cust))}catch(e){}}
fetch('products.json').then(r=>r.json()).then(d=>{
  D=d; d.categories.forEach(c=>c.products.forEach(p=>P[p.id]={...p,cat:c.name}));
  document.title=d.store.name; $('#logo').textContent=d.store.name;
  Object.keys(cart).forEach(i=>{if(!P[i])delete cart[i]}); route();
}).catch(()=>$('#app').innerHTML='<p class="err">Could not load products.json. Host the folder on a web server (or run <code>python -m http.server</code>) instead of double-clicking index.html.</p>');
const items=()=>Object.entries(cart).map(([id,n])=>({...P[id],n})).sort((a,b)=>a.cat.localeCompare(b.cat));
const total=()=>items().reduce((s,i)=>s+i.n*i.price,0);
const count=()=>Object.values(cart).reduce((s,n)=>s+n,0);
function head(){$('#fab').classList.toggle('mt',!count());$('#cc').textContent=count();$('#ct').textContent=fmt(total())}
function card(p){return `<div class="card"><div class="ph">&#127878;<img loading="lazy" src="${p.image}" alt="${p.name}" onerror="this.remove()"></div>
<div class="bd"><h3>${p.name}</h3><p>${p.description}</p><div class="pr">${fmt(p.price)}</div>
<div class="row"><div class="qty"><button onclick="st('${p.id}',-1)" aria-label="Less">&minus;</button><input id="q_${p.id}" type="number" min="1" value="1" aria-label="Quantity"><button onclick="st('${p.id}',1)" aria-label="More">+</button></div>
<button class="add" onclick="add('${p.id}',this)">Add to cart</button></div></div></div>`}
function st(id,d){const e=$('#q_'+id);e.value=Math.max(1,(+e.value||1)+d)}
function add(id,b){const n=Math.max(1,parseInt($('#q_'+id).value)||1);cart[id]=(cart[id]||0)+n;$('#q_'+id).value=1;upd();b.textContent='Added \u2713';b.classList.add('ok');clearTimeout(b.t);b.t=setTimeout(()=>{b.textContent='Add to cart';b.classList.remove('ok')},1200);const c=$('#fab');c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop')}
function setq(id,n){n=parseInt(n)||0;if(n<1)delete cart[id];else cart[id]=n;upd()}
function upd(){sv();head();rdr();if(location.hash=='#/cart')route()}
function route(){
  head(); rdr(); $('#fab').hidden=location.hash=='#/cart';
  if(location.hash=='#/cart')return cartPage();
  const t=q.trim().toLowerCase();
  const cats=D.categories.map(c=>({...c,products:t?c.products.filter(p=>(p.name+p.description+c.name).toLowerCase().includes(t)):c.products})).filter(c=>c.products.length);
  $('#app').innerHTML=(t?'':`<div class="hero"><h1>${D.store.tagline}</h1><p>Pick your crackers, set quantity, download your order sheet.</p></div>`)
   +`<nav class="chips">${cats.map((c,i)=>`<a href="#c${i}" onclick="document.getElementById('c${i}').scrollIntoView();return false">${c.name}</a>`).join('')}${t?'':'<a href="#contact" onclick="document.getElementById(\'contact\').scrollIntoView();return false">Contact</a>'}</nav><main>`
   +(cats.length?cats.map((c,i)=>`<h2 id="c${i}">${c.name}</h2><div class="grid">${c.products.map(card).join('')}</div>`).join(''):`<p class="empty">No crackers match "${q}". Try a shorter word.</p>`)+'</main>'+(t?'':contact());spy();
}
function cartPage(){
  const it=items();
  $('#app').innerHTML=`<main><a href="#" class="mut">&larr; Continue shopping</a><h2>Your order</h2><div class="pg">`+(it.length?`
  <div class="cu"><input id="cn" placeholder="Customer name" value="${cust.name}" oninput="cust.name=this.value;sv()"><input id="cp" type="tel" placeholder="Phone number" value="${cust.phone}" oninput="cust.phone=this.value;sv()"></div>
  ${it.map(i=>`<div class="ci"><div><b>${i.name}</b><div class="mut">${i.cat} &middot; ${fmt(i.price)} each</div><div class="qty"><button onclick="setq('${i.id}',${i.n-1})" aria-label="Less">&minus;</button><input type="number" value="${i.n}" onchange="setq('${i.id}',this.value)" aria-label="Quantity"><button onclick="setq('${i.id}',${i.n+1})" aria-label="More">+</button></div></div><div class="ca"><b>${fmt(i.n*i.price)}</b><button class="x" onclick="setq('${i.id}',0)" aria-label="Remove">&times;</button></div></div>`).join('')}
  <div class="tot" style="margin:18px 0"><span>Total (${count()} items)</span><span>${fmt(total())}</span></div>${min()}
  <div class="acts"><button class="btn p" onclick="pdf()">Download PDF</button><button class="btn g" onclick="wa()">Send on WhatsApp</button><button class="btn" onclick="if(confirm('Clear cart?')){cart={};upd()}">Clear cart</button></div>`
  :'<p class="empty">Your cart is empty. Add some crackers to get started.</p>')+'</div></main>';
}
function contact(){
  const c=D.contact; if(!c)return '';
  const tel=p=>p.replace(/[^\d+]/g,''), dg=p=>p.replace(/\D/g,'');
  return `<section class="ct" id="contact"><h2>${c.title}</h2><p class="cl">${c.closing}</p><div class="cg">`+
  c.partners.map(p=>`<div class="cp"><div class="av">${p.name[0]}</div><b>${p.name}</b><a class="t" href="tel:${tel(p.phone)}">${p.phone}</a><div class="acts"><a class="btn" href="tel:${tel(p.phone)}">Call</a><a class="btn g" target="_blank" rel="noopener" href="https://wa.me/${dg(p.phone)}">WhatsApp</a></div></div>`).join('')+
  `</div><a class="em" href="mailto:${c.email}">${c.email}</a><p class="mut sm">&copy; ${new Date().getFullYear()} ${D.store.name}</p></section>`;
}
function spy(){
  const hs=[...document.querySelectorAll('h2[id^=c]')], nav=$('.chips'); if(!hs.length||!nav)return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
    nav.querySelectorAll('a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')=='#'+e.target.id));
    const a=nav.querySelector('a.on'); if(a)nav.scrollTo({left:a.offsetLeft-24,behavior:'smooth'});
  }),{rootMargin:'-140px 0px -70% 0px'});
  hs.forEach(h=>io.observe(h));
}
const min=()=>total()<D.store.minOrder?`<p class="note">Minimum order is ${fmt(D.store.minOrder)}. Add ${fmt(D.store.minOrder-total())} more.</p>`:'';
function rdr(){
  const it=items();
  $('#db').innerHTML=it.length?it.map(i=>`<div class="li"><span>${i.name}<br><span class="mut">${i.n} &times; ${fmt(i.price)}</span></span><b>${fmt(i.n*i.price)}</b></div>`).join(''):'<p class="empty">Your cart is empty.</p>';
  $('#df').innerHTML=it.length?`<div class="tot"><span>Total</span><span>${fmt(total())}</span></div>${min()}<a class="btn p" href="#/cart" onclick="dr(0)">See detailed summary</a><button class="btn" onclick="pdf()">Download PDF</button>`:'';
}
function dr(o){document.body.style.overflow=o?'hidden':'';$('#dr').classList.toggle('open',!!o);$('#ov').classList.toggle('open',!!o)}
function pdf(){
  const it=items(); if(!it.length)return;
  const {jsPDF}=window.jspdf, d=new jsPDF(), rs=n=>'Rs. '+n.toLocaleString('en-IN');
  d.setFontSize(18).text(D.store.name+' - Order Sheet',14,16);
  d.setFontSize(10).text('Date: '+new Date().toLocaleString('en-IN'),14,23);
  d.text('Customer: '+(cust.name||'-')+'   Phone: '+(cust.phone||'-'),14,29);
  d.autoTable({startY:34,head:[['Packed','Product','Category','Qty','Rate','Amount']],
    body:it.map(i=>['[    ]',i.name,i.cat,i.n,rs(i.price),rs(i.n*i.price)]),
    foot:[['','','','Total items: '+count(),'',rs(total())]],
    headStyles:{fillColor:[28,20,38]},footStyles:{fillColor:[245,166,35],textColor:20},
    columnStyles:{3:{halign:'center',fontStyle:'bold'},4:{halign:'right'},5:{halign:'right'}}});
  d.save('order-'+Date.now()+'.pdf');
}
function wa(){
  const t=`*New order - ${D.store.name}*\n${cust.name||''} ${cust.phone||''}\n\n`+items().map(i=>`${i.n} x ${i.name} = ${fmt(i.n*i.price)}`).join('\n')+`\n\n*Total: ${fmt(total())}*`;
  open('https://wa.me/'+D.store.whatsapp+'?text='+encodeURIComponent(t),'_blank');
}
$('#q').addEventListener('input',e=>{q=e.target.value;if(location.hash=='#/cart')location.hash='';else if(D)route()});
addEventListener('hashchange',()=>{if(D)route();scrollTo(0,0)});