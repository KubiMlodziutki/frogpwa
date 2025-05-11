(() => {
  'use strict';

  const frogImg = document.getElementById('frogImg');
  const nextBtn = document.getElementById('nextFrogBtn');
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.view');
  const timeInput = document.getElementById('notifyTime');
  const setBtn = document.getElementById('setNotifyBtn');
  const statusLbl  = document.getElementById('notifyStatus');

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

  let loopId = null;

  async function ensurePerm() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;

    const res = await Notification.requestPermission();
    return res === 'granted';
  }

  async function sendNotif() {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      reg.showNotification('Frog time!', {
        body : 'Tap to check whether frogs are okay 🐸',
        icon : 'images/icon-192.png',
        badge : 'images/icon-192.png'
      });
    }
  }

  function startLoop(hour, minute) {
    if (loopId) clearInterval(loopId);

    loopId = setInterval(() => {
      const now = new Date();
      if (now.getHours() === hour && now.getMinutes() === minute) {
        sendNotif();
      }
    }, 60_000);
  }

  async function schedule() {
    const [h, m] = timeInput.value.split(':').map(Number);

    if (isNaN(h) || isNaN(m)) {
      statusLbl.textContent = 'Select time.';
      return;
    }

    const ok = await ensurePerm();
    if (!ok) {
      statusLbl.textContent = 'Allow notifications.';
      return;
    }

    localStorage.setItem('frogNotify', JSON.stringify({ h, m }));
    startLoop(h, m);
    statusLbl.textContent = `Notifaction is on ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  setBtn.addEventListener('click', schedule);

  (() => {
    const saved = JSON.parse(localStorage.getItem('frogNotify') || 'null');

    if (saved) {
      timeInput.value = `${String(saved.h).padStart(2, '0')}:${String(saved.m).padStart(2, '0')}`;
      ensurePerm().then(ok => {
        if (ok) startLoop(saved.h, saved.m);
      });
    }
  })();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('SW OK'))
      .catch(err => console.error('SW error', err));
  }

  showView(location.hash || '#home');
})();