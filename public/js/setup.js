if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js').then((reg)=>{console.log('serviceWorker registered',reg);}).catch((err)=>{
        console.log("Service Worker Not resgistered",err);
    })
}

// const buttonInstall = document.getElementById("#install-btn");

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
//   showInstallPromotion();
});

const getPwa = (e) => {
    e.preventDefault();
    // Hide the app provided install promotion
    // hideMyInstallPromotion();
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    })
  };