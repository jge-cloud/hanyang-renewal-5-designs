(()=>{'use strict';
 const n=/^[1-5]$/.test(document.body.dataset.design)?+document.body.dataset.design:1,reduce=matchMedia('(prefers-reduced-motion: reduce)'),animations=new Set();let observer;
 function animate(el,frames,options={}){if(!el||reduce.matches||!el.animate)return;const a=el.animate(frames,{duration:600,easing:'cubic-bezier(.22,1,.36,1)',...options});animations.add(a);a.finished.then(()=>animations.delete(a)).catch(()=>{});}
 // The five effects are installed only after the static page is visible.
 const menu=document.querySelector('#mobile-menu'),toggle=document.querySelector('.menu-toggle'),groups=[...document.querySelectorAll('.nav-group')];
 toggle?.addEventListener('click',()=>{menu.showModal();toggle.setAttribute('aria-expanded','true')});
 menu?.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');toggle.focus()});
 document.querySelector('[data-close]')?.addEventListener('click',()=>menu.close());
 groups.forEach(g=>g.addEventListener('toggle',()=>{if(g.open)groups.forEach(o=>{if(o!==g)o.open=false})}));
 document.addEventListener('click',e=>{if(!e.target.closest('.nav-group'))groups.forEach(g=>g.open=false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')groups.forEach(g=>{if(g.open&&g.contains(document.activeElement))g.querySelector('summary').focus();g.open=false})});
 document.querySelectorAll('a[href]').forEach(a=>{const u=new URL(a.href);if(u.origin===location.origin&&u.pathname.includes('/content/')){u.searchParams.set('design',n);a.href=u.href}});
 function send(){if(parent!==window)parent.postMessage({type:'revision:location',design:n,page:'home'},location.origin)}send();
 const parts=[{name:'DOOR PANEL',description:'도어에 적용되는 부품.',src:'../assets/figma/3c53f25d-8b22-4326-b578-1bac935380bf.png'},{name:'COVER’G SHELF',description:'선반 부위에 적용되는 부품.',src:'../assets/figma/970be468-4a6b-47dc-be0f-ac56339d45f1.png'},{name:'PACKAGE TRAY',description:'패키지 트레이에 적용되는 부품.',src:'../assets/figma/25afd36d-9d1b-433d-8698-11db0561b1ad.png'}];
 document.querySelectorAll('[data-part]').forEach(b=>b.addEventListener('click',()=>{
  const part=parts[+b.dataset.part],section=b.closest('section'),image=section.querySelector('.explorer-image');
  image.src=part.src;image.alt=part.name+' 실제 부품';section.querySelector('.part-name').textContent=part.name;section.querySelector('.lead').textContent=part.description;section.querySelector('.part-status').textContent='선택한 부품: '+part.name;
  section.querySelectorAll('[data-part]').forEach(o=>o.setAttribute('aria-pressed',String(o===b)));
  animate(image,[{transform:'translateY(9px) scale(.97)'},{transform:'translateY(0) scale(1)'}],{duration:300});
 }));
 document.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>{const panel=b.closest('.layer-panel');panel.dataset.active=b.dataset.layer;panel.querySelectorAll('button').forEach(o=>o.setAttribute('aria-pressed',String(o===b)));panel.querySelector('.layer-status').textContent=b.dataset.layer==='film'?'접착 FILM — 도해 상부 표기':'PP+목분 — 도해 하부 표기';animate(panel.querySelector('.diagram'),[{transform:'translateY(3px)'},{transform:'translateY(0)'}],{duration:250})}));
 if(!reduce.matches){
  if(n===1){animate(document.querySelector('.blue-stage'),[{clipPath:'inset(0 0 0 8%)'},{clipPath:'inset(0)'}],{duration:550});}
  if(n===2){animate(document.querySelector('.road-media'),[{transform:'scale(1.045)'},{transform:'scale(1)'}],{duration:1000});animate(document.querySelector('.road-copy h1'),[{transform:'translateY(14px)',clipPath:'inset(0 0 8% 0)'},{transform:'translateY(0)',clipPath:'inset(0)'}],{duration:650});}
  if(n===3){document.querySelectorAll('.hero-part').forEach((el,i)=>animate(el,[{transform:`translateY(${i%2?10:-10}px)`},{transform:'translateY(0)'}],{duration:500,delay:i*70}));}
  if(n===4){animate(document.querySelector('.story-hero figure img'),[{clipPath:'inset(0 7% 0 0)'},{clipPath:'inset(0)'}],{duration:700});}
  const selectors={1:'.blue-trust',2:'.cinema-row figure img',3:'.studio-material .diagram',4:'.story-row figure img,.story-combine .diagram',5:'.dossier-row,.technical-grid>div'};
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target;
   if(n===1)animate(el,[{backgroundColor:'#174ce5'},{backgroundColor:'#0b2444'}],{duration:700});
   if(n===2)animate(el,[{transform:'scale(1.025)'},{transform:'scale(1)'}],{duration:800});
   if(n===3)animate(el,[{transform:'translateY(7px)'},{transform:'translateY(0)'}],{duration:450});
   if(n===4)animate(el,[{clipPath:'inset(0 4% 0 0)'},{clipPath:'inset(0)'}],{duration:650});
   if(n===5)animate(el,[{borderTopColor:'#bb4f2a'},{borderTopColor:el.matches('.dossier-row')?'#ffffff44':'#afaea7'}],{duration:850});
   observer.unobserve(el);
  }),{threshold:.08});document.querySelectorAll(selectors[n]).forEach(el=>observer.observe(el));
 }
 reduce.addEventListener('change',()=>{if(reduce.matches){animations.forEach(a=>a.cancel());observer?.disconnect()}});
 window.addEventListener('pagehide',()=>{animations.forEach(a=>a.cancel());observer?.disconnect()});
})();
