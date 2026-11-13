(() => {
  'use strict';
  const body = document.body, variant = +body.dataset.candidate;
  const abort = new AbortController(), signal = abort.signal;
  const animations = new Set();
  let observer, popupController;
  const listen = (el,type,fn) => el?.addEventListener(type,fn,{signal});
  const menus = [...document.querySelectorAll('.nav-group')];
  menus.forEach(menu => listen(menu,'toggle',() => {if(menu.open) menus.forEach(other=>{if(other!==menu)other.open=false})}));
  listen(document,'click',e=> {if(!e.target.closest('.nav-group'))menus.forEach(m=>m.open=false)});
  listen(document,'keydown',e=> {if(e.key==='Escape'){menus.forEach(m=>{if(m.open&&m.contains(document.activeElement))m.querySelector('summary').focus();m.open=false});document.querySelectorAll('dialog[open]').forEach(d=>d.close())}});
  const mobile = document.querySelector('#mobile-menu');
  const menuButton = document.querySelector('.menu-toggle');
  listen(menuButton,'click',()=>{mobile.showModal();menuButton.setAttribute('aria-expanded','true')});
  listen(mobile,'close',()=>{menuButton.setAttribute('aria-expanded','false');menuButton.focus()});
  document.querySelectorAll('dialog').forEach(d=> {
    listen(d,'click',e=> {if(e.target.closest('[data-close]') || (e.target===d && (e.clientX<d.getBoundingClientRect().left || e.clientX>d.getBoundingClientRect().right || e.clientY<d.getBoundingClientRect().top || e.clientY>d.getBoundingClientRect().bottom)))d.close()});
  });
  const dialog=document.querySelector('#product-dialog');
  let opener;
  listen(dialog,'close',()=>{popupController?.abort();opener?.focus()});
  listen(document,'click',async e=> {
    const link=e.target.closest('a[data-product-dialog]');
    if(!link || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)return;
    const target=new URL(link.href);if(target.origin!==location.origin)return;
    e.preventDefault();if(!dialog.contains(link))opener=link;
    popupController?.abort();popupController=new AbortController();const request=popupController;
    dialog.querySelector('h2').textContent='NPS 제품 상세';
    dialog.querySelector('.dialog-content').setAttribute('aria-busy','true');
    dialog.querySelector('.dialog-content').textContent='자료를 불러오고 있습니다.';
    dialog.querySelector('.dialog-permalink').href=target.href;
    if(!dialog.open)dialog.showModal();
    try {
      const res=await fetch(target,{signal:popupController.signal});if(!res.ok)throw Error('HTTP '+res.status);
      const doc=new DOMParser().parseFromString(await res.text(),'text/html');
      const article=doc.querySelector('[data-content-key]');
      if(!article)throw Error('Content missing');
      if(request.signal.aborted||request!==popupController||!dialog.open)return;
      article.querySelectorAll('script,iframe,object,embed').forEach(n=>n.remove());
      article.querySelectorAll('*').forEach(el=>[...el.attributes].forEach(a=>{if(/^on/i.test(a.name)||/^\s*javascript:/i.test(a.value))el.removeAttribute(a.name)}));
      dialog.querySelector('.dialog-content').replaceChildren(...[...article.childNodes].map(n=>document.importNode(n,true)));
      dialog.querySelector('h2').textContent=doc.querySelector('main h1')?.textContent||'NPS 제품 상세';
      history.replaceState(null,'','#product='+encodeURIComponent(target.pathname.split('/').pop().replace('.html','')));
      sendLocation();
    } catch(err){if(err.name!=='AbortError'&&request===popupController)dialog.querySelector('.dialog-content').textContent='자료를 불러오지 못했습니다. 아래 단독 페이지에서 확인해 주세요.'}finally{if(request===popupController)dialog.querySelector('.dialog-content').removeAttribute('aria-busy')}
  });
  listen(dialog,'close',()=>{history.replaceState(null,'',location.pathname+location.search);sendLocation()});
  // Local-only search over verified post titles and bodies; no storage or submission.
  const search=document.querySelector('.board-search');
  function filterPosts(value){
    const q=value.trim().toLocaleLowerCase('ko');let n=0;
    document.querySelectorAll('[data-search]').forEach(row=>{row.hidden=!row.dataset.search.toLocaleLowerCase('ko').includes(q);if(!row.hidden)n++});
    document.querySelector('.search-status').textContent=q ? `“${value.trim()}” 검색 결과 ${n}건` : '';
    document.querySelector('.no-results').hidden=!(q && n===0);
  }
  if(search){
    const input=search.querySelector('input');input.value=new URLSearchParams(location.search).get('q')||'';filterPosts(input.value);
    listen(search,'submit',e=>{e.preventDefault();const u=new URL(location.href);if(input.value.trim())u.searchParams.set('q',input.value.trim());else u.searchParams.delete('q');history.replaceState(null,'',u);filterPosts(input.value);sendLocation()});
    listen(input,'input',()=>filterPosts(input.value));
  }
  document.querySelectorAll('[data-layer]').forEach(button=>listen(button,'click',()=>{
    button.closest('.diagram-panel').querySelectorAll('[data-layer]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    const panel=button.closest('.diagram-panel');panel.dataset.activeLayer=button.dataset.layer;
    panel.querySelector('.diagram-status').textContent=button.dataset.layer==='film'?'접착 FILM — 도해의 상부 표기':'PP+목분 — 도해의 하부 표기';
    const diagram=panel.querySelector('img');animate(diagram,[{opacity:.65},{opacity:1}],{duration:250});
  }));
  // Motion starts only through JS; HTML and CSS leave all information visible on failure.
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  function animate(el,frames,options){if(reduce.matches || !el?.animate)return;const a=el.animate(frames,{fill:'backwards',...options});animations.add(a);a.finished.then(()=>animations.delete(a)).catch(()=>{});}
  function reveal(el,i=0){
    if(variant===1){animate(el,[{opacity:.1,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:i*90,easing:'cubic-bezier(.2,.7,.3,1)'});}
    if(variant===2){animate(el,[{opacity:.1,transform:'translateY(18px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:520,delay:i*85,easing:'cubic-bezier(.2,.7,.3,1)'});}
    if(variant===3){animate(el,[{transform:'translateX(-22px)'},{transform:'translateX(0)'}],{duration:500,delay:i*65,easing:'cubic-bezier(.22,1,.36,1)'});}
  }
  if(!reduce.matches && body.classList.contains('is-home')){
    if(variant===1)document.querySelectorAll('.hero h1 span').forEach((el,i)=>reveal(el,i));
    if(variant===2)document.querySelectorAll('.part').forEach((el,i)=>reveal(el,i));
    if(variant===3)reveal(document.querySelector('.hero-copy'));
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const el=entry.target;if(variant===2 && el.matches('.product-grid'))[...el.children].forEach((item,i)=>reveal(item,i));else reveal(el);observer.unobserve(el)}}),{threshold:.12});
    const selector=variant===1?'.home-products .product-top,.home-company .company-statement,.home-brochure>div':variant===2?'.product-grid,.company-statement,.home-brochure>div,.home-recruit>div':'.home-investment nav,.home-company .company-statement,.home-notice a,.home-brochure>div,.home-recruit>div';
    document.querySelectorAll(selector).forEach(el=>observer.observe(el));
  }
  function sendLocation(){if(parent!==window)parent.postMessage({type:'hanyang:location',candidate:variant,page:body.dataset.page,search:location.search,hash:location.hash},location.origin)}
  sendLocation();
  const initialProduct=new URLSearchParams(location.hash.slice(1)).get('product');
  if(initialProduct){const l=document.querySelector(`a[data-product-dialog][href="${CSS.escape(initialProduct)}.html"]`);if(l)l.click()}
  listen(reduce,'change',()=>{if(reduce.matches){animations.forEach(a=>a.cancel());document.getAnimations().forEach(a=>a.cancel());observer?.disconnect()}});
  listen(window,'pagehide',e=>{popupController?.abort();animations.forEach(a=>a.cancel());if(!e.persisted){abort.abort();observer?.disconnect()}});
  listen(window,'pageshow',e=>{if(e.persisted){if(dialog.open)dialog.close();sendLocation()}});
})();
