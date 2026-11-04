/* Demo records live in a separate store; personal records are never overwritten. */
(() => {
  const params=new URLSearchParams(location.search);
  if(params.get('demo')==='1')localStorage.setItem('myday-demo-mode','1');
  window.MYDAY_DEMO=localStorage.getItem('myday-demo-mode')==='1';
  window.MyDayDemo={seed(){
    const day=n=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},now=day(0),month=now.slice(0,7),id=Date.now();
    const s={items:[],tasks:[],gym:[],body:[],meals:[],sleep:[],habits:[],tpls:[],goals:[],foodDb:[],recurring:[],budgets:{'Еда и кафе':18000,'Транспорт':6500,'Развлечения':5000,'Подписки':2500,'Дом':12000},cur:'RUB',limit:55000,analysis:{},overall:null,synced:false,prof:{age:29,sex:'м',h:178,act:'1.55',goal:'поддержание',days:'3'},mydayDaily:{},mydayFinance:{months:{[month]:{income:95000}}},mydaySavings:[{id:id+900,title:'Путешествие к морю',target:120000,deadline:day(120),entries:[{id:id+901,date:day(-25),amount:18000,note:'Начало путешествия'},{id:id+902,date:day(-12),amount:12000,note:'Вторая часть'},{id:id+903,date:day(-2),amount:8500,note:'За этот месяц'}]},{id:id+910,title:'Финансовая подушка',target:200000,deadline:'',entries:[{id:id+911,date:day(-20),amount:25000,note:'Первый взнос'},{id:id+912,date:day(-5),amount:15000,note:'Пополнение'}]}]};
    const purchases=[['Продукты на неделю','Еда и кафе',2350],['Кофе и завтрак','Еда и кафе',540],['Метро и автобус','Транспорт',180],['Кино с друзьями','Развлечения',950],['Подписка на музыку','Подписки',299],['Для дома','Дом',1450],['Тренировка','Здоровье и спорт',700]];
    for(let n=0;n<35;n++){
      if(n%5!==3){const p=purchases[n%purchases.length];s.items.push({id:id+n,name:p[0],cat:p[1],amount:p[2]+n*7.5,date:day(-n),why:'Пример для тестирования',feel:'норм'})}
      s.sleep.push({id:id+100+n,date:day(-n),bed:n%3?'23:20':'00:10',wake:n%4?'07:15':'08:00',quality:n%4+2,note:'Тестовая запись'});
      if(n%3===0){['Приседания','Жим лёжа','Тяга в наклоне'].forEach((ex,i)=>s.gym.push({id:id+200+n*3+i,date:day(-n),ex,sets:3,reps:8,w:40+i*10}));s.body.push({id:id+400+n,date:day(-n),w:74+n*.04,waist:82+n*.02})}
      ['Завтрак','Обед','Ужин'].forEach((meal,i)=>s.meals.push({id:id+500+n*3+i,date:day(-n),meal,text:['Овсянка с ягодами и йогуртом','Курица с рисом и овощами','Рыба с салатом'][i],kcal:[420,680,540][i],p:[22,42,35][i],f:18,c:55,score:8,note:'Тестовые значения, не рекомендация',est:false}));
      if(n<14)s.tasks.push({id:id+700+n,title:['Прогуляться после работы','Разобрать почту','Почитать книгу','Закончить небольшой проект'][n%4],done:true,doneAt:day(-n)+'T18:30',plannedFor:day(-n),prio:'обычная',subs:[]});
    }
    s.tasks.push({id:id+800,title:'Собрать идеальный день',plannedFor:now,done:false,prio:'важная',subs:[{t:'Выбрать главное дело',d:true},{t:'Оставить время на отдых',d:false}]},{id:id+801,title:'Купить продукты для ужина',plannedFor:now,done:false,prio:'обычная',subs:[]},{id:id+802,title:'Запланировать выходные',plannedFor:day(1),done:false,prio:'обычная',subs:[]});
    ['Прогулка 30 минут','Читать 15 минут','Вода в течение дня'].forEach((name,i)=>{const log={};for(let n=0;n<21;n++)if((n+i)%4!==2)log[day(-n)]=1;s.habits.push({id:id+850+i,name,log})});
    s.mydayDaily[now]={mainTaskId:id+800,updatedAt:Date.now()};s.mydayDaily[day(-1)]={note:'Хороший спокойный день: сделал главное и оставил время для себя.',reviewedAt:day(-1)+'T21:30',updatedAt:Date.now()};
    s.goals=[{id:id+950,metric:'workouts_week',title:'Три тренировки в неделю',target:3},{id:id+951,metric:'tasks_week',title:'Закрыть пять дел',target:5},{id:id+952,metric:'sleep7_week',title:'Высыпаться пять ночей',target:5}];
    s.tpls=[{id:id+960,name:'Тренировка A',ex:[{ex:'Приседания',sets:3,reps:8,w:40},{ex:'Жим лёжа',sets:3,reps:8,w:50}]}];s.prog={id:'fb',n:2,w:{sq:40,bn:50,row:40,dl:60},rm:{},tm:{},f:{}};s.maxes={sq:60,bn:65,dl:85};
    s.foodDb=[{n:'Йогурт натуральный',k:65,p:5,f:3,c:4,s:8}];s.recurring=[{id:id+970,name:'Музыка',amount:299,cat:'Подписки',day:15}];return s;
  }};
  window.MyDayDemo.seedPhotos=async()=>{
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('myday-demo-photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('p',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
    const records=[];for(let i=0;i<2;i++){const c=document.createElement('canvas');c.width=480;c.height=600;const ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,480,600);g.addColorStop(0,'#555');g.addColorStop(1,'#0b0b0b');ctx.fillStyle=g;ctx.fillRect(0,0,480,600);ctx.strokeStyle='#a7a7a7';ctx.lineWidth=1;for(let x=40;x<480;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,600);ctx.stroke()}for(let y=40;y<600;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(480,y);ctx.stroke()}ctx.fillStyle='#e6e6e4';ctx.font='20px sans-serif';ctx.fillText('MYDAY / DEMO',28,48);ctx.font='16px sans-serif';ctx.fillText('Пример карточки · не фото человека',28,565);ctx.beginPath();ctx.ellipse(240,280,95-i*8,145,Math.PI/7,0,Math.PI*2);ctx.lineWidth=28;ctx.strokeStyle='#b9b9b9';ctx.stroke();ctx.lineWidth=4;ctx.strokeStyle='#fff';ctx.stroke();const blob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.85)),d=new Date();d.setDate(d.getDate()-(i?0:28));const date=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');records.push({id:90001+i,date,angle:'Спереди',w:i?74:75,blob})}
    await new Promise((resolve,reject)=>{const tx=db.transaction('p','readwrite'),store=tx.objectStore('p');store.clear();records.forEach(r=>store.put(r));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();
  };
  if(window.MYDAY_DEMO&&!localStorage.getItem('spend-demo-v1')){localStorage.setItem('spend-demo-v1',JSON.stringify(window.MyDayDemo.seed()));window.MyDayDemo.seedPhotos().catch(()=>{})}
})();
