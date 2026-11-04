/* Installation help and standalone status. */
(()=>{'use strict';let ui,prompt=window.MyDayInstallPrompt||null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e});addEventListener('appinstalled',()=>{prompt=null;window.MyDayInstallPrompt=null});
 function open(){const d=ui.makeDialog('MyDay на телефоне'),box=ui.el('div','mn-install');const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
 box.append(ui.el('p','mr-muted',standalone?'MyDay уже открыт как приложение.':'Установи MyDay на главный экран, чтобы быстро записывать идеи без вкладок браузера.'));
 if(prompt){const install=ui.button('Установить MyDay',async()=>{const current=prompt;prompt=null;await current.prompt();const choice=await current.userChoice;if(choice.outcome==='accepted')d.close();else install.textContent='Установку можно повторить через меню браузера'},'ma-button');box.append(install)}
 else{box.append(ui.el('h3',null,'iPhone / iPad'),ui.el('p','mr-muted','Открой MyDay в Safari → «Поделиться» → «На экран Домой».'),ui.el('h3',null,'Android'),ui.el('p','mr-muted','Открой MyDay в Chrome → меню ⋮ → «Установить приложение» или «Добавить на главный экран».'))}
 const local=location.hostname==='localhost'||location.hostname==='127.0.0.1',https=location.protocol==='https:';
 box.append(ui.el('p','mr-muted',https||local?'Открой приложение один раз с сетью и дождись загрузки. После этого заметки работают без интернета; изменения отправятся при следующем открытии с сетью и подключённой синхронизацией.':'Для установки и работы без сети на телефоне нужен HTTPS-адрес. Ссылка домашней сети по HTTP подходит для просмотра, но не для установки.'));
 box.append(ui.el('p','mr-muted','Если приложение закрыто, отправка не выполняется. Записи остаются в браузере до следующего запуска.'));d.append(box);d.showModal()}
 window.MyDayInstall={open,configure(value){ui=value}};
})();
