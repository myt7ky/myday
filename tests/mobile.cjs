const {chromium}=require(process.env.MYDAY_PLAYWRIGHT_PATH || 'playwright');
const fs=require('node:fs/promises'),assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..');
(async()=>{
 const profileRoot=process.env.MYDAY_QA_PROFILE_ROOT || os.tmpdir();await fs.mkdir(profileRoot,{recursive:true});
 const profile=await fs.mkdtemp(path.join(profileRoot,'myday-browser-'));
 const context=await chromium.launchPersistentContext(profile,{executablePath:process.env.MYDAY_BROWSER_PATH || undefined,headless:true,viewport:{width:390,height:844},serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];page.setDefaultTimeout(7000);page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',async route=>{
  if(new URL(route.request().url()).hostname!=='myday.test')return route.fulfill({status:200,body:''});
  const p=new URL(route.request().url()).pathname;
  try{await route.fulfill({status:200,contentType:p.endsWith('.svg')?'image/svg+xml':p.endsWith('.css')?'text/css':p.endsWith('.js')?'application/javascript':p.endsWith('.html')||p==='/'?'text/html; charset=utf-8':'application/octet-stream',body:await fs.readFile(root+(p==='/'?'/index.html':p))});}catch{await route.fulfill({status:404,body:''});}
 });
 const out=process.env.MYDAY_QA_OUTPUT || await fs.mkdtemp(path.join(os.tmpdir(),'myday-previews-'));console.log('Screenshots: '+out);await fs.mkdir(out,{recursive:true});
 try{
 await page.goto('https://myday.test/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>localStorage.clear());await page.reload();await page.locator('.ma-tasks').waitFor();
 assert((await page.locator('#ma-task-title').boundingBox()).y<500);assert.equal(await page.locator('.ma-hero').count(),0);
 await page.screenshot({path:out+'/empty-mobile.png',fullPage:true,animations:'disabled'});
 await page.getByRole('textbox',{name:'Новое дело',exact:true}).fill('   ');await page.getByRole('button',{name:'Добавить дело',exact:true}).click();assert.equal(await page.evaluate(()=>S.tasks.length),0);
 await page.getByRole('textbox',{name:'Новое дело',exact:true}).fill('Подготовить план на неделю');await page.getByRole('textbox',{name:'Новое дело',exact:true}).press('Enter');
 await page.getByRole('button',{name:'Фокус на деле: Подготовить план на неделю'}).click();assert.equal(await page.locator('#ma-focus-task').inputValue(),String(await page.evaluate(()=>S.tasks[0].id)));
 await page.getByRole('button',{name:'Начать фокус',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Пауза',exact:true}).waitFor();assert.equal(await page.locator('#ma-focus-task').inputValue(),String(await page.evaluate(()=>S.tasks[0].id)));
 await page.getByRole('button',{name:'Пауза',exact:true}).click();await page.getByRole('button',{name:'Продолжить',exact:true}).waitFor();await page.getByRole('button',{name:'Сбросить таймер'}).click();assert.equal(await page.locator('#ma-clock').innerText(),'25:00');
 await page.getByRole('button',{name:'Завершить: Подготовить план на неделю'}).click();assert(await page.evaluate(()=>S.tasks[0].done));await page.getByRole('button',{name:'Отменить',exact:true}).click();assert.equal(await page.evaluate(()=>S.tasks[0].done),false);
 await page.getByRole('textbox',{name:'Новое дело',exact:true}).fill('Не потерять черновик');await page.getByRole('button',{name:'Переключить тему'}).click();assert.equal(await page.getByRole('textbox',{name:'Новое дело',exact:true}).inputValue(),'Не потерять черновик');await page.getByRole('textbox',{name:'Новое дело',exact:true}).fill('');
 await page.getByRole('button',{name:'+ Прогулка',exact:true}).click();await page.getByRole('button',{name:'Отметить: Прогулка',exact:true}).click();await page.keyboard.press('Space');assert.equal(await page.getByRole('button',{name:'Отметить: Прогулка',exact:true}).count(),1);await page.getByRole('button',{name:'Отметить: Прогулка',exact:true}).click();
 await page.getByRole('textbox',{name:'Название привычки'}).fill('Прогулка');await page.getByRole('button',{name:'Добавить привычку',exact:true}).click();assert.equal(await page.evaluate(()=>S.habits.length),1);
 await page.getByRole('textbox',{name:'Название привычки'}).fill('Читать 10 минут');await page.getByRole('button',{name:'Добавить привычку',exact:true}).click();
 await page.evaluate(()=>{const current=today(),future=new Date();future.setDate(future.getDate()+2);S.tasks[0].prio='важная';S.tasks.push({id:Date.now()+1,title:'Купить продукты к ужину',due:current+'T19:00',prio:'обычная',done:false},{id:Date.now()+2,title:'Дело на будущее',due:ds(future)+'T10:00',prio:'обычная',done:false});save()});await page.reload();await page.locator('.ma-task-row').first().waitFor();assert.equal(await page.locator('.ma-task-row').count(),2);await page.locator('.ma-filters button').nth(1).click();assert.equal(await page.locator('.ma-task-row').count(),3);
 await page.locator('.ma-nav [data-page=health]').click();await page.locator('.ma-health-card').filter({hasText:'Сон'}).click();assert.equal(await page.locator('body').getAttribute('data-tab'),'sleep');await page.goBack();await page.getByRole('heading',{name:'Здоровье',exact:true}).waitFor();await page.goBack();await page.getByRole('heading',{name:'Сегодня',exact:true}).waitFor();
 await page.getByRole('button',{name:'Поиск по приложению',exact:true}).click();assert(await page.locator('#searchOverlay').isVisible());await page.keyboard.press('Escape');assert(!(await page.locator('#searchOverlay').isVisible()));
 await page.locator('.ma-nav [data-page=more]').click();const sections=await page.locator('.ma-menu-link[data-tab]').evaluateAll(nodes=>nodes.map(n=>n.dataset.tab));
 assert.equal(await page.locator('.ma-menu-link').filter({hasText:/RPG|Прогноз|Мне лень|Колесо/}).count(),0);
 for(const id of sections){await page.locator('.ma-nav [data-page=more]').click();await page.locator('.ma-menu-link[data-tab='+id+']').click();assert.equal(await page.locator('body').getAttribute('data-tab'),id);await page.locator('#t-'+id).waitFor({state:'visible'})};
 console.log('PASS: quick entry, whitespace, undo, focus association/pause/reset/reload, keyboard habits, duplicate prevention, drafts, filters, search, browser back, '+sections.length+' existing sections.');
 await page.locator('.ma-nav [data-page=home]').click();
 for(const currency of ['RON','€','$','₽','₴','£','RUB']){await page.evaluate(cur=>{S.cur=cur;save()},currency);await page.reload();await page.locator('.ma-summary').waitFor()}
 await page.evaluate(()=>{S.cur='₽';const current=today();S.items=[{id:1,name:'Продукты',amount:1840,date:current,cat:'Продукты'},{id:2,name:'Кофе',amount:320,date:current,cat:'Еда'}];S.sleep=[{id:3,date:current,bed:'23:30',wake:'07:10',quality:4,note:''}];S.gym=[{id:4,date:current,ex:'Приседания',sets:3,reps:10,weight:30}];save()});await page.reload();await page.locator('.ma-summary').waitFor();
 for(const width of [320,360,390,430,768,1024,1440]){
  await page.setViewportSize({width,height:844});
  for(const id of ['tasks','buys','health','more','home']){await page.locator('.ma-nav [data-page='+id+']').click();assert.equal(await page.locator('.ma-nav [aria-current=page]').count(),1);assert.equal(await page.locator('.ma-nav [data-page='+id+']').getAttribute('aria-current'),'page');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+width+' '+id)}
  console.log('PASS: '+width+'px layout and navigation');
 }
 await page.setViewportSize({width:320,height:844});await page.getByRole('textbox',{name:'Новое дело',exact:true}).fill('Очень длинное название задачи '.repeat(3));await page.getByRole('textbox',{name:'Новое дело',exact:true}).press('Enter');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.evaluate(()=>{S.tasks=S.tasks.filter(t=>!t.title.startsWith('Очень длинное'));save()});await page.reload();
 await page.setViewportSize({width:390,height:844});
 for(const theme of ['light','dark']){if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:'Переключить тему'}).click();await page.screenshot({path:out+'/redesign-'+theme+'.png',fullPage:true,animations:'disabled'});await page.screenshot({path:out+'/preview-'+theme+'.png',animations:'disabled'});}
 await page.setViewportSize({width:1440,height:1000});if(await page.locator('html').getAttribute('data-theme')!=='light')await page.getByRole('button',{name:'Переключить тему'}).click();await page.screenshot({path:out+'/redesign-desktop.png',fullPage:true,animations:'disabled'});
 await page.locator('.ma-nav [data-page=health]').click();await page.screenshot({path:out+'/health-desktop.png',fullPage:true,animations:'disabled'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:out+'/health-mobile.png',fullPage:true,animations:'disabled'});
 for(const id of ['tasks','buys']){await page.locator('.ma-nav [data-page='+id+']').click();await page.screenshot({path:out+'/tracker-'+id+'.png',fullPage:true,animations:'disabled'})}
 assert.deepEqual(errors,[]);console.log('PASS: currencies, long titles, both themes, no JavaScript errors. Service worker and remote APIs not covered.');
 }catch(e){await page.screenshot({path:out+'/check-failure.png',fullPage:true,animations:'disabled'});console.error(e);console.error('Browser errors:',errors);process.exitCode=1;}
 await context.close();await fs.rm(profile,{recursive:true,force:true});
})().catch(e=>{console.error(e);process.exitCode=1});
