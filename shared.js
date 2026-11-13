(()=>{'use strict';const v=new URLSearchParams(location.search).get('design'),n=/^[1-5]$/.test(v)?+v:1;
 document.querySelectorAll('a[href]').forEach(a=>{const u=new URL(a.href);if(u.origin!==location.origin)return;if(a.hasAttribute('data-home')||u.pathname.endsWith('/home.html')){a.href='../c'+n+'/index.html';return}if(u.pathname.includes('/content/')&&u.pathname.endsWith('.html')){u.searchParams.set('design',n);a.href=u.href}});
 document.title=document.title.replace('후보 1','상세 정보');
 const note=document.createElement('div');note.setAttribute('role','note');note.style.cssText='padding:10px 24px;background:#f1f3f5;font:12px/1.5 Pretendard,sans-serif;color:#425063;display:flex;justify-content:center;gap:18px;flex-wrap:wrap';
 const text=document.createElement('span');text.textContent='공통 상세 정보 · 기존 자료를 그대로 확인할 수 있습니다.';const back=document.createElement('a');back.href='../c'+n+'/index.html';back.textContent='후보 '+n+' 메인으로 ←';back.style.textDecoration='underline';note.append(text,back);document.querySelector('main').prepend(note);
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;const u=new URL(a.href);if(u.origin===location.origin&&u.pathname.includes('/content/')&&u.pathname.endsWith('.html')){u.searchParams.set('design',n);a.href=u.href}},true);
 if(parent!==window)parent.postMessage({type:'revision:location',design:n,page:document.body.dataset.page,search:location.search,hash:location.hash},location.origin);
})();
