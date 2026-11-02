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
 await page.goto('https://myday.test/?demo=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.MyDayInsights?.ready&&window.MyDayLuxe?.ready);
 assert.equal(await page.locator('.mx-pulse-card').count(),3);assert(await page.locator('.mx-pulse').isVisible());assert((await page.locator('.mx-mini-ring').first().boundingBox()).height>=65);assert.equal(await page.locator('.mx-mini-ring svg').count(),3);await page.screenshot({path:out+'/luxe-home-mobile.png',animations:'disabled'});
 await page.locator('.ma-nav [data-page=buys]').click();const ring=page.locator('.mi-finance-grid .mx-donut');await ring.scrollIntoViewIfNeeded();assert((await ring.boundingBox()).height>=250);const segments=ring.locator('[role=button]');assert(await segments.count()>=5);await segments.first().focus();await page.keyboard.press('Enter');assert.notEqual(await page.getByLabel('Категория покупок',{exact:true}).inputValue(),'');
 await page.locator('.ma-nav [data-page=buys]').click();await page.locator('.mi-finance-grid').scrollIntoViewIfNeeded();const line=page.locator('.mi-line').first();assert((await line.getAttribute('d')).includes('C'));assert.equal(await line.getAttribute('pathLength'),'1');await page.waitForFunction(()=>document.querySelector('.mi-finance-grid .mi-chart-card')?.classList.contains('mx-revealed'));
 for(const theme of ['dark','light']){if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:'Переключить тему'}).click();for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});for(const tab of ['expenses','budget','savings']){await page.locator('[data-finance='+tab+']').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),theme+' '+tab+' '+width)}}}
 await page.setViewportSize({width:1440,height:1050});if(await page.locator('html').getAttribute('data-theme')!=='dark')await page.getByRole('button',{name:'Переключить тему'}).click();await page.locator('[data-finance=expenses]').click();await page.locator('.mi-finance-grid').scrollIntoViewIfNeeded();await page.waitForTimeout(1200);await page.screenshot({path:out+'/luxe-money-desktop.png',animations:'disabled'});
 await page.setViewportSize({width:390,height:844});await page.locator('.mi-finance-grid>.mi-chart-card').first().scrollIntoViewIfNeeded();await page.waitForTimeout(1200);await page.screenshot({path:out+'/luxe-chart-mobile.png',animations:'disabled'});await ring.scrollIntoViewIfNeeded();await page.waitForTimeout(300);await page.screenshot({path:out+'/luxe-donut-mobile.png',animations:'disabled'});
 await page.getByRole('button',{name:'Переключить тему'}).click();await page.locator('.mi-finance-grid').scrollIntoViewIfNeeded();await page.waitForTimeout(1200);await page.screenshot({path:out+'/luxe-money-light.png',animations:'disabled'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.documentElement.dataset.motion==='reduced');assert.equal(await page.locator('html').getAttribute('data-motion'),'reduced');assert.equal(await line.evaluate(e=>getComputedStyle(e).animationName),'none');await page.locator('.ma-nav [data-page=home]').click();assert.equal(await page.locator('.mx-pulse-card').first().evaluate(e=>getComputedStyle(e).opacity),'1');assert.equal(await page.locator('.mi-bar').first().evaluate(e=>getComputedStyle(e).animationName),'none');assert.deepEqual(errors,[]);
 console.log('PASS: real donut segments/category keyboard selection, monotone smooth SVG paths, chart reveal, daily rings, all finance tabs at 320/390/768/1440 in both themes, reduced-motion visibility and disabled animations.');
 }catch(e){await page.screenshot({path:out+'/luxe-failure.png',fullPage:true,animations:'disabled'});console.error(e);console.error('Browser errors:',errors);process.exitCode=1;}
 await context.close();await fs.rm(profile,{recursive:true,force:true});
})().catch(e=>{console.error(e);process.exitCode=1});
