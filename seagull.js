const gull = document.querySelector('.seagull');
const call = gull.querySelector('.seagull-call');
let callTimeout;
gull.addEventListener('click', () => {
  clearTimeout(callTimeout);
  call.textContent = 'squak';
  callTimeout = setTimeout(() => { call.textContent = ''; }, 1800);
});
