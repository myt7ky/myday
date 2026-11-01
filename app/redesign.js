/* MyDay daily workspace. Keeps spend-v1 and the existing tracker APIs. */
(() => {
  'use strict';
  const stylesheet = el('link');
  stylesheet.rel = 'stylesheet'; stylesheet.href = './app/redesign.css'; document.head.append(stylesheet);
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
  const nav = el('nav', 'ma-nav'); nav.setAttribute('aria-label', 'Основная навигация'); document.body.append(nav);
  const brand = button('', () => go('home'), 'ma-nav-brand'); brand.append(el('span', 'ma-mark'), el('b', null, 'myday')); brand.setAttribute('aria-label', 'MyDay — сегодня'); nav.append(brand);
  [['home', 'Сегодня'], ['tasks', 'Дела'], ['buys', 'Деньги'], ['health', 'Здоровье'], ['more', 'Ещё']].forEach(([id, label]) => { const b = button('', () => go(id), 'ma-nav-item'); b.dataset.page = id; b.append(icon(id), el('span', null, label)); nav.append(b); });
  const localNote = el('div', 'ma-local-note'); localNote.append(el('i'), el('span', null, 'Твой личный трекер')); nav.append(localNote);
  let screen = 'home', taskFilter = 'today', taskDraft = '', habitDraft = '', undoTask = null;
  const healthTabs = new Set(['gym', 'body', 'food', 'sleep', 'programs', 'guides', 'strength']);
  const moneyTabs = new Set(['buys', 'budget', 'ai']);
  function go(id) {
    if (['home', 'health', 'more'].includes(id)) { screen = id; window.setView('hub'); }
    else { screen = 'home'; window.setView('tracker'); tab = id; show(); }
    try { history.replaceState({...history.state,mydayScreen:screen,mydayTab:id},''); } catch(e) {}
    document.body.classList.remove('nav-open'); window.scrollTo({top:0,behavior:'instant'}); render();
  }
  function updateNav() {
    const current = document.body.dataset.view === 'hub' ? screen : healthTabs.has(tab) ? 'health' : moneyTabs.has(tab) ? 'buys' : tab === 'tasks' ? 'tasks' : 'more';
    nav.querySelectorAll('[data-page]').forEach(b => { const active = b.dataset.page === current; b.classList.toggle('active', active); if (active) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  }
  function persist() { save(); render(); }
  const habits = () => { if (!Array.isArray(S.habits)) S.habits = []; return S.habits; };
  const weekday = d => d.toLocaleDateString('ru-RU', {weekday:'short'});
  function reveal(id) { document.getElementById(id)?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); }
  function toggleTheme() { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', select=document.getElementById('themeSelect'); if(select){select.value=theme;select.onchange?.()}else{document.documentElement.dataset.theme=theme;localStorage.setItem('myday-theme',theme)} render(); }
  function topbar() {
    const top = el('div', 'ma-top'), wordmark = el('div', 'ma-wordmark'); wordmark.append(el('span', 'ma-mark'), el('b', null, 'myday')); top.append(wordmark, el('span', 'ma-top-note', 'Место для твоего дня'));
    const actions = el('div', 'ma-top-actions'); actions.append(iconButton('search', 'Поиск по приложению', () => document.querySelector('.search-launch button')?.click()), iconButton(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon', 'Переключить тему', toggleTheme)); top.append(actions); return top;
  }
  function weekStrip(current) {
    const strip = el('ol', 'ma-week-strip'); strip.setAttribute('aria-label', 'Текущая неделя');
    const start = new Date(); start.setHours(12,0,0,0); start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(start.getDate()+i); const key=ds(d), item=el('li', key===current?'is-today':''); item.append(el('span',null,weekday(d)),el('b',null,d.getDate()));
      if (key===current) item.setAttribute('aria-current','date');
      const recorded=S.tasks.some(t=>t.done&&t.doneAt?.slice(0,10)===key)||habits().some(h=>h.log?.[key]);
      const dot=el('i',recorded?'has-record':''); dot.setAttribute('aria-hidden','true'); item.append(dot);
      item.setAttribute('aria-label',d.toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})+(recorded?', есть выполненные дела или привычки':'')); strip.append(item);
    } return strip;
  }
  function completeTask(t) { undoTask={id:t.id,done:t.done,doneAt:t.doneAt}; t.done=true; t.doneAt=nowLocal(0); upd(t); render(); home.querySelector('.ma-task-check, #ma-task-title')?.focus({preventScroll:true}); }
  function taskPanel(current,done) {
    const all=S.tasks.filter(t=>!t.done), todayTasks=all.filter(t=>!t.due||t.due.slice(0,10)<=current);
    const p=panel('Главное сегодня',button('Все дела',()=>go('tasks'),'ma-text-button'),'ma-tasks');
    const filters=el('div','ma-filters'); filters.setAttribute('role','group'); filters.setAttribute('aria-label','Показать дела');
    [['today','На сегодня',todayTasks.length],['all','Все',all.length]].forEach(([id,label,count])=>{const b=button(label+'  '+count,()=>{taskFilter=id;render()},taskFilter===id?'selected':''); b.setAttribute('aria-pressed',String(taskFilter===id)); filters.append(b)}); p.append(filters);
    const form=el('form','ma-task-form'), input=el('input'); input.id='ma-task-title'; input.placeholder='Добавить дело на день'; input.maxLength=100; input.required=true; input.value=taskDraft; input.autocomplete='off'; input.enterKeyHint='done'; input.setAttribute('aria-label','Новое дело'); input.oninput=()=>{taskDraft=input.value};
    const add=el('button','ma-add-button'); add.type='submit'; add.append(icon('plus')); add.setAttribute('aria-label','Добавить дело'); form.append(input,add);
    form.onsubmit=e=>{e.preventDefault();const title=taskDraft.trim();if(!title)return;const t={id:S.tasks.reduce((max,x)=>Math.max(max,Number(x.id)+1||0),Date.now()),title,done:false,due:'',prio:'обычная',tag:''};S.tasks.push(t);taskDraft='';taskFilter='today';upd(t);render();assessTask(t);document.getElementById('ma-task-title')?.focus()};p.append(form);
    const rank={'срочная':0,'важная':1,'обычная':2};
    const list=(taskFilter==='all'?all:todayTasks).slice().sort((a,b)=>Number(!!b.due&&b.due.slice(0,10)<current)-Number(!!a.due&&a.due.slice(0,10)<current)||(rank[a.prio]??2)-(rank[b.prio]??2)||(a.due||'9999').localeCompare(b.due||'9999'));
    if(!list.length){const empty=el('div','ma-empty-state');empty.append(el('span','ma-empty-symbol','✓'),el('b',null,done?'На сегодня всё готово':'С чего начнём?'),el('p',null,done?'Можно выдохнуть. Или добавить следующий шаг.':'Запиши одно дело — остальное подождёт.'));p.append(empty)}
    list.slice(0,6).forEach(t=>{
      const row=el('div','ma-task-row'),check=iconButton('check','Завершить: '+t.title,()=>completeTask(t),'ma-task-check'),copy=el('div','ma-task-copy');copy.append(el('b',null,t.title));const meta=el('div','ma-task-meta');
      if(t.prio==='срочная'||t.prio==='важная')meta.append(el('span',t.prio==='срочная'?'ma-priority urgent':'ma-priority',t.prio==='срочная'?'Срочное':'Важное'));
      if(t.due){const overdue=t.due.slice(0,10)<current;meta.append(el('span',overdue?'ma-overdue':'',overdue?'Просрочено · '+dueTxt(t.due):dueTxt(t.due)))}
      if(!meta.childNodes.length)meta.append(el('span',null,'Без срока'));copy.append(meta);
      row.append(check,copy,iconButton('play','Фокус на деле: '+t.title,()=>{S.myFocusTaskId=t.id;persist();reveal('ma-focus');document.getElementById('ma-focus-start')?.focus({preventScroll:true})},'ma-row-focus'));p.append(row);
    });
    if(list.length>6)p.append(button('Ещё '+(list.length-6)+' · Открыть список',()=>go('tasks'),'ma-more-tasks'));
    if(undoTask){const notice=el('div','ma-undo');notice.setAttribute('role','status');notice.append(icon('check'),el('span',null,'Дело выполнено'),button('Отменить',()=>{const t=S.tasks.find(x=>x.id===undoTask.id);if(t){t.done=undoTask.done;if(undoTask.doneAt==null)delete t.doneAt;else t.doneAt=undoTask.doneAt;upd(t)}undoTask=null;render()},'ma-text-button'));p.append(notice)}
    return p;
  }
  function focusPanel(all){
    const focus=el('div','ma-focus');focus.id='ma-focus';const head=el('div','ma-focus-heading');head.append(icon('clock'),el('b',null,'Одна задача за раз'));focus.append(head);
    const label=el('label','ma-focus-label','Задача для фокуса'),select=el('select');select.id='ma-focus-task';select.setAttribute('aria-label','Задача для фокуса');select.append(new Option('Без привязки к делу',''));all.forEach(t=>select.append(new Option(t.title,String(t.id))));select.value=all.some(t=>String(t.id)===String(S.myFocusTaskId))?String(S.myFocusTaskId):'';select.onchange=()=>{S.myFocusTaskId=select.value;save()};label.append(select);focus.append(label);
    const controls=el('div','ma-focus-controls'),clock=el('div','ma-clock');clock.id='ma-clock';clock.setAttribute('role','timer');clock.setAttribute('aria-label','Осталось времени');controls.append(clock);
    const start=button(S.myFocusEnd?'Пауза':S.myFocusRemaining>0&&S.myFocusRemaining<25*60e3?'Продолжить':'Начать фокус',()=>{if(S.myFocusEnd){S.myFocusRemaining=Math.max(0,S.myFocusEnd-Date.now());delete S.myFocusEnd}else{S.myFocusEnd=Date.now()+(S.myFocusRemaining>0?S.myFocusRemaining:25*60e3);delete S.myFocusRemaining}persist()});start.id='ma-focus-start';controls.append(start,iconButton('reset','Сбросить таймер',()=>{delete S.myFocusEnd;delete S.myFocusRemaining;persist()},'ma-focus-reset'));focus.append(controls);return focus;
  }
  function addHabit(name){name=name.trim();if(!name)return;if(habits().some(h=>h.name.toLocaleLowerCase('ru-RU')===name.toLocaleLowerCase('ru-RU'))){toast('Такая привычка уже есть');return}habits().push({id:crypto.randomUUID(),name,log:{}});habitDraft='';persist()}
  function habitPanel(current){
    const hs=habits(),count=hs.filter(h=>h.log?.[current]).length,p=panel('Маленькие ритуалы',el('span','ma-count',count+' / '+hs.length),'ma-habits');p.id='ma-habits';p.append(el('p','ma-section-note','Привычки, которым есть место каждый день.'));
    if(!hs.length){const empty=el('div','ma-habit-empty'),suggestions=el('div','ma-suggestions');empty.append(el('p',null,'Начни с чего-то простого.'));['Прогулка','Читать 10 минут','Вода утром'].forEach(name=>suggestions.append(button('+ '+name,()=>addHabit(name),'ma-suggestion')));empty.append(suggestions);p.append(empty)}
    hs.forEach(h=>{
      const hit=!!h.log?.[current],row=el('div','ma-habit-row'),check=iconButton('check',(hit?'Отменить: ':'Отметить: ')+h.name,()=>{h.log=h.log||{};if(hit)delete h.log[current];else h.log[current]=1;persist()},'ma-habit-check'+(hit?' checked':''));check.setAttribute('aria-pressed',String(hit));
      check.id='ma-habit-'+h.id;const copy=el('div','ma-habit-copy');copy.append(el('b',null,h.name));const week=el('div','ma-habit-week');
      for(let i=6;i>=0;i--){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);const key=ds(d),yes=!!h.log?.[key],dot=el('span',(yes?'hit ':'')+(i===0?'current':''),weekday(d));dot.title=key+(yes?' · выполнено':' · без отметки');dot.setAttribute('aria-label',dot.title);week.append(dot)}copy.append(week);row.append(check,copy);
      const options=el('details','ma-habit-options'),summary=el('summary');summary.append(icon('more'));summary.setAttribute('aria-label','Настройки привычки: '+h.name);options.append(summary,button('Удалить привычку',()=>{if(confirm('Удалить привычку «'+h.name+'» и её историю?')){S.habits=hs.filter(x=>x.id!==h.id);persist()}},'ma-delete-habit'));row.append(options);p.append(row);
    });
    const form=el('form','ma-habit-form'),input=el('input');input.placeholder='Своя привычка';input.maxLength=60;input.required=true;input.value=habitDraft;input.setAttribute('aria-label','Название привычки');input.oninput=()=>{habitDraft=input.value};input.enterKeyHint='done';const add=el('button','ma-habit-add');add.type='submit';add.append(icon('plus'));add.setAttribute('aria-label','Добавить привычку');form.append(input,add);form.onsubmit=e=>{e.preventDefault();addHabit(habitDraft)};p.append(form);return p;
  }
  function money(value){const code=({'€':'EUR','$':'USD','₽':'RUB','₴':'UAH','£':'GBP'})[S.cur]||S.cur||'RUB';try{return new Intl.NumberFormat('ru-RU',{style:'currency',currency:code,maximumFractionDigits:0}).format(value)}catch{return Math.round(value).toLocaleString('ru-RU')+' '+(S.cur||'')}}
  function summaryPanel(current){
    const section=el('div','ma-summary');section.append(el('h2',null,'Всё остальное — рядом'));const grid=el('div','ma-summary-grid');
    function tile(id,title,value,description,cls=''){const b=button('',()=>go(id),'ma-summary-item'),h=el('div','ma-summary-label');h.append(icon(id==='sleep'?'moon':id),el('span',null,title),icon('arrow'));b.append(h,el('strong',cls,value),el('small',null,description));grid.append(b)}
    const spent=S.items.filter(i=>i.date?.startsWith(current.slice(0,7))).reduce((sum,i)=>sum+(Number(i.amount)||0),0);tile('buys','Деньги',money(spent),'Расходы за '+new Date().toLocaleDateString('ru-RU',{month:'long'}));
    const last=(S.sleep||[]).filter(x=>x.date&&sleepDuration(x.bed,x.wake)>0).slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
    if(last){const minutes=sleepDuration(last.bed,last.wake);tile('sleep','Сон',Math.floor(minutes/60)+' ч '+(minutes%60?minutes%60+' мин':''),last.date===current?'Последняя ночь · сегодня':'Запись за '+dmy(last.date))}else tile('sleep','Сон','Как спалось?','Записать прошедшую ночь','ma-no-data');
    const start=new Date();start.setHours(12,0,0,0);start.setDate(start.getDate()-(start.getDay()+6)%7);const monday=ds(start),days=new Set((S.gym||[]).filter(x=>x.date>=monday&&x.date<=current).map(x=>x.date)).size;tile('gym','Движение',days+(days===1?' день':days>1&&days<5?' дня':' дней'),'С тренировками на этой неделе');section.append(grid);return section;
  }
  function healthScreen(){
    const head=el('div','ma-page-heading');head.append(el('p','ma-eyebrow','СВОЙ ТЕМП'),el('h1',null,'Здоровье'),el('p','ma-description','Сон, питание и движение. Всё в одном месте.'));home.append(head);const grid=el('div','ma-health-grid');
    [['sleep','Сон','Длительность, режим и качество'],['food','Питание','Приёмы пищи и дневник питания'],['gym','Тренировки','Журнал подходов и упражнений'],['body','Форма','Вес, замеры и изменения'],['programs','Программа','Твой план тренировок']].forEach(([id,title,desc])=>{const b=button('',()=>go(id),'ma-health-card');b.append(icon(id==='sleep'?'moon':id==='programs'?'tasks':id));const copy=el('div');copy.append(el('h2',null,title),el('p',null,desc));b.append(copy,icon('arrow'));grid.append(b)});home.append(grid);
  }
  function moreScreen(){const head=el('div','ma-page-heading');head.append(el('p','ma-eyebrow','ПОД РУКОЙ'),el('h1',null,'Все разделы'),el('p','ma-description','Детали, инструменты и настройки.'));home.append(head);const grid=el('div','ma-menu-grid');GROUPS.forEach(([name,tabs])=>{const group=el('div','ma-menu-group');group.append(el('h2',null,name.replace(/^[^\p{L}\p{N}]+/u,'')));tabs.forEach(([id,label])=>{const b=button('',()=>go(id),'ma-menu-link');b.append(el('span',null,label),icon('arrow'));group.append(b)});grid.append(group)});home.append(grid)}
  function render(){
    updateNav();if(document.body.dataset.view!=='hub')return;
    const active=document.activeElement,focusId=active?.id,selection=active?.tagName==='INPUT'?[active.selectionStart,active.selectionEnd]:null;home.replaceChildren(topbar());
    if(screen==='health')healthScreen();else if(screen==='more')moreScreen();else{
      const current=today(),done=S.tasks.filter(t=>t.done&&t.doneAt?.slice(0,10)===current).length,remaining=S.tasks.filter(t=>!t.done&&(!t.due||t.due.slice(0,10)<=current)).length;
      const heading=el('div','ma-heading'),title=el('div');title.append(el('p','ma-eyebrow',new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})),el('h1',null,'Сегодня'));
      const progress=el('div','ma-day-progress'),ring=el('span','ma-progress-ring');ring.style.setProperty('--progress',(done+remaining?done/(done+remaining)*100:0)+'%');ring.setAttribute('aria-hidden','true');ring.append(el('span',null,done));const text=el('div');text.append(el('b',null,done+remaining?done+' из '+(done+remaining)+' выполнено':'План пока свободен'),el('span',null,remaining?remaining+(remaining===1?' дело впереди':remaining<5?' дела впереди':' дел впереди'):done?'На сегодня план выполнен':'Твой день — твои приоритеты'));progress.append(ring,text);progress.setAttribute('role','group');progress.setAttribute('aria-label',done+' выполнено, '+remaining+' осталось');heading.append(title,progress);home.append(heading,weekStrip(current));
      const grid=el('div','ma-grid');grid.append(taskPanel(current,done),habitPanel(current),focusPanel(S.tasks.filter(t=>!t.done)));home.append(grid,summaryPanel(current));const footer=el('div','ma-footer');footer.append(el('span',null,'Без спешки. По одному шагу.'),button('Данные и резервная копия',()=>go('data'),'ma-text-button'));home.append(footer);
    }tick();const restore=focusId&&document.getElementById(focusId);if(restore){restore.focus({preventScroll:true});if(selection)restore.setSelectionRange(...selection)}
  }
  function tick(){const c=document.getElementById('ma-clock'),ms=S.myFocusEnd?Math.max(0,S.myFocusEnd-Date.now()):(S.myFocusRemaining??25*60e3);if(S.myFocusEnd&&ms===0){delete S.myFocusEnd;S.myFocusRemaining=0;save();toast('Фокус завершён. Время для перерыва.');render();return}if(c){const seconds=Math.ceil(ms/1000);c.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}}
  function syncChrome(){let meta=document.querySelector('meta[name="theme-color"]');if(!meta){meta=el('meta');meta.name='theme-color';document.head.append(meta)}meta.content=document.documentElement.dataset.theme==='dark'?'#141817':'#f6f5f1'}
  syncChrome();new MutationObserver(syncChrome).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  home.dataset.day=today();setInterval(()=>{tick();if(document.body.dataset.view==='hub'&&screen==='home'&&home.dataset.day!==today()){home.dataset.day=today();render()}},1000);
  new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:['data-view','data-tab']});window.addEventListener('pageshow',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();render()}});
  window.addEventListener('popstate',e=>{screen=['home','health','more'].includes(e.state?.mydayScreen)?e.state.mydayScreen:'home';if(e.state?.v==='tracker'&&GROUPS.some(g=>g[1].some(x=>x[0]===e.state.mydayTab))){tab=e.state.mydayTab;show()}render()});
  try{history.replaceState({...history.state,mydayScreen:'home',mydayTab:tab},'')}catch(e){}render();
})();
