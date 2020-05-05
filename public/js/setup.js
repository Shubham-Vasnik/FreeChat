if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js').then((reg)=>{console.log('serviceWorker registered',reg);}).catch((err)=>{
        console.log("Service Worker Not resgistered",err);
    })
}



let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
//   showInstallPromotion();
});

const getPwa = (e) => {
    e.preventDefault();
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    })
  };