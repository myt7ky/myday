/* MyDay daily workspace. Keeps spend-v1 and the existing tracker APIs. */
(() => {
  'use strict';
  const stylesheet = el('link');
  stylesheet.rel = 'stylesheet'; stylesheet.href = './app/redesign.css'; document.head.append(stylesheet);
  const chromeStyles=el('link');chromeStyles.rel='stylesheet';chromeStyles.href='./app/chrome.css';document.head.append(chromeStyles);
  const insightStyles=el('link');insightStyles.rel='stylesheet';insightStyles.href='./app/insights.css';document.head.append(insightStyles);const luxeStyles=el('link');luxeStyles.rel='stylesheet';luxeStyles.href='./app/luxe.css';document.head.append(luxeStyles);const clarityStyles=el('link');clarityStyles.rel='stylesheet';clarityStyles.href='./app/clarity.css';document.head.append(clarityStyles);const interactionStyles=el('link');interactionStyles.rel='stylesheet';interactionStyles.href='./app/interactions.css';document.head.append(interactionStyles);const workspaceStyles=el('link');workspaceStyles.rel='stylesheet';workspaceStyles.href='./app/workspace.css';document.head.append(workspaceStyles);const personalStyles=el('link');personalStyles.rel='stylesheet';personalStyles.href='./app/personalize.css';document.head.append(personalStyles);
  document.documentElement.dataset.visual='chrome';
  if(localStorage.getItem('myday-visual-version')!=='chrome-1'){document.documentElement.dataset.theme='dark';localStorage.setItem('myday-theme','dark');localStorage.setItem('myday-visual-version','chrome-1');const theme=document.getElementById('themeSelect');if(theme)theme.value='dark'}
  document.title = 'MyDay — твой день'; document.querySelector('.brand h1').textContent = 'MyDay';
  const paths = {
    home: 'M4 4h6v6H4ZM14 4h6v6h-6ZM4 14h6v6H4ZM14 14h6v6h-6Z',
    tasks: 'M8 6h12M8 12h12M8 18h12M3 6h.01M3 12h.01M3 18h.01',
    buys: 'M3 6h18v14H3ZM3 10h18M15 15h3M6 6V3h12v3',
    health: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    more: 'M5 6h14M5 12h14M5 18h14', arrow: 'M5 12h14m-5-5 5 5-5 5', play: 'm9 5 10 7-10 7Z',
    moon: 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z',
    sun: 'M12 3V1M12 23v-2M3 12H1M23 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    plus: 'M12 5v14M5 12h14', check: 'm5 12 4 4L19 6', reset: 'M3 11a9 9 0 1 1 2 7M3 4v7h7',
    star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',
    tomorrow:'M5 4h14v16H5ZM8 2v4M16 2v4M5 9h14m-9 5 2 2 3-3',
    edit:'m15 5 4 4M4 20l4-1 12-12a2.8 2.8 0 0 0-4-4L4 15Z',close:'m6 6 12 12M6 18 18 6',
    gym: 'M6 4v16M3 8v8M6 12h12M18 4v16M21 8v8',
    food: 'M4 3v6a3 3 0 0 0 6 0V3M7 3v18M20 21V3c-4 0-5 7-5 10h5',
    body: 'M12 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM5 10h14M12 7v7m-4 7 4-7 4 7',
    clock: 'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
    search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0'
  };
  function icon(id) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.entries({viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'1.7','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'}).forEach(([k,v])=>svg.setAttribute(k,v));
    const path = document.createElementNS(svg.namespaceURI, 'path'); path.setAttribute('d', paths[id] || paths.arrow); svg.append(path); return svg;
  }
  function button(label, fn, cls = 'ma-button') { const b = el('button', cls, label); b.type = 'button'; b.onclick = fn; return b; }
  function iconButton(id, label, fn, cls = 'ma-icon-button') { const b = button('', fn, cls); b.append(icon(id)); b.setAttribute('aria-label', label); b.title = label; return b; }
  function panel(title, action, cls = '') { const p = el('div', 'ma-panel ' + cls), h = el('div', 'ma-panel-head'); h.append(el('h2', null, title)); if (action) h.append(action); p.append(h); return p; }
  const home = el('div', 'ma-home'); home.id = 'ma-home'; document.body.append(home);
  const chromeStage=createChromeStage();
  const nav = el('nav', 'ma-nav'); nav.setAttribute('aria-label', 'Основная навигация'); document.body.append(nav);
  const brand = button('', () => go('home'), 'ma-nav-brand'); brand.append(el('span', 'ma-mark'), el('b', null, window.MYDAY_DEMO?'myday / demo':'myday')); brand.setAttribute('aria-label', 'MyDay — сегодня'); nav.append(brand);
  [['home', 'Сегодня'], ['tasks', 'Дела'], ['buys', 'Деньги'], ['health', 'Здоровье'], ['more', 'Ещё']].forEach(([id, label]) => { const b = button('', () => go(id), 'ma-nav-item'); b.dataset.page = id; b.append(icon(id), el('span', null, label)); nav.append(b); });
  const localNote = el('div', 'ma-local-note'); localNote.append(el('i'), el('span', null, 'Твой личный трекер')); nav.append(localNote);
  let screen = 'home', taskFilter = 'today', taskDraft = '', habitDraft = '', undoTask = null, taskLimit=50,pendingBudget=false;
  const retired=new Set(['ov','forecast','rpg','detective','plan','streaks','ai','habits','week']);
  const previousShow=show;
  show=function(){if(tab==='buys'||tab==='budget'){pendingBudget=tab==='budget';tab='buys';screen='buys';window.setView('hub',false);render();if(pendingBudget&&window.MyDayInsights?.ready){pendingBudget=false;window.MyDayInsights.selectTab('budget');render()}return}if(retired.has(tab)||tab==='tasks'){tab='tasks';screen='tasks';window.setView('hub',false);render();return}if(tab==='analytics'&&recordDayCount()<7){screen='more';window.setView('hub',false);render();return}previousShow()};
  for(let i=GROUPS.length-1;i>=0;i--){GROUPS[i][1]=GROUPS[i][1].filter(([id])=>!retired.has(id));if(!GROUPS[i][1].length)GROUPS.splice(i,1)}
  function tomorrow(){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+1);return ds(d)}
  function dayRecord(date){return S.mydayDaily?.[date]||{}}
  function recordDayCount(){return new Set([...S.items,...S.meals,...S.sleep,...S.gym].map(x=>x.date).concat(S.tasks.map(x=>x.doneAt?.slice(0,10))).filter(d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&d<=today())).size}
  function writeDay(date,values){if(!S.mydayDaily||typeof S.mydayDaily!=='object')S.mydayDaily={};S.mydayDaily[date]={...dayRecord(date),...values,updatedAt:Date.now()};save()}
  function scheduled(t,date){if(t.plannedFor)return date===today()?t.plannedFor<=date:t.plannedFor===date;return date===today()?(!t.due||t.due.slice(0,10)<=date):t.due?.slice(0,10)===date}
  const motionAllowed=()=>!matchMedia('(prefers-reduced-motion: reduce)').matches&&S.mydayPreferences?.motion!==false;
  function syncMotion(){const allowed=motionAllowed();document.documentElement.dataset.motion=allowed?'full':'reduced';if(!allowed)document.getAnimations().forEach(animation=>animation.cancel())}
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',syncMotion);syncMotion();
  const healthTabs = new Set(['gym', 'body', 'food', 'sleep', 'programs', 'guides', 'strength']);
  const moneyTabs = new Set(['buys', 'budget', 'ai']);
  function go(id) {
    if(retired.has(id))id='tasks';
    if (['home', 'tasks', 'buys', 'health', 'more','data-tools'].includes(id)) { screen = id;if(id==='tasks'||id==='buys')tab=id;window.setView('hub'); }
    else { screen = 'home'; window.setView('tracker'); tab = id; show(); }
    try { history.replaceState({...history.state,mydayScreen:screen,mydayTab:id},''); } catch(e) {}
    document.body.classList.remove('nav-open'); window.scrollTo({top:0,behavior:'instant'}); render();
    requestAnimationFrame(()=>{if(motionAllowed())home.animate([{opacity:.35,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:230,easing:'cubic-bezier(.2,.8,.2,1)'})});
  }
  function updateNav() {
    const current = document.body.dataset.view === 'hub' ? (screen==='data-tools'?'more':screen) : healthTabs.has(tab) ? 'health' : moneyTabs.has(tab) ? 'buys' : tab === 'tasks' ? 'tasks' : 'more';
    nav.querySelectorAll('[data-page]').forEach(b => { const active = b.dataset.page === current; b.classList.toggle('active', active); if (active) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  }
  function persist() { save(); render(); }
  const habits = () => { if (!Array.isArray(S.habits)) S.habits = []; return S.habits; };
  const weekday = d => d.toLocaleDateString('ru-RU', {weekday:'short'});
  function reveal(id) { const target=document.getElementById(id);if(target?.closest('.mw-focus-fold'))target.closest('.mw-focus-fold').open=true;target?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); }
  function toggleTheme() { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', select=document.getElementById('themeSelect'); if(select){select.value=theme;select.onchange?.()}else{document.documentElement.dataset.theme=theme;localStorage.setItem('myday-theme',theme)} render(); }
  function topbar() {
    const top = el('div', 'ma-top'), wordmark = el('div', 'ma-wordmark'); wordmark.append(el('span', 'ma-mark'), el('b', null, 'myday')); top.append(wordmark, el('span', 'ma-top-note', 'Место для твоего дня'));
    const actions = el('div', 'ma-top-actions'); actions.append(iconButton('search', 'Поиск по приложению', () => document.querySelector('.search-launch button')?.click()), iconButton(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon', 'Переключить тему', toggleTheme)); top.append(actions); return top;
  }
  function createChromeStage(){
    const stage=el('div','ma-chrome-stage');stage.setAttribute('aria-label','Обзор дня');
    const top=el('div','ma-stage-top');top.append(el('span',null,'ПЛАН / ФОКУС / РИТМ'),el('span','ma-checker'));stage.append(top);
    const mesh=document.createElementNS('http://www.w3.org/2000/svg','svg');mesh.setAttribute('viewBox','0 0 1000 400');mesh.setAttribute('preserveAspectRatio','none');mesh.setAttribute('class','ma-chrome-mesh');mesh.setAttribute('aria-hidden','true');
    for(let i=0;i<34;i++){const path=document.createElementNS(mesh.namespaceURI,'path');const y=35+i*8;path.setAttribute('d','M -60 '+y+' C 140 '+(y-90)+',190 '+(y+250)+',410 '+(y+40)+' S 710 '+(y-170)+',1080 '+(y+30));mesh.append(path)}stage.append(mesh);
    const orbit=el('div','ma-stage-orbit');orbit.setAttribute('aria-hidden','true');stage.append(orbit);
    const sculpture=el('div','ma-sculpture');sculpture.setAttribute('aria-hidden','true');
    sculpture.innerHTML='<svg class="ma-chrome-fallback" viewBox="0 0 440 360" aria-hidden="true"><defs><linearGradient id="ma-metal" x1=".2" y1="0" x2=".8" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#090909"/><stop offset=".13" stop-color="#eee"/><stop offset=".19" stop-color="#383838"/><stop offset=".28" stop-color="#000"/><stop offset=".35" stop-color="#fcfcfc"/><stop offset=".42" stop-color="#444"/><stop offset=".54" stop-color="#050505"/><stop offset=".62" stop-color="#fafafa"/><stop offset=".67" stop-color="#777"/><stop offset=".8" stop-color="#090909"/><stop offset=".92" stop-color="#e0e0e0"/><stop offset="1" stop-color="#333"/></linearGradient></defs><path d="M138 235C80 227 69 184 112 155C150 129 194 151 213 106C235 51 292 49 321 85C348 118 307 151 310 183C314 221 351 238 317 270C280 307 235 270 209 290C176 314 121 288 138 235ZM176 211C189 231 222 237 249 217C269 204 260 176 242 169C218 157 197 183 176 190C160 195 160 203 176 211Z" fill="url(#ma-metal)" fill-rule="evenodd" stroke="#b9b9b9" stroke-width="1.2"/><path d="M111 170C165 138 201 163 225 104C245 66 287 61 310 82M146 241C171 275 202 272 229 260C264 247 282 282 316 257M171 197C195 214 214 223 244 200" fill="none" stroke="#fafafa" stroke-width="3" opacity=".7"/></svg>';
    const canvas=el('canvas','ma-chrome-canvas');canvas.setAttribute('aria-hidden','true');sculpture.append(canvas);stage.append(sculpture,el('div','ma-stage-crosshair'));const orbitArt=el('div','mp-orbit-art');orbitArt.setAttribute('aria-hidden','true');orbitArt.innerHTML='<svg viewBox="0 0 320 250"><defs><linearGradient id="mp-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#333"/><stop offset=".2" stop-color="#fafafa"/><stop offset=".45" stop-color="#555"/><stop offset=".65" stop-color="#fafafa"/><stop offset="1" stop-color="#252529"/></linearGradient></defs><g fill="none" stroke="url(#mp-metal)" stroke-width="10"><ellipse cx="160" cy="125" rx="110" ry="75" transform="rotate(-35 160 125)"/><ellipse cx="160" cy="125" rx="110" ry="46" transform="rotate(35 160 125)"/><ellipse cx="160" cy="125" rx="78" ry="105" transform="rotate(10 160 125)"/></g></svg>';stage.append(orbitArt);
    return stage;
  }
  function weekStrip(current) {
    const wrap=el('div','mw-week'),head=el('div','mw-week-heading');head.append(el('span',null,'Эта неделя'));const strip = el('ol', 'ma-week-strip'); strip.setAttribute('aria-label', 'Текущая неделя');
    const start = new Date(); start.setHours(12,0,0,0); start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(start.getDate()+i); const key=ds(d), item=el('li', key===current?'is-today':''); item.append(el('span',null,weekday(d)),el('b',null,d.getDate()));
      if (key===current) item.setAttribute('aria-current','date');
      const recorded=S.tasks.some(t=>t.done&&t.doneAt?.slice(0,10)===key)||habits().some(h=>h.log?.[key]);
      const dot=el('i',recorded?'has-record':''); dot.setAttribute('aria-hidden','true'); item.append(dot);
      item.setAttribute('aria-label',d.toLocaleDateString('ru-RU',{weekday:'short',day:'numeric',month:'long'})+(recorded?', есть выполненные дела или привычки':'')); strip.append(item);
    }const count=strip.querySelectorAll('.has-record').length,info=el('span','mw-week-info');info.textContent=count?'Дней с отметками: '+count+' из 7':'Начни свой ритм с одного дела';head.append(info);wrap.append(head,strip);return wrap;
  }
  function setUndo(label,restore){undoTask={label,restore}}
  function feedback(rect){
    if(!motionAllowed()||!rect)return;
    const burst=el('div','ma-success-burst');burst.setAttribute('aria-hidden','true');burst.style.left=(rect.left+rect.width/2)+'px';burst.style.top=(rect.top+rect.height/2)+'px';
    for(let i=0;i<7;i++){const dot=el('i');const angle=i*Math.PI*2/7;dot.style.setProperty('--dx',Math.cos(angle)*30+'px');dot.style.setProperty('--dy',Math.sin(angle)*30+'px');dot.style.setProperty('--delay',i*8+'ms');burst.append(dot)}document.body.append(burst);setTimeout(()=>burst.remove(),650);
  }
  function completeTask(t,gesture=false){
    const progress=window.MyDayInteractions.taskSnapshot(),source=document.getElementById('ma-task-check-'+t.id),rect=source?.getBoundingClientRect(),before={done:t.done,doneAt:t.doneAt};
    t.done=!t.done;if(t.done)t.doneAt=nowLocal(0);else delete t.doneAt;
    setUndo(t.done?'Дело выполнено':'Дело возвращено',()=>{const item=S.tasks.find(x=>x.id===t.id);if(item){item.done=before.done;if(before.doneAt==null)delete item.doneAt;else item.doneAt=before.doneAt;upd(item)}});
    upd(t);render();if(t.done)feedback(rect);window.MyDayInteractions.taskCompleted(progress);const next=home.querySelector('.ma-task-check');if(next)next.focus({preventScroll:true});else if(!gesture&&matchMedia('(pointer:fine)').matches)document.getElementById('ma-task-title')?.focus({preventScroll:true});
  }
  function moveTask(t,date,quiet=false){
    const before=t.plannedFor,wasMain=String(dayRecord(today()).mainTaskId)===String(t.id);
    t.plannedFor=date;if(wasMain&&date!==today())writeDay(today(),{mainTaskId:null});upd(t);
    if(!quiet){setUndo('Перенесено на завтра',()=>{const item=S.tasks.find(x=>x.id===t.id);if(item){if(before==null)delete item.plannedFor;else item.plannedFor=before;upd(item);if(wasMain)writeDay(today(),{mainTaskId:item.id})}});render()}
  }
  function setMain(t,date){writeDay(date,{mainTaskId:t?.id??null});if(t){if(!scheduled(t,date)){t.plannedFor=date;upd(t)}if(!S.myFocusEnd)S.myFocusTaskId=t.id}persist()}
  function focusTask(t){S.myFocusTaskId=t.id;persist();reveal('ma-focus');document.getElementById('ma-focus-start')?.focus({preventScroll:true})}
  function stepList(t){const steps=el('div','ma-substeps');(t.subs||[]).forEach((step,i)=>{const b=button(step.t,()=>{step.d=!step.d;upd(t);render()},step.d?'is-done':'');b.setAttribute('aria-label','Шаг: '+step.t);b.setAttribute('aria-pressed',String(!!step.d));b.id='ma-step-'+t.id+'-'+i;b.prepend(icon('check'));steps.append(b)});return steps}
  function featuredPanel(date){
    const p=el('div','ma-featured'),record=dayRecord(date),task=S.tasks.find(t=>String(t.id)===String(record.mainTaskId));
    const heading=el('div','ma-featured-label');heading.append(icon('star'),el('span',null,'ГЛАВНОЕ ДЕЛО ДНЯ'));p.append(heading);
    if(task){
      p.dataset.key='main:'+task.id;p.classList.toggle('is-done',!!task.done);if(!task.done)heading.append(iconButton('tomorrow','На завтра: '+task.title,()=>moveTask(task,tomorrow()),'ma-featured-tomorrow'));
      const line=el('div','ma-featured-line'),title=button(task.title,()=>openTaskEditor(task),'ma-featured-title');title.setAttribute('aria-label','Изменить: '+task.title);title.id='ma-task-name-'+task.id;line.append(title,iconButton('close','Снять главное дело',()=>setMain(null,date),'ma-featured-clear'));p.append(line);
      const actions=el('div','ma-featured-actions'),complete=button(task.done?'Выполнено · вернуть':'Отметить выполненным',()=>completeTask(task),'ma-featured-complete');complete.id='ma-task-check-'+task.id;complete.setAttribute('aria-label',(task.done?'Вернуть: ':'Завершить: ')+task.title);actions.append(complete);
      if(!task.done){const b=button('В фокус',()=>focusTask(task),'ma-featured-focus');b.prepend(icon('play'));actions.append(b)}p.append(actions);if(task.subs?.length)p.append(stepList(task));
    }else{
      const label=el('label','ma-featured-select-label'),select=el('select');select.setAttribute('aria-label','Главное дело дня');select.append(new Option('Выбрать главное дело',''));S.tasks.filter(t=>!t.done).forEach(t=>select.append(new Option(t.title,String(t.id))));select.disabled=!S.tasks.some(t=>!t.done);select.onchange=()=>setMain(S.tasks.find(t=>String(t.id)===select.value),date);label.append(select);p.append(label);
      if(select.disabled)p.append(el('small',null,'Добавь первое дело ниже.'));
    }return task?window.MyDayInteractions.swipe(p,{right:{label:task.done?'Вернуть':'Выполнить',undo:true,run:()=>completeTask(task,true)},left:task.done?null:{label:'На завтра',undo:true,run:()=>moveTask(task,tomorrow())}}):p;
  }
  function taskRowModern(t,current){
    const row=el('div','ma-task-row'+(t.done?' is-done':''));row.dataset.key='task:'+t.id;
    const check=iconButton(t.done?'reset':'check',(t.done?'Вернуть: ':'Завершить: ')+t.title,()=>completeTask(t),'ma-task-check'+(t.done?' checked':''));check.id='ma-task-check-'+t.id;
    const copy=el('div','ma-task-copy'),name=button(t.title,()=>openTaskEditor(t),'ma-task-name');name.id='ma-task-name-'+t.id;name.setAttribute('aria-label','Изменить: '+t.title);copy.append(name);
    const meta=el('div','ma-task-meta');
    if(dayRecord(current).mainTaskId===t.id)meta.append(el('span','ma-priority main','Главное'));
    else if(t.prio==='срочная'||t.prio==='важная')meta.append(el('span',t.prio==='срочная'?'ma-priority urgent':'ma-priority',t.prio==='срочная'?'Срочное':'Важное'));
    if(t.done)meta.append(el('span',null,'Выполнено'+(t.doneAt?' · '+dueTxt(t.doneAt):'')));
    else if(t.due){const overdue=new Date(t.due).getTime()<Date.now();meta.append(el('span',overdue?'ma-overdue':'','Срок: '+dueTxt(t.due)))}
    if(t.plannedFor&&t.plannedFor>today())meta.append(el('span',null,t.plannedFor===tomorrow()?'В плане на завтра':'В плане на '+dmy(t.plannedFor)));
    if(!meta.childNodes.length)meta.append(el('span',null,'Без срока'));copy.append(meta);
    if(t.subs?.length)copy.append(stepList(t));
    row.append(check,copy);
    if(!t.done){const actions=el('div','ma-task-actions');actions.append(iconButton('play','Фокус на деле: '+t.title,()=>focusTask(t),'ma-row-focus'));
      const menu=el('details','ma-task-menu'),summary=el('summary');summary.append(icon('more'));summary.setAttribute('aria-label','Действия: '+t.title);menu.append(summary);const list=el('div','ma-task-menu-list');
      const date=taskFilter==='tomorrow'?tomorrow():today();list.append(button(dayRecord(date).mainTaskId===t.id?'Снять главное дело':'Сделать главным',()=>setMain(dayRecord(date).mainTaskId===t.id?null:t,date),'ma-menu-action'),button('На завтра',()=>moveTask(t,tomorrow()),'ma-menu-action'),button('Редактировать и шаги',()=>openTaskEditor(t),'ma-menu-action'));menu.append(list);actions.append(menu);row.append(actions);
    }return window.MyDayInteractions.swipe(row,{right:{label:t.done?'Вернуть':'Выполнить',undo:true,run:()=>completeTask(t,true)},left:t.done?null:{label:'На завтра',undo:true,run:()=>moveTask(t,tomorrow())}});
  }
  function taskPanel(current,done){
    const isFull=screen==='tasks',all=S.tasks.filter(t=>!t.done),todayTasks=all.filter(t=>scheduled(t,current)),tomorrowTasks=all.filter(t=>scheduled(t,tomorrow())),completed=S.tasks.filter(t=>t.done);
    const p=panel(isFull?'Твой список':'Дела на сегодня',isFull?null:button('Все дела',()=>go('tasks'),'ma-text-button'),'ma-tasks');
    if(!isFull&&(all.length||S.tasks.some(t=>String(t.id)===String(dayRecord(current).mainTaskId))))p.append(featuredPanel(current));
    const filters=el('div','ma-filters');filters.setAttribute('role','group');filters.setAttribute('aria-label','Показать дела');
    const options=isFull?[['today','Сегодня',todayTasks.length],['tomorrow','Завтра',tomorrowTasks.length],['all','Все',all.length],['done','Готово',completed.length]]:[['today','На сегодня',todayTasks.length],['all','Все',all.length]];
    if(!options.some(([id])=>id===taskFilter))taskFilter='today';
    options.forEach(([id,label,count])=>{const b=button(label+'  '+count,()=>{taskFilter=id;taskLimit=50;render()},taskFilter===id?'selected':'');b.id='ma-filter-'+id;b.dataset.filter=id;b.setAttribute('aria-pressed',String(taskFilter===id));filters.append(b)});p.append(filters);p.append(el('p','mg-swipe-hint','Свайп вправо — выполнить, влево — на завтра. Действие можно отменить.'));
    if(taskFilter!=='done'){
      const form=el('form','ma-task-form'),input=el('input');input.id='ma-task-title';input.placeholder=taskFilter==='tomorrow'?'Добавить дело на завтра':'Добавить дело на день';input.maxLength=100;input.required=true;input.value=taskDraft;input.autocomplete='off';input.enterKeyHint='done';input.setAttribute('aria-label','Новое дело');input.oninput=()=>{taskDraft=input.value};
      const add=el('button','ma-add-button');add.type='submit';add.append(icon('plus'));add.setAttribute('aria-label','Добавить дело');form.append(input,add);form.onsubmit=e=>{e.preventDefault();const title=taskDraft.trim();if(!title)return;const t={id:S.tasks.reduce((max,x)=>Math.max(max,Number(x.id)+1||0),Date.now()),title,done:false,due:'',plannedFor:taskFilter==='tomorrow'?tomorrow():current,prio:'обычная',tag:''};S.tasks.push(t);taskDraft='';upd(t);render();document.getElementById('ma-task-title')?.focus()};p.append(form);
    }
    const rank={'срочная':0,'важная':1,'обычная':2},date=taskFilter==='tomorrow'?tomorrow():current;
    const selected=(taskFilter==='all'?all:taskFilter==='tomorrow'?tomorrowTasks:taskFilter==='done'?completed:todayTasks).filter(t=>isFull||String(dayRecord(current).mainTaskId)!==String(t.id));
    const list=selected.slice().sort((a,b)=>taskFilter==='done'?(b.doneAt||'').localeCompare(a.doneAt||''):Number(dayRecord(date).mainTaskId===b.id)-Number(dayRecord(date).mainTaskId===a.id)||(rank[a.prio]??2)-(rank[b.prio]??2)||(a.due||'9999').localeCompare(b.due||'9999'));
    if(!list.length&&(isFull||!all.some(t=>String(dayRecord(current).mainTaskId)===String(t.id)))){const empty=el('div','ma-empty-state');empty.append(el('span','ma-empty-symbol',taskFilter==='tomorrow'?'↗':'✓'),el('b',null,taskFilter==='tomorrow'?'Завтра начинается здесь':taskFilter==='done'?'Здесь будут выполненные дела':done?'На сегодня всё готово':'С чего начнём?'),el('p',null,taskFilter==='tomorrow'?'Оставь себе один понятный следующий шаг.':taskFilter==='done'?'Отмечай сделанное — прогресс сохранится.':'Без спешки. Начни с одного дела.'));p.append(empty)}
    list.slice(0,isFull?taskLimit:3).forEach(t=>p.append(taskRowModern(t,current)));
    if(list.length>(isFull?taskLimit:3))p.append(button(isFull?'Показать ещё':'Ещё '+(list.length-3)+' · Открыть список',()=>{if(isFull){taskLimit+=50;render()}else go('tasks')},'ma-more-tasks'));
    if(undoTask){const notice=el('div','ma-undo');notice.setAttribute('role','status');notice.append(icon('check'),el('span',null,undoTask.label),button('Отменить',()=>{const action=undoTask;undoTask=null;action.restore();render()},'ma-text-button'));p.append(notice)}return p;
  }
  function makeDialog(title){
    const dialog=el('dialog','ma-dialog'),head=el('div','ma-dialog-head'),heading=el('h2',null,title);heading.id='ma-dialog-title';dialog.setAttribute('aria-labelledby',heading.id);head.append(heading,iconButton('close','Закрыть',()=>dialog.close()));dialog.append(head);
    const returnId=document.activeElement?.id;dialog.addEventListener('close',()=>{dialog.remove();(returnId&&document.getElementById(returnId)||document.getElementById('ma-task-title'))?.focus({preventScroll:true})},{once:true});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});document.body.append(dialog);return dialog;
  }
  function labeled(text,input){const label=el('label','ma-field',text);input.setAttribute('aria-label',text);label.append(input);return label}
  function openTaskEditor(t){
    document.querySelector('.ma-dialog')?.close();const dialog=makeDialog('Детали дела'),form=el('form','ma-editor-form');
    const title=el('input');title.value=t.title;title.required=true;title.maxLength=100;title.id='ma-edit-title';
    const date=el('input');date.type='date';date.value=t.plannedFor||'';
    const due=el('input');due.type='datetime-local';due.value=t.due||'';
    const priority=el('select');[['обычная','Обычное'],['важная','Важное'],['срочная','Срочное']].forEach(([value,label])=>priority.append(new Option(label,value)));priority.value=t.prio||'обычная';
    const fields=el('div','ma-editor-grid');fields.append(labeled('В плане на',date),labeled('Важность',priority));
    const steps=el('textarea');steps.rows=3;steps.maxLength=4000;steps.placeholder='Первый маленький шаг\nСледующий шаг';steps.value=(t.subs||[]).map(s=>s.t).join('\n');
    form.append(labeled('Название дела',title),fields,labeled('Срок — если он есть',due),labeled('Шаги — каждый с новой строки',steps),el('p','ma-field-note','Шаги можно отмечать прямо в списке.'));
    const footer=el('div','ma-dialog-footer'),remove=button('Удалить дело',()=>{if(!confirm('Удалить дело «'+t.title+'»?'))return;const saved=t,index=S.tasks.findIndex(x=>x.id===t.id);S.tasks=S.tasks.filter(x=>x.id!==t.id);cloudTaskDel(t.id);save();setUndo('Дело удалено',()=>{if(!S.tasks.some(x=>x.id===saved.id)){S.tasks.splice(Math.min(index,S.tasks.length),0,saved);upd(saved)}});dialog.close();render()},'ma-delete-button');
    const submit=el('button','ma-button','Сохранить');submit.type='submit';footer.append(remove,submit);form.append(footer);
    form.onsubmit=e=>{e.preventDefault();if(!title.value.trim()){title.setCustomValidity('Напиши название дела');title.reportValidity();return}title.setCustomValidity('');const item=S.tasks.find(x=>x.id===t.id);if(!item){dialog.close();return}const previous=[...(item.subs||[])];item.title=title.value.trim();item.plannedFor=date.value;item.due=due.value;item.prio=priority.value;item.subs=steps.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(text=>{const i=previous.findIndex(s=>s.t===text);return i>=0?previous.splice(i,1)[0]:{t:text,d:false}});upd(item);dialog.close();render()};title.oninput=()=>title.setCustomValidity('');dialog.append(form);dialog.showModal();title.focus();title.select();
  }
  function openReview(){
    document.querySelector('.ma-dialog')?.close();const current=today(),record=dayRecord(current),next=tomorrow(),dialog=makeDialog('Итоги дня'),form=el('form','ma-review-form');
    const done=S.tasks.filter(t=>t.done&&t.doneAt?.slice(0,10)===current).length,hit=habits().filter(h=>h.log?.[current]).length,stats=el('div','ma-review-stats');stats.append(el('div',null,done+' · выполнено дел'),el('div',null,hit+' / '+habits().length+' · привычки'));form.append(stats);
    const note=el('textarea');note.rows=3;note.maxLength=1000;note.value=record.note||'';note.placeholder='Даже небольшой шаг имеет значение.';form.append(labeled('Что получилось сегодня?',note));
    const carry=el('div','ma-review-carry');carry.append(el('h3',null,'Что перенести на завтра?'));const checks=[];
    S.tasks.filter(t=>!t.done&&scheduled(t,current)).forEach(t=>{const input=el('input');input.type='checkbox';input.value=String(t.id);const label=el('label');label.append(input,el('span',null,t.title));checks.push(input);carry.append(label)});
    if(!checks.length)carry.append(el('p','ma-field-note','Незавершённых дел на сегодня нет.'));form.append(carry);
    const main=el('select');main.setAttribute('aria-label','Главное дело на завтра');main.append(new Option('Пока не выбирать',''));S.tasks.filter(t=>!t.done).forEach(t=>main.append(new Option(t.title,String(t.id))));main.value=String(dayRecord(next).mainTaskId||'');form.append(labeled('Главное дело на завтра',main));
    const footer=el('div','ma-dialog-footer');footer.append(el('span','ma-field-note','Можно вернуться и дополнить.'),el('button','ma-button','Сохранить итоги'));form.append(footer);
    form.onsubmit=e=>{e.preventDefault();checks.filter(c=>c.checked).forEach(c=>{const t=S.tasks.find(x=>String(x.id)===c.value&&!x.done);if(t)moveTask(t,next,true)});const selected=S.tasks.find(t=>String(t.id)===main.value&&!t.done);if(selected)moveTask(selected,next,true);writeDay(next,{mainTaskId:selected?.id??null});writeDay(current,{note:note.value.trim(),reviewedAt:nowLocal(0)});dialog.close();render();toast('Итоги сохранены. Завтра уже есть начало.')};dialog.append(form);dialog.showModal();
  }
  function reviewPanel(){const reviewed=!!dayRecord(today()).reviewedAt,box=el('div','ma-evening');const copy=el('div');copy.append(el('b',null,reviewed?'День собран':'Оставь себе лёгкое завтра'),el('p',null,reviewed?'Итоги сохранены. Их можно дополнить.':'Отметь сделанное и выбери следующий шаг.'));box.append(icon('moon'),copy,button(reviewed?'Дополнить':'Итоги дня',openReview,'ma-evening-button'));return box}

  function focusPanel(all){
    const focus=el('div','ma-focus'+(S.myFocusEnd?' is-running':''));focus.id='ma-focus';const head=el('div','ma-focus-heading');head.append(icon('clock'),el('b',null,S.myFocusEnd?'Сейчас только это':'Одна задача за раз'));focus.append(head);
    const label=el('label','ma-focus-label','Задача для фокуса'),select=el('select');select.id='ma-focus-task';select.setAttribute('aria-label','Задача для фокуса');select.append(new Option('Без привязки к делу',''));all.forEach(t=>select.append(new Option(t.title,String(t.id))));select.value=all.some(t=>String(t.id)===String(S.myFocusTaskId))?String(S.myFocusTaskId):'';select.onchange=()=>{S.myFocusTaskId=select.value;save()};label.append(select);focus.append(label);
    const controls=el('div','ma-focus-controls'),clock=el('div','ma-clock');clock.id='ma-clock';clock.setAttribute('role','timer');clock.setAttribute('aria-label','Осталось времени');controls.append(clock);
    const start=button(S.myFocusEnd?'Пауза':S.myFocusRemaining>0&&S.myFocusRemaining<25*60e3?'Продолжить':'Начать фокус',()=>{if(S.myFocusEnd){S.myFocusRemaining=Math.max(0,S.myFocusEnd-Date.now());delete S.myFocusEnd}else{S.myFocusEnd=Date.now()+(S.myFocusRemaining>0?S.myFocusRemaining:25*60e3);delete S.myFocusRemaining}persist()});start.id='ma-focus-start';controls.append(start,iconButton('reset','Сбросить таймер',()=>{delete S.myFocusEnd;delete S.myFocusRemaining;persist()},'ma-focus-reset'));focus.append(controls);return focus;
  }
  function addHabit(name){name=name.trim();if(!name)return;if(habits().some(h=>h.name.toLocaleLowerCase('ru-RU')===name.toLocaleLowerCase('ru-RU'))){toast('Такая привычка уже есть');return}habits().push({id:crypto.randomUUID(),name,log:{}});habitDraft='';persist()}
  function habitPanel(current){
    const hs=habits(),count=hs.filter(h=>h.log?.[current]).length,p=panel('Маленькие ритуалы',el('span','ma-count',count+' / '+hs.length),'ma-habits');p.id='ma-habits';p.append(el('p','ma-section-note','Привычки, которым есть место каждый день.'));
    if(!hs.length){const empty=el('div','ma-habit-empty'),suggestions=el('div','ma-suggestions');empty.append(el('p',null,'Начни с чего-то простого.'));['Прогулка','Читать 10 минут','Вода утром'].forEach(name=>suggestions.append(button('+ '+name,()=>addHabit(name),'ma-suggestion')));empty.append(suggestions);p.append(empty)}
    hs.forEach(h=>{
      const hit=!!h.log?.[current],row=el('div','ma-habit-row'),check=iconButton('check',(hit?'Отменить: ':'Отметить: ')+h.name,()=>{const rect=check.getBoundingClientRect();h.log=h.log||{};if(hit)delete h.log[current];else h.log[current]=1;persist();if(!hit)feedback(rect)},'ma-habit-check'+(hit?' checked':''));check.setAttribute('aria-pressed',String(hit));row.dataset.key='habit:'+h.id;
      check.id='ma-habit-'+h.id;const copy=el('div','ma-habit-copy');copy.append(el('b',null,h.name));const week=el('div','ma-habit-week');
      for(let i=6;i>=0;i--){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);const key=ds(d),yes=!!h.log?.[key],dot=el('span',(yes?'hit ':'')+(i===0?'current':''),weekday(d));dot.title=key+(yes?' · выполнено':' · без отметки');dot.setAttribute('aria-label',dot.title);week.append(dot)}copy.append(week);row.append(check,copy);
      const options=el('details','ma-habit-options'),summary=el('summary');summary.append(icon('more'));summary.setAttribute('aria-label','Настройки привычки: '+h.name);options.append(summary,button('Удалить привычку',()=>{if(confirm('Удалить привычку «'+h.name+'» и её историю?')){S.habits=hs.filter(x=>x.id!==h.id);persist()}},'ma-delete-habit'));row.append(options);p.append(row);
    });
    const form=el('form','ma-habit-form'),input=el('input');input.id='ma-habit-title';input.placeholder='Своя привычка';input.maxLength=60;input.required=true;input.value=habitDraft;input.setAttribute('aria-label','Название привычки');input.oninput=()=>{habitDraft=input.value};input.enterKeyHint='done';const add=el('button','ma-habit-add');add.type='submit';add.append(icon('plus'));add.setAttribute('aria-label','Добавить привычку');form.append(input,add);form.onsubmit=e=>{e.preventDefault();addHabit(habitDraft)};p.append(form);return p;
  }
  function money(value){const code=({'€':'EUR','$':'USD','₽':'RUB','₴':'UAH','£':'GBP'})[S.cur]||S.cur||'RUB';try{return new Intl.NumberFormat('ru-RU',{style:'currency',currency:code,minimumFractionDigits:0,maximumFractionDigits:2}).format(value)}catch{return value.toLocaleString('ru-RU',{maximumFractionDigits:2})+' '+(S.cur||'')}}
  function summaryPanel(current){
    const section=el('div','ma-summary');section.append(el('h2',null,'Всё остальное — рядом'));const grid=el('div','ma-summary-grid');
    function tile(id,title,value,description,cls=''){const b=button('',()=>go(id),'ma-summary-item'),h=el('div','ma-summary-label');h.append(icon(id==='sleep'?'moon':id),el('span',null,title),icon('arrow'));b.append(h,el('strong',cls,value),el('small',null,description));grid.append(b)}
    const spent=S.items.filter(i=>i.date?.startsWith(current.slice(0,7))).reduce((sum,i)=>sum+(Number(i.amount)||0),0);tile('buys','Деньги',money(spent),'Расходы за '+new Date().toLocaleDateString('ru-RU',{month:'long'}));
    const last=(S.sleep||[]).filter(x=>x.date&&sleepDuration(x.bed,x.wake)>0).slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
    if(last){const minutes=sleepDuration(last.bed,last.wake);tile('sleep','Сон',Math.floor(minutes/60)+' ч '+(minutes%60?minutes%60+' мин':''),last.date===current?'Последняя ночь · сегодня':'Запись за '+dmy(last.date))}else tile('sleep','Сон','Как спалось?','Записать прошедшую ночь','ma-no-data');
    const start=new Date();start.setHours(12,0,0,0);start.setDate(start.getDate()-(start.getDay()+6)%7);const monday=ds(start),days=new Set((S.gym||[]).filter(x=>x.date>=monday&&x.date<=current).map(x=>x.date)).size;tile('gym','Движение',days+(days===1?' день':days>1&&days<5?' дня':' дней'),'С тренировками на этой неделе');section.append(grid);return section;
  }
  function healthScreen(){
    const head=el('div','ma-page-heading');head.append(el('p','ma-eyebrow','СВОЙ ТЕМП'),el('h1',null,'Здоровье'),el('p','ma-description','Сон, питание, тренировки и измерения.'));const record=button('Записать тренировку',()=>{go('gym');window.miniReveal?.(document.getElementById('g_ex'))},'ma-button');head.classList.add('mp-health-heading');head.append(record);home.append(head);const grid=el('div','ma-health-grid');
    [['sleep','Сон','Длительность, режим и качество'],['food','Питание','Приёмы пищи и дневник питания'],['gym','Тренировки','Журнал подходов и упражнений'],['body','Форма','Вес, замеры и изменения'],['programs','Программа','Твой план тренировок']].forEach(([id,title,desc])=>{const b=button('',()=>go(id),'ma-health-card');b.append(icon(id==='sleep'?'moon':id==='programs'?'tasks':id));const copy=el('div');copy.append(el('h2',null,title),el('p',null,desc));b.append(copy,icon('arrow'));grid.append(b)});home.append(grid);if(window.MyDayInsights?.ready)home.append(window.MyDayInsights.health());
  }
  function moreScreen(){
    const head=el('div','ma-page-heading');head.append(el('p','ma-eyebrow','ПОД РУКОЙ'),el('h1',null,'Ещё'),el('p','ma-description','Цели, упражнения и настройки.'));home.append(head);
    const grid=el('div','ma-menu-grid');
    [['Планы',[['goals','Цели'],['budget','Бюджет']]],['Практика',[['photos','Фото-прогресс'],['guides','Упражнения'],['strength','Рабочие веса']]],['Настройки',[['data','Данные и резервная копия']]]].forEach(([name,tabs])=>{const group=el('div','ma-menu-group');group.append(el('h2',null,name));tabs.forEach(([id,label])=>{if(!GROUPS.some(g=>g[1].some(x=>x[0]===id)))return;const b=button('',()=>go(id),'ma-menu-link');b.dataset.tab=id;b.append(el('span',null,label),icon('arrow'));group.append(b)});grid.append(group)});const settings=grid.querySelector('.ma-menu-group:last-child');const appearance=button('Персонализация',()=>window.MyDayPersonalize.open(),'ma-menu-link');appearance.id='ma-personalize';appearance.append(icon('arrow'));settings.insertBefore(appearance,settings.querySelector('.ma-menu-link'));home.append(grid);
    const tools=button('Тестовые данные и очистка',()=>go('data-tools'),'ma-menu-link');tools.append(icon('arrow'));home.append(tools);
    const days=recordDayCount();
    const stats=el('div','ma-stats-gate');stats.append(icon('tasks'),el('div',null,days>=7?'Есть история, которую можно посмотреть':'Статистика без поспешных выводов'));
    if(days>=7){const b=button('Открыть статистику',()=>go('analytics'),'ma-text-button');b.dataset.tab='analytics';stats.append(b)}else stats.append(el('small',null,'Появится после 7 дней записей · '+days+' / 7'));home.append(stats);
    const preferences=el('div','ma-preferences'),copy=el('div');copy.append(el('b',null,'Движение в интерфейсе'),el('p',null,matchMedia('(prefers-reduced-motion: reduce)').matches?'Уменьшено по настройкам устройства.':'Мягкие переходы и отклик на действия.'));const toggle=button(S.mydayPreferences?.motion===false?'Выключено':'Включено',()=>{S.mydayPreferences={...S.mydayPreferences,motion:S.mydayPreferences?.motion===false};syncMotion();persist()},'ma-motion-toggle');toggle.setAttribute('aria-label','Анимация интерфейса');toggle.setAttribute('aria-pressed',String(S.mydayPreferences?.motion!==false));preferences.append(copy,toggle);home.append(preferences,reviewPanel());
  }
  function tasksScreen(){const head=el('div','ma-page-heading');head.append(el('p','ma-eyebrow','ПО ОДНОМУ ШАГУ'),el('h1',null,'Дела'),el('p','ma-description','Дела на сегодня и завтра.'));home.append(head,taskPanel(today(),S.tasks.filter(t=>t.done&&t.doneAt?.slice(0,10)===today()).length),focusPanel(S.tasks.filter(t=>!t.done)))}
  let overviewOpen=false,focusExpanded=false;
  function fold(title,description,cls,content,open){const box=el('details',cls),summary=el('summary'),copy=el('span','mw-fold-copy');copy.append(el('b',null,title),el('small',null,description));summary.append(copy,icon('arrow'));box.append(summary,content);box.open=open;return box}
  function render(){overviewOpen=home.querySelector('.mw-overview')?.open??overviewOpen;focusExpanded=home.querySelector('.mw-focus-fold')?.open??focusExpanded;document.querySelector('.mg-global-undo')?.remove();
    updateNav();syncMotion();window.MyDayPersonalize?.apply();if(document.body.dataset.view!=='hub'){window.MyDayWorkspace?.refresh();return}
    const previous=home.dataset.screen===screen?new Map([...home.querySelectorAll('[data-key]')].map(node=>[node.dataset.key,node.getBoundingClientRect()])):new Map();home.dataset.screen=screen;
    const active=document.activeElement,focusId=active?.id,selection=typeof active?.selectionStart==='number'?[active.selectionStart,active.selectionEnd]:null;home.replaceChildren(topbar());
    if(window.MYDAY_DEMO&&window.MyDayInsights?.ready)home.append(window.MyDayInsights.demoBanner());
    if(screen==='data-tools'){if(window.MyDayInsights?.ready)home.append(window.MyDayInsights.dataTools())}else if(screen==='health')healthScreen();else if(screen==='more')moreScreen();else if(screen==='tasks')tasksScreen();else if(screen==='buys'){if(window.MyDayInsights?.ready)home.append(window.MyDayInsights.finance());else home.append(el('p',null,'Загрузка расходов…'))}else{
      const current=today(),done=S.tasks.filter(t=>t.done&&t.doneAt?.slice(0,10)===current).length,remaining=S.tasks.filter(t=>!t.done&&scheduled(t,current)).length;
      const heading=el('div','ma-heading'),title=el('div');title.append(el('p','ma-eyebrow',new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})),el('h1',null,'Сегодня'));
      const progress=el('div','ma-day-progress'),ring=el('span','ma-progress-ring');ring.style.setProperty('--progress',(done+remaining?done/(done+remaining)*100:0)+'%');ring.setAttribute('aria-hidden','true');ring.append(el('span',null,done));const text=el('div');text.append(el('b',null,done+remaining?done+' из '+(done+remaining)+' выполнено':'План пока свободен'),el('span',null,remaining?remaining+(remaining===1?' дело впереди':remaining<5?' дела впереди':' дел впереди'):done?'На сегодня план выполнен':'Твой день — твои приоритеты'));progress.append(ring,text);progress.setAttribute('role','group');progress.setAttribute('aria-label',done+' выполнено, '+remaining+' осталось');heading.append(title,progress);chromeStage.querySelector('.ma-heading')?.remove();chromeStage.append(heading);const quickSlot=el('div','mx-quick-slot');home.append(chromeStage,quickSlot,weekStrip(current));
      const grid=el('div','ma-grid');const focus=fold('Фокус',S.myFocusEnd?'Таймер идёт':'25 минут на одно дело','mw-focus-fold',focusPanel(S.tasks.filter(t=>!t.done)),focusExpanded||!!S.myFocusEnd||S.myFocusRemaining>0&&S.myFocusRemaining<25*60e3);grid.append(taskPanel(current,done),habitPanel(current),focus);const quickForm=grid.querySelector('.ma-task-form');if(quickForm)quickSlot.append(quickForm);home.append(grid,reviewPanel());if(window.MyDayInsights?.ready){const content=el('div','mw-overview-content');content.append(window.MyDayInsights.pulse(),window.MyDayInsights.activity(),summaryPanel(current));home.append(fold('Показатели и графики','Дела, привычки, деньги и сон','mw-overview',content,overviewOpen))}const footer=el('div','ma-footer');footer.append(el('span',null,''),button('Данные и резервная копия',()=>go('data'),'ma-text-button'));home.append(footer);
    }tick();window.MyDayChrome?.refresh();const restore=focusId&&document.getElementById(focusId);if(restore){restore.focus({preventScroll:true});if(selection)restore.setSelectionRange(...selection)}
    if(motionAllowed())home.querySelectorAll('[data-key]').forEach(node=>{const old=previous.get(node.dataset.key),now=node.getBoundingClientRect();if(old&&Math.abs(old.top-now.top)>1)node.animate([{transform:'translateY('+(old.top-now.top)+'px)'},{transform:'translateY(0)'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'})});
  }
  function tick(){const c=document.getElementById('ma-clock'),ms=S.myFocusEnd?Math.max(0,S.myFocusEnd-Date.now()):(S.myFocusRemaining??25*60e3);if(S.myFocusEnd&&ms===0){delete S.myFocusEnd;S.myFocusRemaining=0;save();toast('Фокус завершён. Время для перерыва.');render();return}if(c){const seconds=Math.ceil(ms/1000);c.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}}
  function syncChrome(){let meta=document.querySelector('meta[name="theme-color"]');if(!meta){meta=el('meta');meta.name='theme-color';document.head.append(meta)}meta.content=document.documentElement.dataset.theme==='dark'?'#101013':'#dededc'}
  syncChrome();new MutationObserver(syncChrome).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  home.dataset.day=today();setInterval(()=>{tick();if(document.body.dataset.view==='hub'&&screen==='home'&&home.dataset.day!==today()){home.dataset.day=today();render()}},1000);
  new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:['data-view','data-tab']});window.addEventListener('pageshow',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();render()}});
  window.addEventListener('popstate',e=>{screen=['home','tasks','buys','health','more','data-tools'].includes(e.state?.mydayScreen)?e.state.mydayScreen:'home';if(e.state?.v==='tracker'&&GROUPS.some(g=>g[1].some(x=>x[0]===e.state.mydayTab))){tab=e.state.mydayTab;show()}render()});
  document.addEventListener('pointerdown',e=>{if(!motionAllowed())return;const b=e.target.closest('.ma-home button,.ma-nav button');if(!b||b.disabled)return;const r=b.getBoundingClientRect(),ripple=el('span','ma-ripple');ripple.setAttribute('aria-hidden','true');ripple.style.left=(e.clientX-r.left)+'px';ripple.style.top=(e.clientY-r.top)+'px';b.append(ripple);setTimeout(()=>ripple.remove(),500)});
  document.addEventListener('click',e=>{document.querySelectorAll('.ma-task-menu[open],.ma-habit-options[open]').forEach(menu=>{if(!menu.contains(e.target))menu.open=false})});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('.ma-dialog[open]'))document.querySelectorAll('.ma-task-menu[open],.ma-habit-options[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary')?.focus()})});
  try{history.replaceState({...history.state,mydayScreen:'home',mydayTab:tab},'')}catch(e){}render();
  const sculptureScript=el('script');sculptureScript.src='./app/chrome.js';document.head.append(sculptureScript);
  const luxeScript=el('script');luxeScript.src='./app/luxe.js';document.head.append(luxeScript);
  
  const insightScript=el('script');insightScript.src='./app/insights.js';insightScript.onload=()=>{window.MyDayInsights.configure({state:()=>S,categories:()=>CATS,el,button,icon,iconButton,panel,makeDialog,labeled,money,today,ds,go,render,motionAllowed,sleepDuration,
    commitExpense(item,editing){const i=S.items.findIndex(x=>x.id===item.id);if(editing&&i<0){toast('Эта покупка уже удалена');return}if(i>=0)S.items[i]=item;else S.items.push(item);delete S.analysis[item.id];save();cloudItem(item);cloudAnalysis()},
    removeExpense(id){S.items=S.items.filter(x=>x.id!==id);delete S.analysis[id];save();cloudDel(id);cloudAnalysis()},
    saveBudget(value){S.limit=value;const input=document.getElementById('limit');if(input)input.value=value||'';save();cloudSettings(true)},
    updateState(fn){fn(S);save()},
    async demoMode(active,reset=false){if(reset){localStorage.setItem('spend-demo-v1',JSON.stringify(window.MyDayDemo.seed()));try{await window.MyDayDemo.seedPhotos()}catch(error){toast('Примеры заполнены, но хранилище фото недоступно')}}if(active)localStorage.setItem('myday-demo-mode','1');else localStorage.removeItem('myday-demo-mode');const url=new URL(location.href);url.searchParams.delete('demo');location.replace(url.href)},
    async clearData(demoOnly){
      const clearPhotos=name=>new Promise((resolve,reject)=>{const req=indexedDB.open(name,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('p'))req.result.createObjectStore('p',{keyPath:'id'})};req.onerror=()=>reject(req.error);req.onsuccess=()=>{const database=req.result,tx=database.transaction('p','readwrite');tx.objectStore('p').clear();tx.oncomplete=()=>{database.close();resolve()};tx.onerror=()=>{database.close();reject(tx.error)}}});
      await clearPhotos('myday-demo-photos');if(!demoOnly)await clearPhotos('myday-photos');
      if(demoOnly){localStorage.removeItem('spend-demo-v1');if(window.MYDAY_DEMO)localStorage.setItem('spend-demo-v1',JSON.stringify({items:[],tasks:[],gym:[],body:[],meals:[],sleep:[],habits:[],tpls:[],goals:[],foodDb:[],budgets:{},recurring:[],analysis:{},mydaySavings:[]}))}else{for(const key of Object.keys(localStorage)){if(key==='spend-v1'||key==='spend-demo-v1'||key.startsWith('myday-'))localStorage.removeItem(key)}localStorage.setItem('myday-sync-disabled','1')}
      const url=new URL(location.href);url.searchParams.delete('demo');location.replace(url.href)
    }
  });window.MyDayPersonalize.init({state:()=>S,save,render,makeDialog,el,button});render();if(pendingBudget){pendingBudget=false;window.MyDayInsights.selectTab('budget');render()}};document.head.append(insightScript);
})();
