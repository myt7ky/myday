/* Reveal charts once, add a quiet pointer light; no continuous animation loop. */
(() => {
  'use strict';
  const motion=()=>document.documentElement.dataset.motion!=='reduced'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const home=document.getElementById('ma-home');if(!home)return;
  let frame=0;const bound=new WeakSet(),observed=new Set();
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('mx-revealed');observer.unobserve(entry.target);observed.delete(entry.target)}}),{threshold:.08,rootMargin:'0px 0px 28px 0px'});
  function sync(){
    observed.forEach(card=>{if(!card.isConnected){observer.unobserve(card);observed.delete(card)}});
    home.querySelectorAll('.mi-chart-card,.ma-panel,.mx-pulse-card,.mi-metric').forEach(card=>{if(bound.has(card))return;bound.add(card);card.classList.add('mx-reveal');observed.add(card);observer.observe(card)});
  }
  new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;sync()})}).observe(home,{childList:true,subtree:true});
  sync();window.MyDayLuxe={ready:true};
})();
