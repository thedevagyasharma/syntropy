import p5 from 'p5';
import { CW, CH, FX, FY, FW, FH, DS, DT, getName, stateFromN, randomN, drawFrame, drawDiag } from './core.js';

// --- DIAGRAMS ---
const diagN = 7857;
const diagState = stateFromN(diagN);

['sq', 'dm', 'co'].forEach((id, idx) => {
  const modes = ['sq', 'dm', 'co'];
  new p5(function(p) {
    p.setup = function() {
      p.createCanvas(DS, DS).parent('diag-' + id);
      p.noLoop();
      if (id === 'co') {
        document.getElementById('diag-name').textContent = getName(diagN);
        document.getElementById('diag-id').textContent = '#' + diagN;
      }
    };
    p.draw = function() { drawDiag(p, diagState.squares, diagState.diamonds, modes[idx]); };
  });
});

// --- MAIN GENERATOR ---
let mainN = randomN();
let mainState = stateFromN(mainN);
let mainP = null;
let showGrid = false;
let accentColor = '#ffffff';

function updateUI() {
  document.getElementById('pub-name').textContent = getName(mainN);
  document.getElementById('pub-id').textContent = '#' + mainN;
  document.getElementById('pub-binary').textContent = mainN.toString(2).padStart(13, '0');
}

new p5(function(p) {
  mainP = p;
  p.setup = function() {
    p.pixelDensity(2);
    p.createCanvas(CW, CH).parent('main-sketch');
    updateUI();
  };
  p.draw = function() {
    drawFrame(p, mainState.squares, mainState.diamonds, showGrid, accentColor);
    p.fill(accentColor); p.noStroke();
    p.textFont('Departure Mono'); p.textSize(22);
    p.textAlign(p.LEFT, p.TOP);
    p.text(getName(mainN), FX + 32, FY + 32);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text('#' + mainN, FX + 32, FY + FH - 32);
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text(mainN.toString(2).padStart(13, '0'), FX + FW - 32, FY + FH - 32);
  };
});

let isAnimating = false;
const notes = ['B', 'Csharp', 'Dsharp', 'E', 'Fsharp', 'Gsharp', 'Asharp', 'Bu'].map(n => new Audio(`/${n}.ogg`));

function flipBits(n, count) {
  const positions = [];
  while (positions.length < count) {
    const b = Math.floor(Math.random() * 13);
    if (!positions.includes(b)) positions.push(b);
  }
  return positions.reduce((acc, b) => acc ^ (1 << b), n);
}

function playNote(idx) {
  const s = notes[idx].cloneNode();
  s.play();
}

document.getElementById('pub-teleport').onclick = function() {
  if (isAnimating) return;
  mainN = randomN();
  mainState = stateFromN(mainN);
  document.getElementById('pub-decimal').value = '';
  updateUI();
};

document.getElementById('pub-jump').onclick = function() {
  if (isAnimating) return;
  const v = parseInt(document.getElementById('pub-decimal').value);
  if (!isNaN(v) && v >= 0 && v <= 8191) {
    mainN = v;
    mainState = stateFromN(v);
    updateUI();
  }
};

document.getElementById('pub-travel').onclick = function() {
  if (isAnimating) return;

  document.getElementById('pub-decimal').value = '';

  // Timing curve: ramp up fast, then slow to a clear settle
  // Each value is the delay (ms) before the NEXT flip
  const gaps = [
    200, 142, 104, 82, 72, 68, 68, 70, 74, 80,   // ramp up to peak speed (10)
    92, 120, 158, 208, 274, 362, 476, 628, 828    // decelerate & settle (9) → total 19, lands on E
  ];

  isAnimating = true;
  let i = 0;

  function flip() {
    if (i < gaps.length) {
      mainN = flipBits(mainN, i < 10 ? (Math.random() < 0.5 ? 1 : 2) : 1);
      mainState = stateFromN(mainN);
      updateUI();
      playNote(i < gaps.length - 7 ? 0 : i - (gaps.length - 7));
      setTimeout(flip, gaps[i++]);
    } else {
      mainN = flipBits(mainN, 1);
      mainState = stateFromN(mainN);
      updateUI();
      playNote(7); // Bu on landing
      isAnimating = false;
    }
  }

  flip();
};


document.getElementById('pub-grid').onchange = function() {
  showGrid = this.checked;
};

document.getElementById('pub-color').onchange = function() {
  accentColor = this.checked ? '#ff4000' : '#ffffff';
};

document.getElementById('pub-save').onclick = function() {
  if (!mainP) return;
  const a = document.createElement('a');
  a.download = `syntropy-${mainN}.jpg`;
  a.href = mainP.canvas.toDataURL('image/jpeg', 0.95);
  a.click();
};

// --- INTRO SKETCH ---
const INTRO_TARGET = 5290;
const INTRO_SIZE = Math.round(window.innerHeight * 0.14);
const IT = INTRO_SIZE / 3;

new p5(function(p) {
  let sq = [], dm = [];

  const gaps = [
    200, 142, 104, 82, 72, 68, 68, 70, 74, 80,
    92, 120, 158, 208, 274, 362, 476, 628, 828
  ];

  // 7 rapid-phase patterns + 13 bit-lock steps = 20 states, 19 transitions
  function buildSequence() {
    const rapidMasks = [
      0b1010101010101,
      0b0101010101010,
      0b1100110011001,
      0b0011001100110,
      0b1111100000000,
      0b0000011111111,
      0b1111111111111, // all bits wrong → lock phase starts clean
    ];
    const seq = rapidMasks.map(m => INTRO_TARGET ^ m);
    let n = seq[seq.length - 1];
    for (let bit = 0; bit < 13; bit++) {
      n = (n & ~(1 << bit)) | (((INTRO_TARGET >> bit) & 1) << bit);
      seq.push(n);
    }
    return seq;
  }

  const sequence = buildSequence();

  function setState(n) {
    const s = stateFromN(n);
    sq = [...s.squares];
    dm = [...s.diamonds];
  }

  function drawTile() {
    p.background(0);
    p.noStroke();
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        const x = Math.floor(c * INTRO_SIZE / 3);
        const y = Math.floor(r * INTRO_SIZE / 3);
        const w = Math.floor((c + 1) * INTRO_SIZE / 3) - x;
        const h = Math.floor((r + 1) * INTRO_SIZE / 3) - y;
        p.fill(sq[r * 3 + c] ? 255 : 0);
        p.rect(x, y, w, h);
      }
    p.rectMode(p.CENTER);
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 2; c++) {
        p.fill(dm[r * 2 + c] ? 255 : 0);
        p.push();
        p.translate((c + 1) * IT, (r + 1) * IT);
        p.rotate(p.QUARTER_PI);
        p.rect(0, 0, IT / 2, IT / 2);
        p.pop();
      }
    p.rectMode(p.CORNER);
  }

  p.setup = function() {
    p.createCanvas(INTRO_SIZE, INTRO_SIZE).parent('intro-sketch');
    setState(sequence[0]);
    let step = 0;
    function next() {
      step++;
      setState(sequence[step]);
      if (step < sequence.length - 1) setTimeout(next, gaps[step]);
    }
    setTimeout(next, gaps[0]);
  };

  p.draw = function() { drawTile(); };
});

// --- FADE IN ---
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

// --- LIGHTBOX ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxBg = lightbox.querySelector('.lightbox-bg');
let lightboxSource = null;

// Calculate where the image will be displayed (matches max-width/max-height CSS)
function calcTargetRect() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const ar = 1080 / 1350; // portrait aspect ratio of all collection images
  const maxW = vw * 0.9, maxH = vh * 0.9;
  let w = maxW, h = w / ar;
  if (h > maxH) { h = maxH; w = h * ar; }
  return { width: w, height: h, cx: vw / 2, cy: vh / 2 };
}

function openLightbox(sourceImg) {
  lightboxSource = sourceImg;
  lightboxImg.src = sourceImg.src;
  lightboxImg.alt = sourceImg.alt;

  const from = sourceImg.getBoundingClientRect();
  const to = calcTargetRect();

  const sx = from.width / to.width;
  const sy = from.height / to.height;
  const tx = (from.left + from.width / 2) - to.cx;
  const ty = (from.top + from.height / 2) - to.cy;

  // Start at source position with no transition
  lightboxImg.style.willChange = 'transform';
  lightboxImg.style.transition = 'none';
  lightboxImg.style.transform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`;
  lightboxImg.style.opacity = '1';
  lightbox.classList.add('open');

  requestAnimationFrame(() => {
    lightboxImg.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    lightboxImg.style.transform = 'translate(0, 0) scale(1)';
  });

  lightboxSource.style.opacity = '0';
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.paddingRight = scrollbarWidth + 'px';
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightboxSource) return;

  const to = lightboxSource.getBoundingClientRect();
  const from = calcTargetRect();

  const sx = to.width / from.width;
  const sy = to.height / from.height;
  const tx = (to.left + to.width / 2) - from.cx;
  const ty = (to.top + to.height / 2) - from.cy;

  const source = lightboxSource;

  // Transform and overlay fade simultaneously. Source stays hidden throughout.
  lightboxImg.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
  lightboxImg.style.transform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`;
  lightbox.classList.remove('open');

  setTimeout(() => {
    // Atomically swap: show source, hide lightbox image in the same frame
    source.style.opacity = '';
    lightboxImg.style.willChange = '';
    lightboxImg.style.transition = 'none';
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'none';
    lightboxImg.src = '';
    lightboxSource = null;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }, 380);
}

document.querySelectorAll('.collection-item img').forEach(img => {
  const match = img.src.match(/syntropy-(\d+)/);
  if (match) img.alt = `#${match[1]} ${getName(parseInt(match[1]))}`;
  img.addEventListener('click', () => openLightbox(img));
});
lightboxBg.addEventListener('click', closeLightbox);
lightboxImg.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
