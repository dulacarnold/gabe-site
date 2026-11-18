// Switch between public results without changing the chart frame's height.
(() => {
  const controls = document.querySelector('.chart-controls');
  if (!controls) return;
  const buttons = [...controls.querySelectorAll('button[data-chart]')];
  controls.hidden = false;
  for (const button of buttons) {
    button.addEventListener('click', () => {
      for (const option of buttons) {
        const selected = option === button;
        option.setAttribute('aria-pressed', String(selected));
        document.getElementById(option.dataset.chart).hidden = !selected;
      }
    });
  }
})();
