/* DBOT Realty — mid-fidelity prototype interactions (no data is sent anywhere) */
(function(){
  var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

  /* header: solid on scroll (home), mobile menu, dropdowns */
  var header=$('header');
  function onScroll(){ if(header) header.classList.toggle('solid', window.scrollY>40); }
  window.addEventListener('scroll',onScroll); onScroll();
  var mb=$('.menu-btn');
  if(mb) mb.addEventListener('click',function(){var o=header.classList.toggle('open'); mb.setAttribute('aria-expanded',o); mb.textContent=o?'Close ✕':'Menu ☰';});
  $$('.dd-t').forEach(function(b){
    b.addEventListener('click',function(e){
      var dd=b.parentNode, was=dd.classList.contains('open');
      $$('.dd.open').forEach(function(d){d.classList.remove('open')});
      if(!was) dd.classList.add('open');
      b.setAttribute('aria-expanded',!was);
      e.stopPropagation();
    });
  });
  document.addEventListener('click',function(e){ if(!e.target.closest('.dd')) $$('.dd.open').forEach(function(d){d.classList.remove('open')}); if(!e.target.closest('.tools')) $$('.share-menu.open').forEach(function(m){m.classList.remove('open')}); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ $$('.dd.open').forEach(function(d){d.classList.remove('open')}); } });

  /* animated counters */
  var counters=$$('[data-count]');
  if(counters.length && 'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){
      if(!en.isIntersecting) return; io.unobserve(en.target);
      var el=en.target, end=parseFloat(el.dataset.count), pre=el.dataset.pre||'', suf=el.dataset.suf||'', t0=null;
      function step(t){ if(!t0)t0=t; var p=Math.min((t-t0)/1200,1); var v=Math.round(end*(1-Math.pow(1-p,3))); el.textContent=pre+v.toLocaleString('en-IN')+suf; if(p<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    })},{threshold:.4});
    counters.forEach(function(c){io.observe(c)});
  }

  /* cookie consent */
  var ck=$('.cookie');
  if(ck && !store.get('dbot-cookie')){ ck.classList.add('show'); document.body.classList.add('has-cookie'); }
  $$('[data-cookie]').forEach(function(b){ b.addEventListener('click',function(){ store.set('dbot-cookie',b.dataset.cookie); ck.classList.remove('show'); document.body.classList.remove('has-cookie'); }); });

  /* share */
  $$('[data-share]').forEach(function(btn){
    var menu=btn.parentNode.querySelector('.share-menu');
    btn.addEventListener('click',function(e){ e.stopPropagation(); menu.classList.toggle('open'); });
  });
  function pageUrl(){ return location.href.split('#')[0]; }
  $$('.share-menu').forEach(function(m){
    var title=document.title, text=m.dataset.text||title;
    var wa=$('[data-wa]',m), em=$('[data-mail]',m), li=$('[data-li]',m), cp=$('[data-copy]',m), ct=$('[data-copytext]',m);
    if(wa) wa.href='https://wa.me/?text='+encodeURIComponent(text.replace('[link]',pageUrl())+(text.indexOf('[link]')<0?' '+pageUrl():''));
    if(em) em.href='mailto:?subject='+encodeURIComponent(title)+'&body='+encodeURIComponent((m.dataset.text?text.replace('[link]',pageUrl()):title+'\n\n'+pageUrl()));
    if(li) li.href='https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(pageUrl());
    if(li && m.dataset.text) li.addEventListener('click',function(){ copy(text.replace('[link]',pageUrl()),null); toast('Post text copied — paste it into LinkedIn'); });
    if(cp) cp.addEventListener('click',function(){ copy(pageUrl(),cp); });
    if(ct) ct.addEventListener('click',function(){ copy(text.replace('[link]',pageUrl()),ct); });
  });
  function copy(s,el){
    var done=function(){ if(el){ var o=el.textContent; el.textContent='Copied ✓'; setTimeout(function(){el.textContent=o},1500);} };
    if(navigator.clipboard) navigator.clipboard.writeText(s).then(done,function(){fallback(s);done()}); else {fallback(s);done();}
  }
  function fallback(s){ var t=document.createElement('textarea'); t.value=s; document.body.appendChild(t); t.select(); try{document.execCommand('copy')}catch(e){} t.remove(); }
  function toast(msg){ var t=document.createElement('div'); t.className='cookie show'; t.style.justifyContent='center'; t.innerHTML='<p>'+msg+'</p>'; document.body.appendChild(t); setTimeout(function(){t.remove()},2600); }

  /* forms: show confirmation instead of sending (prototype) */
  $$('form[data-demo]').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=$('.ok',f); if(ok){ ok.classList.add('show'); }
      if(f.dataset.demo==='gate'){ $$('.gate .locked').forEach(function(l){l.classList.remove('locked')}); var dl=$('#download'); if(dl) dl.style.display='inline-block'; }
      $$('input:not([type=checkbox]):not([type=radio]):not([type=hidden]),textarea',f).forEach(function(i){ if(i.type!=='file') i.value=''; });
    });
  });
  /* contact: "I am a" job seeker hint + prefill service from ?service= */
  var iam=$('#iam'); if(iam){ iam.addEventListener('change',function(){ $('#jobhint').style.display = iam.value==='Job seeker'?'block':'none'; }); }
  var q=new URLSearchParams(location.search);
  var svc=$('#service'); if(svc && q.get('service')){ $$('option',svc).forEach(function(o){ if(o.value===q.get('service')) svc.value=o.value; }); }
  if(iam && q.get('iam')){ iam.value=q.get('iam'); }

  /* listing filters: selects (projects/roles) */
  $$('[data-filter-group]').forEach(function(g){
    var target=$(g.dataset.filterGroup), sels=$$('select',g), items=$$('[data-tags]',target), empty=$('.empty',target.parentNode);
    function apply(){
      var n=0;
      items.forEach(function(it){
        var ok=sels.every(function(s){ return !s.value || (it.dataset[s.name]||'').split('|').indexOf(s.value)>-1; });
        it.style.display=ok?'':'none'; if(ok) n++;
      });
      if(empty) empty.style.display=n?'none':'block';
      var c=$('[data-count-out]',g); if(c) c.textContent=n+' shown';
    }
    sels.forEach(function(s){ s.addEventListener('change',apply); if(q.get(s.name)){ s.value=q.get(s.name); } });
    var r=$('[data-reset]',g); if(r) r.addEventListener('click',function(){ sels.forEach(function(s){s.value=''}); apply(); });
    apply();
  });
  /* chip filters (blog categories) */
  $$('[data-chips]').forEach(function(g){
    var target=$(g.dataset.chips), chips=$$('.chip',g), items=$$('[data-cat]',target);
    chips.forEach(function(c){ c.addEventListener('click',function(){
      chips.forEach(function(x){x.classList.remove('on')}); c.classList.add('on');
      items.forEach(function(it){ it.style.display=(!c.dataset.val||it.dataset.cat===c.dataset.val)?'':'none'; });
    }); });
  });
  /* external technologies link + year */
  $$('.year').forEach(function(y){ y.textContent=new Date().getFullYear(); });
})();
