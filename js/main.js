(() => {
  'use strict';

  const frogImg   = document.getElementById('frogImg');
  const nextBtn   = document.getElementById('nextFrogBtn');
  const navLinks  = document.querySelectorAll('.nav-link');
  const views     = document.querySelectorAll('.view');
  const setBtn    = document.getElementById('setNotifyBtn');
  const statusLbl = document.getElementById('notifyStatus');

  const VAPID_PUBLIC_KEY = 'BFZ6rY6PtQjWkmn7IUFGz3v8ReIC4-jaFlgfAzUI7_dwtZEF6cWmO5HBHIMtYwrM3buJubtoWru7tjfLp2h23SY';

  function showView(hash) {
    views.forEach(v => v.classList.add('hidden'));
    const active = document.querySelector(hash);
    if (active) active.classList.remove('hidden');
  }

  window.addEventListener('hashchange', () => showView(location.hash || '#home'));
  navLinks.forEach(link => link.addEventListener('click', () => showView(link.hash)));

  const frogCount = 9;
  const frogUrl = () => `images/zaba${Math.floor(Math.random() * frogCount) + 1}.jpg`;

  function loadFrog() {
    frogImg.src = frogUrl();
  }

  loadFrog();
  nextBtn.addEventListener('click', loadFrog);

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  }

  async function subscribeUser() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      statusLbl.textContent = 'Your browser does not support notifications.';
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      statusLbl.textContent = 'You need to allow notifications.';
      return;
    }

    const reg = await navigator.serviceWorker.ready;

    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      statusLbl.textContent = 'You are already subscribed.';
      return;
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    await fetch('https://canyon-deep-mambo.glitch.me/subscribe', {
      method: 'POST',
      body: JSON.stringify(sub),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    statusLbl.textContent = 'You’ll be notified when a new frog drops!';
  }

  setBtn.addEventListener('click', subscribeUser);

  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.error('SW registration failed:', err));

  showView(location.hash || '#home');
})();