// Sort native DOM letters into place, retaining an accessible full-name label.
(() => {
  const text = document.querySelector('.name-text');
  const name = text.textContent;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const link = text.closest('a');
  link.setAttribute('aria-label', name);
  text.setAttribute('aria-hidden', 'true');
  const letters = Array.from(name, (character, index) => {
    const node = document.createElement('span');
    node.className = 'name-letter';
    node.textContent = character === ' ' ? '\u00a0' : character;
    return { node, index, character };
  });
  const speed = 2.6;
  let order = [...letters];
  let timer;
  let animations = [];
  const slots = letters.flatMap((letter, index) => /[a-z]/i.test(letter.character) ? [index] : []);
  text.replaceChildren(...letters.map(letter => letter.node));

  function arrange(next, animate) {
    animations.forEach(animation => animation.cancel());
    animations = [];
    const before = new Map(order.map(letter => [letter, letter.node.getBoundingClientRect().left]));
    order = next;
    text.replaceChildren(...order.map(letter => letter.node));
    if (!animate) return;
    const ink = getComputedStyle(text).color;
    order.forEach(letter => {
      const distance = before.get(letter) - letter.node.getBoundingClientRect().left;
      if (Math.abs(distance) < 0.1) return;
      animations.push(letter.node.animate([
        { transform: `translateX(${distance}px)`, color: '#ffb35c' },
        { transform: 'translateX(0)', color: ink },
      ], { duration: 150 / speed, easing: 'cubic-bezier(.2,.7,.3,1)' }));
    });
  }
  function schedule() {
    if (!motion.matches && !document.hidden) timer = setTimeout(() => play(false), 16000);
  }
  function stop() {
    clearTimeout(timer);
    arrange([...letters], false);
  }
  function play(initial) {
    if (motion.matches || document.hidden) return;
    clearTimeout(timer);
    const shuffled = [...letters];
    let permutation;
    // Mix the entire name, leaving only the space and hyphen anchored.
    // Reject near-sorted permutations so every letter travels appreciably.
    for (let attempt = 0; attempt < 100; attempt++) {
      permutation = [...slots];
      for (let i = permutation.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
      }
      const travel = permutation.reduce((sum, value, i) => sum + Math.abs(value - slots[i]), 0);
      if (permutation.every((value, i) => value !== slots[i]) && travel / slots.length >= letters.length / 3) break;
      permutation = null;
    }
    // Deterministic fallback also moves every letter across a substantial distance.
    if (!permutation) permutation = slots.map((_, i) => slots[(i + Math.floor(slots.length / 2)) % slots.length]);
    slots.forEach((slot, i) => { shuffled[slot] = letters[permutation[i]]; });
    arrange(shuffled, !initial);
    let pass = 0;
    function sortStep() {
      if (motion.matches || document.hidden) { stop(); return; }
      const next = [...order];
      // Odd-even transposition: independent adjacent pairs sort in parallel.
      for (let i = pass % 2; i < slots.length - 1; i += 2) {
        const a = slots[i], b = slots[i + 1];
        if (next[a].index > next[b].index) [next[a], next[b]] = [next[b], next[a]];
      }
      arrange(next, true);
      pass++;
      if (order.every((letter, index) => letter.index === index)) {
        timer = setTimeout(() => { arrange([...letters], false); schedule(); }, 180 / speed);
      } else timer = setTimeout(sortStep, 180 / speed);
    }
    timer = setTimeout(sortStep, 300 / speed);
  }
  document.addEventListener('visibilitychange', () => { stop(); schedule(); });
  motion.addEventListener('change', () => { stop(); schedule(); });
  link.addEventListener('click', event => {
    event.preventDefault();
    play(false);
  });
  play(true);
})();
