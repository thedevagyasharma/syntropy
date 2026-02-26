export const CW = 1080, CH = 1350;
export const FW = 900, FH = 1170;
export const FX = (CW - FW) / 2;
export const FY = (CH - FH) / 2;
export const TILE = 180;
export const GX = FX + TILE;
export const GY = FY + (FH - 900) / 2 + TILE;

export const SVG_PATHS = [
  [[0.3,0],[0.3,540]],[[180,0],[180,540]],[[360,0],[360,540]],[[539.7,0],[539.7,540]],
  [[0,0.3],[540,0.3]],[[0,180],[540,180]],[[0,360],[540,360]],[[0,539.7],[540,539.7]],
  [[721,657],[-115.5,-179.5]],[[721,837],[-115.5,0.5]],[[884,640],[47.5,-196.5]],
  [[591.5,655.5],[-245,-181]],[[591.5,835.5],[-245,-1]],[[754.5,638.5],[-82,-198]],
  [[-232,656],[604.5,-180.5]],[[127,657],[963.5,-179.5]],[[-232,836],[604.5,-0.5]],
  [[-230.5,526.5],[606,-310]],[[116,540],[965,-309]],[[-230.5,706.5],[606,-130]]
];

export const ADJECTIVES = ['LIMINAL','NUMINOUS','NOETIC','ORPHIC','CHTHONIC','IMMANENT','PNEUMAL','LUCENT','SOMATIC','ASTRAL','ABYSSAL','TELIC','APEIRIC','PLENAL','AEONIC','VERNAL'];
export const VERBS      = ['BECOMING','UNFOLDING','DISSOLVING','EMANATING','TRANSCENDING','DIFFUSING','RESONATING','COLLAPSING','ASCENDING','PERCEIVING','TRAVERSING','AWAKENING','PERSISTING','CONVERGING','RECEDING','DRIFTING'];
export const NOUNS      = ['PSYCHE','PNEUMA','NOUS','ANIMA','LOGOS','TELOS','APORIA','AETHER','PLENUM','ATMAN','KAIROS','KOSMOS','SOMA','ARCHE','PATHOS','EIDOLON','MONAD','TOPOS','PRAXIS','FLUX','STASIS','LIMBO','EPOCH','NEXUS','AXIOM','LOCUS','NADIR','ZENITH','APOGEE','VOID','PLEROMA','EKPYROSIS'];

export function getName(n) {
  return `${ADJECTIVES[n & 0xF]} ${VERBS[(n >> 4) & 0xF]} ${NOUNS[(n >> 8) & 0x1F]}`;
}

export function stateFromN(n) {
  return {
    squares:  Array.from({length:9}, (_,i) => (n >> i) & 1),
    diamonds: Array.from({length:4}, (_,i) => (n >> (9+i)) & 1)
  };
}

export function randomN() {
  return Math.floor(Math.random() * 8192);
}

export const DS = 270;
export const DT = DS / 3;

export function drawFrame(p, sq, dm, showGrid, color = '#ffffff') {
  p.background(0);
  p.noFill(); p.stroke(color); p.strokeWeight(1);
  p.rect(FX, FY, FW, FH);

  p.noStroke();
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      p.fill(sq[r*3+c] ? color : 0);
      p.rect(GX + c*TILE, GY + r*TILE, TILE, TILE);
    }

  p.rectMode(p.CENTER); p.noStroke();
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 2; c++) {
      p.fill(dm[r*2+c] ? color : 0);
      p.push();
      p.translate(GX+(c+1)*TILE, GY+(r+1)*TILE);
      p.rotate(p.QUARTER_PI);
      p.rect(0, 0, 90, 90);
      p.pop();
    }
  p.rectMode(p.CORNER); p.noStroke();

  if (showGrid) {
    p.drawingContext.save();
    p.drawingContext.beginPath();
    p.drawingContext.rect(GX, GY, 3*TILE, 3*TILE);
    p.drawingContext.clip();
    const sc = (3*TILE)/540;
    p.drawingContext.translate(GX, GY);
    p.drawingContext.scale(sc, sc);
    p.drawingContext.strokeStyle = color;
    p.drawingContext.lineWidth = 0.6/sc;
    for (const [[x1,y1],[x2,y2]] of SVG_PATHS) {
      p.drawingContext.beginPath();
      p.drawingContext.moveTo(x1,y1);
      p.drawingContext.lineTo(x2,y2);
      p.drawingContext.stroke();
    }
    p.drawingContext.restore();
  }
}

export function drawDiag(p, sq, dm, mode) {
  p.background(0);
  p.noStroke();
  if (mode !== 'dm') {
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        p.fill(sq[r*3+c] ? 255 : 0);
        p.rect(c*DT, r*DT, DT, DT);
      }
  }
  if (mode !== 'sq') {
    p.rectMode(p.CENTER);
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 2; c++) {
        const v = dm[r*2+c];
        p.fill(mode === 'dm' ? (v ? 255 : 30) : (v ? 255 : 0));
        p.push();
        p.translate((c+1)*DT, (r+1)*DT);
        p.rotate(p.QUARTER_PI);
        p.rect(0, 0, DT/2, DT/2);
        p.pop();
      }
    p.rectMode(p.CORNER);
  }
  p.drawingContext.save();
  p.drawingContext.beginPath();
  p.drawingContext.rect(0, 0, DS, DS);
  p.drawingContext.clip();
  const sc = DS / 540;
  p.drawingContext.scale(sc, sc);
  p.drawingContext.strokeStyle = 'rgba(255,255,255,0.2)';
  p.drawingContext.lineWidth = 0.5 / sc;
  for (const [[x1,y1],[x2,y2]] of SVG_PATHS) {
    p.drawingContext.beginPath();
    p.drawingContext.moveTo(x1, y1);
    p.drawingContext.lineTo(x2, y2);
    p.drawingContext.stroke();
  }
  p.drawingContext.restore();
  p.noStroke();
}


