/* MyApp: focused dashboard. Uses the existing data store and backup format. */
(() => {
  'use strict';
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = './app/redesign.css'; document.head.append(link);
  document.title = 'MyDay — твой день'; document.querySelector('.brand h1').textContent='MyDay';
  const home = el('div', 'ma-home'); home.id = 'ma-home'; document.body.append(home);
  const nav = el('nav', 'ma-nav'); nav.setAttribute('aria-label', 'Основная навигация'); document.body.append(nav);
  const paths = {home:'m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',tasks:'m9 6 2 2 4-4M9 16l2 2 4-4M3 7h1M3 17h1M18 7h3M18 17h3',buys:'M3 6h18v14H3ZM3 10h18M15 15h3M6 6V3h12v3',gym:'M6 4v16M3 8v8M6 12h12M18 4v16M21 8v8',data:'M4 6h16M4 12h16M4 18h16'};
  const icon = id => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[id]+'"/></svg>';
  const go = id => { if (id === 'home') window.setView('hub'); else {window.setView('tracker'); tab=id; show();} window.scrollTo({top:0,behavior:'instant'}); render(); };
  [['home','Обзор'],['tasks','Дела'],['buys','Деньги'],['gym','Зал'],['data','Ещё']].forEach(([id,name])=>{
    const b=el('button'); b.innerHTML=`<span aria-hidden="true">${icon(id)}</span>${name}`;
    b.onclick=()=>go(id); b.dataset.page=id; nav.append(b);
  });
  const button=(label,fn,cls='ma-button')=>{const b=el('button',cls,label);b.type='button';b.onclick=fn;return b};
  const card=(title,action)=>{const c=el('div','ma-card'),h=el('div','ma-card-head');h.append(el('h2',null,title));if(action)h.append(action);c.append(h);return c};
  const habits=()=>{if(!Array.isArray(S.habits))S.habits=[];return S.habits};
  const persist=()=>{save();render()};
  function render(){
    nav.querySelectorAll('button').forEach(b=>{const active=b.dataset.page===(document.body.dataset.view==='hub'?'home':tab); b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false')});
    if(document.body.dataset.view!=='hub')return;
    home.replaceChildren();
    const top=el('div','ma-top');top.append(el('b','ma-brand','myday'),el('span','ma-date',new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})));
    top.append(button(document.documentElement.dataset.theme==='dark'?'☀':'☾',()=>{const v=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=v;localStorage.setItem('myday-theme',v);render()},'ma-theme'));
    top.lastChild.setAttribute('aria-label','Переключить тему');home.append(top);
    const hero=el('div','ma-hero'),copy=el('div','ma-copy');copy.append(el('div','ma-eyebrow',S.name?'ТВОЙ ДЕНЬ, '+S.name.toUpperCase():'МЕНЬШЕ ШУМА. БОЛЬШЕ ДЕЛА.'));
    const heading=el('h1');heading.innerHTML='Сегодня —<br><em>в твоём ритме.</em>';copy.append(heading,el('p',null,'Главное на день. Без лишней суеты.'));
    copy.append(button('+ Добавить дело',()=>{document.getElementById('ma-task-title').focus()}));hero.append(copy);const art=el('img','ma-art');art.src='./assets/hero.webp';art.alt='';art.setAttribute('aria-hidden','true');hero.append(art);home.append(hero);
    const current=today(),month=current.slice(0,7),open=S.tasks.filter(t=>!t.done),due=open.filter(t=>!t.due||t.due.slice(0,10)<=current),done=S.tasks.filter(t=>t.done&&t.doneAt?.slice(0,10)===current).length;
    const spent=S.items.filter(i=>i.date?.startsWith(month)).reduce((n,i)=>n+(Number(i.amount)||0),0),hs=habits(),hc=hs.filter(h=>!!h.log?.[current]).length;
    const stats=el('div','ma-stats');[[String(due.length),'Дел в фокусе','tasks'],[fmt(spent),'Расходы за месяц','buys'],[`${hc} / ${hs.length}`,'Привычки сегодня',null],[String(done),'Дел завершено сегодня','tasks']].forEach(([value,label,id])=>{const c=button('',()=>id?go(id):document.getElementById('ma-habits').scrollIntoView({behavior:'smooth'}),'ma-stat');c.append(el('span',null,label),el('strong',null,value));stats.append(c)});home.append(stats);
    const grid=el('div','ma-grid'),left=el('div'),right=el('div');grid.append(left,right);home.append(grid);
    const tasks=card('Главное сегодня',button('Все дела ↗',()=>go('tasks'),'ma-link'));
    const quickTask=el('form','ma-task-form'),taskInput=el('input');taskInput.id='ma-task-title';taskInput.placeholder='Что нужно сделать?';taskInput.maxLength=100;taskInput.required=true;taskInput.setAttribute('aria-label','Новое дело');const taskSubmit=el('button','ma-button','+');taskSubmit.type='submit';taskSubmit.setAttribute('aria-label','Добавить дело');quickTask.append(taskInput,taskSubmit);quickTask.onsubmit=e=>{e.preventDefault();const title=taskInput.value.trim();if(!title)return;const t={id:Date.now(),done:false,title,due:'',prio:'обычная',tag:''};S.tasks.push(t);upd(t);render();toast('Дело добавлено');assessTask(t);document.getElementById('ma-task-title')?.focus()};tasks.append(quickTask);
    if(!due.length)tasks.append(el('p','ma-empty','Здесь спокойно. Добавь дело или выбери время для себя.'));
    due.sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')).slice(0,5).forEach(t=>{
      const row=el('div','ma-item'),check=button('',()=>{});check.onclick=()=>{t.done=true;t.doneAt=nowLocal(0);upd(t);render()};check.className='ma-check';check.setAttribute('aria-label','Завершить: '+t.title);
      const text=el('div');text.append(el('b',null,t.title),el('small',null,t.due?(t.due.slice(0,10)<current?'Просрочено · ':'')+dueTxt(t.due):'Без срока'));row.append(check,text);tasks.append(row);
    });left.append(tasks);
    const habitCard=card('Привычки',el('span','ma-tag','КАЖДЫЙ ДЕНЬ'));habitCard.id='ma-habits';
    if(!hs.length)habitCard.append(el('p','ma-empty','Читать, гулять или пить воду — выбери свой первый маленький шаг.'));
    hs.forEach(h=>{const row=el('div','ma-item'),hit=!!h.log?.[current];
      row.append(button(hit?'✓':'',()=>{h.log=h.log||{};if(hit)delete h.log[current];else h.log[current]=1;persist()},'ma-check'+(hit?' checked':'')));
      row.firstChild.setAttribute('aria-label',(hit?'Отменить: ':'Отметить: ')+h.name);row.firstChild.setAttribute('aria-pressed',String(hit));
      const info=el('div');info.append(el('b',null,h.name));const days=el('div','ma-week');let count=0;for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=ds(d),yes=!!h.log?.[key];if(yes)count++;const dot=el('span',yes?'hit':'',d.toLocaleDateString('ru-RU',{weekday:'short'}));dot.title=key;days.append(dot)}info.append(days);row.append(info);
      const del=button('×',()=>{if(confirm('Удалить привычку «'+h.name+'» и её историю?')){S.habits=hs.filter(x=>x.id!==h.id);persist()}},'ma-link');del.setAttribute('aria-label','Удалить привычку '+h.name);row.append(del);habitCard.append(row);
    });
    const form=el('form','ma-inline'),input=el('input');input.placeholder='Новая привычка';input.maxLength=60;input.required=true;input.setAttribute('aria-label','Название привычки');const add=el('button','ma-button','+');add.type='submit';add.setAttribute('aria-label','Добавить привычку');form.append(input,add);form.onsubmit=e=>{e.preventDefault();const name=input.value.trim();if(!name)return;if(hs.some(h=>h.name.toLowerCase()===name.toLowerCase())){toast('Такая привычка уже есть');return}hs.push({id:crypto.randomUUID(),name,log:{}});persist()};habitCard.append(form);left.append(habitCard);
    const focus=card('Время для важного',el('span','ma-tag','ФОКУС'));focus.append(el('p','ma-empty','25 минут на одну задачу. Остальное подождёт.'));
    const clock=el('div','ma-clock');clock.id='ma-clock';focus.append(clock);const controls=el('div','ma-inline');
    controls.append(button(S.myFocusEnd?'Пауза':'Начать фокус',()=>{if(S.myFocusEnd){S.myFocusRemaining=Math.max(0,S.myFocusEnd-Date.now());delete S.myFocusEnd}else{S.myFocusEnd=Date.now()+(S.myFocusRemaining||25*60e3);delete S.myFocusRemaining}persist()}),button('Сбросить',()=>{delete S.myFocusEnd;delete S.myFocusRemaining;persist()},'ma-link'));focus.append(controls);right.append(focus);
    const quick=card('Забота о себе');[['food','Питание','Дневник и продукты'],['sleep','Сон','Восстановление и режим'],['body','Форма','Вес и динамика'],['programs','Тренировки','Программа на следующий шаг']].forEach(([id,title,desc])=>{const b=button('',()=>go(id),'ma-shortcut');const text=el('div');text.append(el('b',null,title),el('small',null,desc));b.append(text,el('span',null,'↗'));quick.append(b)});right.append(quick);
    const footer=el('div','ma-footer');footer.append(el('span',null,'Твой ритм. Твой прогресс.'),button('Резервная копия и настройки ↗',()=>go('data'),'ma-link'));home.append(footer);tick();
  }
  function tick(){const c=document.getElementById('ma-clock');let ms=S.myFocusEnd?Math.max(0,S.myFocusEnd-Date.now()):(S.myFocusRemaining??25*60e3);if(S.myFocusEnd&&ms===0){delete S.myFocusEnd;S.myFocusRemaining=0;save();toast('Фокус завершён. Сделай небольшой перерыв.');render();return}if(c){const sec=Math.ceil(ms/1000);c.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}}
  setInterval(tick,1000);
  new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:['data-view','data-tab']});
  window.addEventListener('pageshow',render);
  window.addEventListener('focus',()=>{tick();render()});
  render();
})();
