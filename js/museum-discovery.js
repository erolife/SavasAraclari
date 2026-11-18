(function () {
  'use strict';
  const en = window.MuseumPreferences?.language === 'en';
  const t = (tr, english) => en ? english : tr;
  const lab = document.body.dataset.collectionVisit === 'enigma';
  const tasks = {
    harrier: {
      instruction: t('Nozul açısını önce 20° altına, sonra 80° üstüne getir.', 'Move the nozzle angle below 20°, then above 80°.'),
      explanation: t('Dört nozul birlikte yön değiştirir. Aynı motor, akımı arkaya veya aşağıya yönlendirerek farklı uçuş durumlarını destekler.',
        'All four nozzles change direction together. The same engine directs flow rearward or downward for different flight conditions.')
    },
    cezeri: {
      instruction: t('Su çarkı kontrolünü sıfıra indir, sonra yeniden yükselt.', 'Move the waterwheel control to zero, then increase it again.'),
      explanation: t('Çark durduğunda dişliler ve pompalar da durur. Dönüş, dişli ve kam üzerinden ileri geri harekete dönüşür.',
        'When the wheel stops, the gears and pumps stop too. Gears and a cam convert rotation into back-and-forth movement.')
    },
    enigma: {
      instruction: t('Aynı harfe art arda iki kez bas ve rotor pencerelerini izle.', 'Press the same letter twice in a row and watch the rotor windows.'),
      explanation: t('Her tuşla rotor durumu ilerler. Harf yolunu o anki rotor durumu belirler. Giriş ve çıkışı elektrik yolu tablosunda takip edebilirsin.',
        'The rotors advance with each key press. Their current state determines the electrical path. Follow the input and output in the circuit trace.')
    }
  };
  const card = document.createElement('section');
  card.className = 'card discovery-card';
  card.setAttribute('aria-label',t('Keşif görevi','Discovery task'));
  const title = document.createElement('h2');
  title.textContent = t('Bunu fark ettin mi?', 'Did you notice?');
  const instruction = document.createElement('p');
  const result = document.createElement('p');
  result.setAttribute('role','status');
  const reset = document.createElement('button');
  reset.className = 'btn';
  reset.textContent = t('Yeniden dene','Try again');
  const link = document.createElement('a');
  link.className = 'btn';
  link.href = 'enigma.html';
  link.textContent = t('Enigma laboratuvarına geç ↗', 'Open the Enigma lab ↗');
  card.append(title,instruction,result,reset,link);
  const launch = document.createElement('button');
  launch.className = 'btn';
  launch.textContent = t('Keşif görevini dene', 'Try a discovery task');
  if (!lab) {
    document.getElementById('museum-overview').append(launch);
    launch.addEventListener('click', () => {
      document.getElementById('museum-view-toggle').click();
      if (innerWidth <= 900) document.querySelector('[data-mob-tab="mech"]').click();
      card.scrollIntoView({block:'nearest'});
      card.tabIndex = -1;
      card.focus({preventScroll:true});
    });
  }
  (lab ? document.querySelector('.desk') : document.querySelector('.right-panel')).prepend(card);
  let current = '';
  let first = false;
  let complete = false;
  let previousLetter = '';
  function start(id) {
    current = id;
    first = complete = false;
    previousLetter = '';
    result.textContent = '';
    reset.hidden = true;
    const task = tasks[id];
    card.hidden = !task;
    launch.hidden = !task;
    if (!task) return;
    instruction.textContent = task.instruction;
    link.hidden = id !== 'enigma' || lab;
  }
  function finish() {
    if (complete) return;
    complete = true;
    result.textContent = t('Keşfettin! ', 'Discovered! ') + tasks[current].explanation;
    reset.hidden = false;
  }
  reset.addEventListener('click',()=>start(current));
  if (lab) {
    start('enigma');
    window.addEventListener('enigmavalue',event=>{
      if (event.detail === previousLetter) finish();
      previousLetter = event.detail;
    });
  } else {
    const refresh = () => start(new URLSearchParams(location.search).get('vehicle') || 'tiger');
    refresh();
    window.addEventListener('museumvehiclechange',refresh);
    document.getElementById('slider-rpm').addEventListener('input',event=>{
      const value = Number(event.target.value);
      if (current === 'harrier') {
        if (value < 20) first = true;
        if (first && value > 80) finish();
      }
      if (current === 'cezeri') {
        if (value === 0) first = true;
        if (first && value > 0) finish();
      }
    });
  }
})();
