const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'); process.env.PORT='4174'; require('./preview.cjs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4174');
 await page.locator('.ma-hero').waitFor();
 await page.getByRole('textbox',{name:'Название привычки'}).fill('Читать 10 минут');
 await page.getByRole('button',{name:'Добавить привычку',exact:true}).click();
 await page.getByRole('button',{name:'Отметить: Читать 10 минут',exact:true}).click();
 await page.getByRole('button',{name:'Начать фокус',exact:true}).click();
 await page.reload();await page.locator('.ma-hero').waitFor();
 assert.equal(await page.getByRole('button',{name:'Отменить: Читать 10 минут'}).count(),1);
 assert.equal(await page.getByRole('button',{name:'Пауза',exact:true}).count(),1);
 await page.getByRole('button',{name:'Пауза',exact:true}).click();
 await page.locator('.ma-nav [data-page=tasks]').click();
 await page.locator('#t_title').fill('Проверить новый MyApp');
 await page.locator('#tAdd').click();
 await page.locator('.ma-nav [data-page=home]').click();
 await page.getByRole('button',{name:'Завершить: Проверить новый MyApp'}).click();
 for(const id of ['buys','gym','data','home']){await page.locator(`.ma-nav [data-page=${id}]`).click();assert(await page.locator('.ma-nav').isVisible())}
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});
 await page.screenshot({path:'desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Переключить тему'}).click();
 await page.screenshot({path:'light.png',fullPage:true});
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await context.setOffline(true);await page.reload();await page.locator('.ma-hero').waitFor();
 assert.equal(await page.getByRole('button',{name:'Отменить: Читать 10 минут'}).count(),1);
 assert.deepEqual(errors,[]);
 console.log('PASS: habit, persistence, timer, task completion, navigation, 390px layout, themes, offline reload. No browser errors.');
 await browser.close();process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});

