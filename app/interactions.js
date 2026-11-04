/* Touch gestures and short, action-driven feedback. No idle animation loop. */
(() => {
  'use strict';
  const motion=()=>document.documentElement.dataset.motion!=='reduced'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active=null,blockedClick=null;
  const pointers=new Set();
  document.addEventListener('pointerdown',e=>{blockedClick=null;if(e.pointerType==='touch'){pointers.add(e.pointerId);if(pointers.size>1)active?.cancel()}},true);
  for(const type of ['pointerup','pointercancel'])document.addEventListener(type,e=>pointers.delete(e.pointerId),true);
  document.addEventListener('click',e=>{if(!blockedClick||e.detail===0||performance.now()>blockedClick.until)return;if(Math.hypot(e.clientX-blockedClick.x,e.clientY-blockedClick.y)<100){e.preventDefault();e.stopImmediatePropagation()}},true);
  window.addEventListener('blur',()=>{active?.cancel();pointers.clear()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){active?.cancel();pointers.clear()}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')active?.cancel()});
  function swipe(node,{left=null,right=null}={}){
    const host=document.createElement('div');host.className='mg-swipe';
    const back=document.createElement('div');back.className='mg-swipe-back';back.setAttribute('aria-hidden','true');
    for(const [side,action]of [['right',right],['left',left]])if(action){const label=document.createElement('span');label.className='mg-swipe-label '+side;label.textContent=action.label;back.append(label)}
    host.append(back,node);node.classList.add('mg-swipe-surface');let start=null,settle=null;
    function reset(){if(!start)return;const id=start.id;start=null;host.classList.remove('is-dragging','is-ready','to-left','to-right');node.style.removeProperty('transform');node.style.removeProperty('will-change');if(node.hasPointerCapture?.(id))node.releasePointerCapture(id);if(active?.node===node)active=null}
    node.addEventListener('pointerdown',e=>{
      if(!['touch','pen'].includes(e.pointerType)||!e.isPrimary||pointers.size>1||e.clientX<24||e.clientX>innerWidth-24||document.querySelector('dialog[open]')||node.querySelector('details[open]'))return;
      const control=e.target.closest('button,input,select,textarea,summary,a,[contenteditable=true]');if(control&&control!==node&&!control.matches('.ma-task-name,.ma-featured-title'))return;
      settle?.cancel();active?.cancel();start={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,locked:false,threshold:Math.min(84,Math.max(64,node.getBoundingClientRect().width*.22))};active={node,cancel:reset};
    });
    node.addEventListener('pointermove',e=>{
      if(!start||e.pointerId!==start.id)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;
      if(!start.locked){if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)*1.1){reset();return}if(Math.abs(dx)<12||Math.abs(dx)<Math.abs(dy)*1.4)return;start.locked=true;host.classList.add('is-dragging');node.style.willChange='transform';node.setPointerCapture(e.pointerId)}
      e.preventDefault();start.dx=dx;const action=dx>0?right:left,travel=action?Math.min(108,Math.abs(dx)):Math.min(22,Math.abs(dx)*.12);node.style.transform='translateX('+(dx>0?travel:-travel)+'px)';host.classList.toggle('to-right',dx>0);host.classList.toggle('to-left',dx<0);host.classList.toggle('is-ready',!!action&&Math.abs(dx)>=start.threshold);
    },{passive:false});
    node.addEventListener('pointerup',e=>{
      if(!start||e.pointerId!==start.id)return;const gesture=start,action=gesture.dx>0?right:left,commit=gesture.locked&&Math.abs(gesture.dx)>=gesture.threshold&&action;
      const position=node.style.transform;if(gesture.locked)blockedClick={x:e.clientX,y:e.clientY,until:performance.now()+420};reset();if(commit){action.run();if(action.undo)showUndo()}else if(gesture.locked&&position)settle=animate(node,[{transform:position},{transform:'translateX(0)'}],{duration:170});
    });
    node.addEventListener('pointercancel',reset);node.addEventListener('lostpointercapture',e=>{if(e.target===node)reset()});return host;
  }
  function animate(element,frames,options){if(!element||!motion())return null;return element.animate(frames,{duration:420,easing:'cubic-bezier(.2,.7,.3,1)',...options})}
  function showUndo(){const notice=document.querySelector('.ma-home .ma-undo');if(!notice)return;document.querySelector('.mg-global-undo')?.remove();notice.classList.add('mg-global-undo');document.body.append(notice);animate(notice,[{opacity:0,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:180})}
  function ringPercent(root){return parseFloat(root?.querySelector('.mx-donut-center strong')?.textContent)||0}
  function fillRing(root,from){if(!root||!motion())return;const to=ringPercent(root),length=2*Math.PI*120,gap=from>0&&from<100?3:0,main=root.querySelector('[data-segment="0"]'),rest=root.querySelector('[data-segment="1"]');
    if(main)animate(main,[{strokeDasharray:Math.max(.2,length*from/100-gap)+' '+length},{strokeDasharray:main.getAttribute('stroke-dasharray')}],{duration:520});
    if(rest)animate(rest,[{strokeDasharray:Math.max(.2,length*(100-from)/100-gap)+' '+length,strokeDashoffset:-length*from/100},{strokeDasharray:rest.getAttribute('stroke-dasharray'),strokeDashoffset:rest.getAttribute('stroke-dashoffset')}],{duration:520});
    animate(root,[{scale:'.97'},{scale:'1.035',offset:.45},{scale:'1'}],{duration:480});
  }
  function taskSnapshot(){return{daily:ringPercent(document.querySelector('.mx-pulse-card .mx-mini-ring')),hero:parseFloat(document.querySelector('.ma-progress-ring')?.style.getPropertyValue('--progress'))||0}}
  function taskCompleted(before){if(!motion())return;requestAnimationFrame(()=>{fillRing(document.querySelector('.mx-pulse-card .mx-mini-ring'),before.daily);const hero=document.querySelector('.ma-progress-ring');if(!hero)return;const to=parseFloat(hero.style.getPropertyValue('--progress'))||0,start=performance.now();function frame(now){if(!hero.isConnected)return;const p=Math.min(1,(now-start)/460);hero.style.setProperty('--progress',(!motion()?to:before.hero+(to-before.hero)*(1-(1-p)**3))+'%');if(p<1&&motion())requestAnimationFrame(frame)}requestAnimationFrame(frame)});}
  function chartChange(render){
    if(!motion()){render();return}
    const old=Array.from(document.querySelectorAll('.mi-finance-grid .mi-plot-svg')).map(svg=>({clone:svg.cloneNode(true),paths:Array.from(svg.querySelectorAll('.mi-line,.mi-area')).map(p=>p.getAttribute('d'))}));render();
    document.querySelectorAll('.mi-finance-grid .mi-plot-svg').forEach((svg,index)=>{
      const snapshot=old[index],card=svg.closest('.mi-chart-card');card?.classList.add('mg-chart-changing');
      if(snapshot){const overlay=snapshot.clone;overlay.classList.add('mg-old-chart');overlay.setAttribute('aria-hidden','true');overlay.removeAttribute('role');overlay.removeAttribute('tabindex');overlay.querySelectorAll('[tabindex]').forEach(n=>n.removeAttribute('tabindex'));overlay.querySelectorAll('*').forEach(n=>n.style.animation='none');svg.parentElement.append(overlay);const fade=animate(overlay,[{opacity:.55},{opacity:0}],{duration:180});fade?.finished.then(()=>overlay.remove()).catch(()=>overlay.remove());if(!fade)overlay.remove();
        svg.querySelectorAll('.mi-line,.mi-area').forEach((path,i)=>{const from=snapshot.paths[i],to=path.getAttribute('d'),shape=d=>d?.replace(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi,'#');if(from&&shape(from)===shape(to)&&CSS.supports('d','path("'+to+'")'))animate(path,[{d:'path("'+from+'")'},{d:'path("'+to+'")'}],{duration:420})});
      }
      animate(svg,[{opacity:.3},{opacity:1}],{duration:280});
    });
    document.querySelectorAll('.mi-finance-grid .mx-donut').forEach(ring=>{ring.closest('.mi-chart-card')?.classList.add('mg-chart-changing');animate(ring,[{opacity:.5,scale:'.975'},{opacity:1,scale:'1'}],{duration:360})});
  }
  function savingsChanged(id,before,text){if(!motion())return;requestAnimationFrame(()=>{const card=Array.from(document.querySelectorAll('[data-savings-id]')).find(n=>n.dataset.savingsId===String(id));if(!card)return;fillRing(card.querySelector('.mx-saving-ring'),before);const button=card.querySelector('.mi-row-actions button'),rect=button?.getBoundingClientRect();if(!rect||rect.bottom<0||rect.top>innerHeight)return;const bubble=document.createElement('span');bubble.className='mg-saving-feedback';bubble.setAttribute('role','status');bubble.textContent=text;bubble.style.left=Math.max(12,Math.min(innerWidth-180,rect.left))+'px';bubble.style.top=Math.max(12,rect.top-18)+'px';document.body.append(bubble);const effect=animate(bubble,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(-8px)',offset:.25},{opacity:0,transform:'translateY(-32px)'}],{duration:850});effect?.finished.then(()=>bubble.remove()).catch(()=>bubble.remove());if(!effect)bubble.remove()});}
  window.MyDayInteractions={ready:true,swipe,showUndo,taskSnapshot,taskCompleted,chartChange,savingsChanged};
})();
