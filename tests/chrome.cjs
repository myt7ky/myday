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
 await page.goto('https://myday.test/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>localStorage.clear());await page.reload();await page.waitForFunction(()=>window.MyDayChrome?.ready);
 assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');assert.equal(await page.locator('html').getAttribute('data-visual'),'chrome');
 const mode=await page.evaluate(()=>window.MyDayChrome.mode);console.log('Chrome renderer: '+mode);
 await page.evaluate(()=>window.__originalChromeCanvas=document.querySelector('.ma-chrome-canvas'));
 await page.getByRole('textbox',{name:'Новое дело',exact:true}).fill('Собрать главное на сегодня');await page.getByRole('button',{name:'Добавить дело',exact:true}).click();await page.getByLabel('Главное дело дня',{exact:true}).selectOption(await page.evaluate(()=>String(S.tasks[0].id)));
 await page.getByRole('button',{name:'+ Прогулка',exact:true}).click();await page.getByRole('button',{name:'Отметить: Прогулка',exact:true}).click();
 await page.locator('.ma-nav [data-page=tasks]').click();await page.locator('.ma-nav [data-page=home]').click();assert(await page.evaluate(()=>window.__originalChromeCanvas===document.querySelector('.ma-chrome-canvas')));
 await page.getByRole('button',{name:'Переключить тему'}).click();await page.getByRole('button',{name:'Переключить тему'}).click();assert(await page.evaluate(()=>window.__originalChromeCanvas===document.querySelector('.ma-chrome-canvas')));
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.documentElement.dataset.motion==='reduced');await page.evaluate(()=>window.MyDayChrome.refresh());
 const first=await page.locator('.ma-chrome-canvas').screenshot();await page.waitForTimeout(150);const second=await page.locator('.ma-chrome-canvas').screenshot();assert(first.equals(second),'Sculpture must remain still with reduced motion');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.documentElement.dataset.motion==='full');
 if(mode==='webgl'){const a=await page.locator('.ma-chrome-canvas').screenshot();await page.waitForTimeout(220);const b=await page.locator('.ma-chrome-canvas').screenshot();assert(!a.equals(b),'Sculpture should move when effects are enabled')}
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:out+'/chrome-desktop.png',fullPage:true,animations:'disabled'});await page.setViewportSize({width:390,height:844});await page.screenshot({path:out+'/chrome-mobile.png',fullPage:true,animations:'disabled'});await page.screenshot({path:out+'/chrome-preview.png',animations:'disabled'});
 if(mode==='webgl'){await page.evaluate(()=>document.querySelector('.ma-chrome-canvas').getContext('webgl').getExtension('WEBGL_lose_context').loseContext());await page.waitForFunction(()=>window.MyDayChrome.mode==='fallback');assert(await page.locator('.ma-chrome-fallback').isVisible());await page.getByRole('button',{name:'Завершить: Собрать главное на сегодня',exact:true}).click();assert(await page.evaluate(()=>S.tasks[0].done));await page.screenshot({path:out+'/chrome-fallback.png',animations:'disabled'})}
 const fallback=await context.newPage();fallback.on('pageerror',e=>errors.push(e.message));await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl')return null;return original.call(this,type,...args)}});await fallback.goto('https://myday.test/');await fallback.waitForFunction(()=>window.MyDayChrome?.ready);assert.equal(await fallback.evaluate(()=>window.MyDayChrome.mode),'fallback');assert(await fallback.locator('.ma-chrome-fallback').isVisible());await fallback.close();assert.deepEqual(errors,[]);
 console.log('PASS: default chrome theme, retained canvas/context through actions/navigation/themes, real sculpture motion, system reduced motion, context-loss fallback, no-WebGL fallback, task actions after GPU loss, no JavaScript errors.');
 }catch(e){await page.screenshot({path:out+'/check-failure.png',fullPage:true,animations:'disabled'});console.error(e);console.error('Browser errors:',errors);process.exitCode=1;}
 await context.close();await fs.rm(profile,{recursive:true,force:true});
})().catch(e=>{console.error(e);process.exitCode=1});
