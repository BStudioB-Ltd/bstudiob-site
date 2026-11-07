(() => {
  const images = [
    {src:'assets/earquity/listener-demo.jpg', alt:'Screenshot of the Earquity local demo home screen', title:'A home for discovery.', description:'A welcoming place to find emerging music and see what makes Earquity different.', caption:'A capture of the Earquity listener demo.'},
    {src:'assets/earquity/listening-receipt.jpg', alt:'Screenshot of the Earquity demo listening card and simulated receipt', title:'A clearer kind of receipt.', description:'The demo shows a simulated balance, an example play price and a breakdown of where a play is allocated.', caption:'A capture of the local demo. All balances and plays are simulated.'}
  ];
  document.querySelectorAll('[data-shot]').forEach(button => button.addEventListener('click', () => {
    const image = images[Number(button.dataset.shot)]; if (!image) return;
    document.querySelectorAll('[data-shot]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const visual = document.getElementById('showcase-image'); visual.src = image.src; visual.alt = image.alt;
    document.getElementById('shot-title').textContent = image.title; document.getElementById('shot-description').textContent = image.description; document.getElementById('shot-caption').textContent = image.caption;
  }));
  const slider = document.getElementById('music-price');
  const pence = value => `${(value / 100).toFixed(2)}p`;
  const update = () => { const music = Number(slider.value), fee = Math.round(music * 0.2); document.getElementById('music-output').textContent = pence(music); document.getElementById('music-amount').textContent = pence(music); document.getElementById('fee-amount').textContent = pence(fee); document.getElementById('total-amount').textContent = pence(music + fee); };
  slider.addEventListener('input', update); update();
})();
