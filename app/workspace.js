/* Shared presentation for the existing trackers. Keeps their fields and handlers. */
(() => {
 'use strict';
 const pages={gym:['Тренировки','Записывай подходы. Журнал и прогресс — на соседних вкладках.','g_ex'],sleep:['Сон','Время сна, качество и история ночей.','sl_bed'],food:['Питание','Записывай приёмы пищи и смотри итоги дня.','m_text'],body:['Форма','Вес и замеры в одном журнале.','b_w'],goals:['Цели','Понятные ориентиры и прогресс по твоим записям.','goalTitle'],guides:['Техника упражнений','Подготовка, движение и проверка техники.','gd_q'],strength:['Рабочие веса','Расчёты, программа и инструменты тренировки.'],programs:['Программа','План тренировок и упражнения.'],photos:['Фото-прогресс','Изменения, которые удобно сравнивать.'],data:['Данные и настройки','Резервные копии, перенос данных и настройки.'],analytics:['Статистика','История и наблюдения по твоим записям.']};
 const health=new Set(['gym','sleep','food','body','guides','strength','programs']);
 let scheduled=false;
 function refresh(){
  if(document.body.dataset.view!=='tracker')return;
  document.body.classList.add('mw-workspace');
  const id=document.body.dataset.tab,config=pages[id],section=document.getElementById('t-'+id);if(!section)return;
  const search=document.getElementById('searchLaunch');if(search)search.setAttribute('aria-label','Поиск по приложению');
  const title=document.getElementById('pageTitle');if(config&&title&&title.textContent!==config[0])title.textContent=config[0];
  const shell=document.querySelector('.page-title');if(shell){let back=shell.querySelector('.mw-back');if(!back){back=document.createElement('button');back.type='button';back.className='mw-back';shell.prepend(back)}const label=health.has(id)?'Здоровье':'Ещё';if(back.textContent!=='← '+label)back.textContent='← '+label;back.setAttribute('aria-label','Назад: '+label);back.onclick=()=>document.querySelector('.ma-nav [data-page='+ (health.has(id)?'health':'more') +']')?.click();let caption=shell.querySelector('.mw-description');if(!caption){caption=document.createElement('p');caption.className='mw-description';shell.append(caption)}const text=config?.[1]||'Записи, история и настройки.';if(caption.textContent!==text)caption.textContent=text}
  if(id==='gym')window.MyDayWorkout?.mountLegacy(section);
  const tools=document.getElementById('gymToolsQuick');if(id==='gym'&&tools&&section.lastElementChild!==tools)section.append(tools);
  if(config?.[2]){const field=document.getElementById(config[2]),card=field?.closest('.card');if(card&&!card.dataset.mwPrimary){card.dataset.mwPrimary='1';card.dataset.f='1';card.classList.add('mw-primary');card.classList.remove('fc');const h=card.querySelector(':scope>h2');if(h){h.classList.remove('fh');h.querySelector('.fch')?.remove();h.addEventListener('click',e=>e.stopImmediatePropagation(),true)}}}
  section.querySelectorAll('.mini').forEach(group=>{group.setAttribute('role','group');group.setAttribute('aria-label',(config?.[0]||'Раздел')+': представление');group.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('on'))))});
  section.querySelectorAll('.card.fc').forEach(c=>c.classList.remove('fc'));

 }
 function queue(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refresh()})}
 const original=show;show=function(...args){const result=original.apply(this,args);refresh();return result};
 document.querySelector('main')?.addEventListener('click',queue);
 new MutationObserver(queue).observe(document.querySelector('main'),{childList:true,subtree:true});
 window.MyDayWorkspace={refresh};refresh();
})();
