// Clean, self-contained script for interactivity
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

const barrierSlider = document.getElementById('barrierSlider');
const energySlider = document.getElementById('energySlider');
const transistorSlider = document.getElementById('transistorSlider');
const toggleWave = document.getElementById('toggleWave');

const transmissionValue = document.getElementById('transmissionValue');
const decayValue = document.getElementById('decayValue');
const interpretationValue = document.getElementById('interpretationValue');
const nodeSizeLabel = document.getElementById('nodeSizeLabel');
const leakageValue = document.getElementById('leakageValue');
const powerValue = document.getElementById('powerValue');
const heatValue = document.getElementById('heatValue');
const heatBar = document.getElementById('heatBar');
const waterValue = document.getElementById('waterValue');
const energyValue = document.getElementById('energyValue');
const pueValue = document.getElementById('pueValue');
const co2Value = document.getElementById('co2Value');

const canvas = document.getElementById('tunnelCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let waveEnabled = true;

function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

function computeTransmission(barrier, energy) {
  const k = clamp((1.8 * (1.3 - energy) + 0.8 * barrier) / 1.6, 0.1, 2.8);
  const transmission = Math.exp(-2 * k * barrier) * 100;
  return { transmission, k };
}

function updateTunnelUI() {
  if (!barrierSlider || !energySlider) return;
  const barrier = Number(barrierSlider.value);
  const energy = Number(energySlider.value);
  const { transmission, k } = computeTransmission(barrier, energy);

  const percent = clamp(transmission, 0.1, 95);
  if (transmissionValue) transmissionValue.textContent = `${percent.toFixed(1)}%`;
  if (decayValue) decayValue.textContent = `κ ≈ ${k.toFixed(2)}`;

  if (!interpretationValue) return;
  if (!waveEnabled) {
    interpretationValue.textContent = 'Tunelamento pausado';
    return;
  }

  if (percent < 5) interpretationValue.textContent = 'Praticamente bloqueada';
  else if (percent < 30) interpretationValue.textContent = 'Tunelamento parcial';
  else if (percent < 60) interpretationValue.textContent = 'Tunelamento forte';
  else interpretationValue.textContent = 'Transmissão alta';
}

function switchTab(target) {
  tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === target));
  tabPanels.forEach(p => p.classList.toggle('active', p.id === target));
}

function drawTunnel() {
  if (!canvas || !ctx || !barrierSlider || !energySlider) return;
  const barrier = Number(barrierSlider.value);
  const energy = Number(energySlider.value);
  const width = canvas.width;
  const height = canvas.height;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  const leftGradient = ctx.createLinearGradient(0, 0, width, 0);
  leftGradient.addColorStop(0, '#0b1f33');
  leftGradient.addColorStop(1, '#133a5e');
  ctx.fillStyle = leftGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i < 10; i++) {
    const y = i * 32 + 18;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  const barrierX = width * 0.58;
  const barrierWidth = barrier * 28;
  const barrierStart = barrierX - barrierWidth / 2;
  const barrierEnd = barrierX + barrierWidth / 2;

  ctx.fillStyle = waveEnabled ? 'rgba(255,152,72,0.96)' : 'rgba(164,175,192,0.45)';
  ctx.fillRect(barrierStart, 40, barrierWidth, height - 80);

  ctx.fillStyle = waveEnabled ? 'rgba(94,231,255,0.98)' : 'rgba(120,144,165,0.75)';
  ctx.fillRect(0, 42, barrierStart, height - 84);

  ctx.fillStyle = waveEnabled ? 'rgba(112,220,170,0.7)' : 'rgba(90,109,130,0.38)';
  ctx.fillRect(barrierEnd, 42, width - barrierEnd, height - 84);

  const transmission = computeTransmission(barrier, energy).transmission;
  const particles = 34;
  const passChance = clamp((transmission / 100) * 1.2 + energy * 0.25, 0.02, 0.96);
  const speedFactor = 0.55 + energy * 1.6;
  const pauseSpeedFactor = 0.18 + energy * 0.75;
  const time = performance.now() * (waveEnabled ? 0.0009 * speedFactor : 0.0007 * pauseSpeedFactor);
  const pauseImpact = clamp(0.4 + energy * 0.9, 0.4, 1.0);

  for (let i = 0; i < particles; i++) {
    const offset = (i / particles + time) % 1;
    const xBase = 50 + offset * (width - 120);
    const y = centerY + Math.sin((offset * 18) + i * 0.8) * 18;
    const canPass = waveEnabled && (((i * 5) % 11) / 11) < passChance;

    let x = xBase;
    if (!waveEnabled) x = clamp(50 + offset * (barrierStart - 30), 50, barrierStart - 12);

    if (x < barrierStart - 12) { ctx.fillStyle = 'rgba(120,236,255,1)'; ctx.fillRect(x, y, 10, 10); continue; }

    if (x >= barrierStart - 12 && x <= barrierEnd + 12) {
      if (waveEnabled) {
        if (canPass) { ctx.fillStyle = 'rgba(255,214,102,1)'; ctx.fillRect(x, y, 11, 11); }
        else { ctx.fillStyle = 'rgba(255,138,74,1)'; ctx.fillRect(x, y, 10, 10); }
      } else {
        const pauseAlpha = 0.7 + pauseImpact * 0.3;
        ctx.fillStyle = `rgba(255,138,74,${pauseAlpha})`;
        ctx.fillRect(x, y, 10, 10);
      }
      continue;
    }

    if (waveEnabled && canPass) { ctx.fillStyle = 'rgba(108,242,178,1)'; ctx.fillRect(x, y, 10, 10); }
    else { ctx.fillStyle = waveEnabled ? 'rgba(76,168,135,0.12)' : 'rgba(108,242,178,0.08)'; ctx.fillRect(x, y, 8, 8); }
  }

  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '13px sans-serif'; ctx.fillText('E', barrierX - 10, 26);
}

function updateTransistorUI() {
  if (!transistorSlider) return;
  const size = Number(transistorSlider.value);
  if (nodeSizeLabel) nodeSizeLabel.textContent = `${size.toFixed(1)} nm`;

  const leakageFactor = clamp((14 - size) / 13, 0.05, 0.95);
  const power = (25 + leakageFactor * 140).toFixed(0);

  const heat = clamp(25 + leakageFactor * 75, 25, 100);
  if (heatBar) heatBar.style.width = `${heat}%`;

  const chipCore = document.querySelector('.chip-core');
  if (chipCore) {
    const nodeScale = 0.64 + (size / 14) * 0.62;
    chipCore.style.setProperty('--node-scale', nodeScale.toFixed(2));
    chipCore.style.setProperty('--heat-glow', (0.18 + leakageFactor * 0.72).toFixed(2));
    chipCore.style.boxShadow = `inset 0 0 18px rgba(94,231,255,0.1), 0 0 ${22 + (14 - size) * 3}px rgba(255,138,74,${0.16 + leakageFactor * 0.34})`;
  }

  if (leakageValue) {
    if (size > 10) leakageValue.textContent = 'Baixa';
    else if (size > 6) leakageValue.textContent = 'Relevante';
    else leakageValue.textContent = 'Elevada';
  }
  if (heatValue) {
    if (size > 10) heatValue.textContent = 'Moderada';
    else if (size > 6) heatValue.textContent = 'Elevada';
    else heatValue.textContent = 'Muito elevada';
  }

  if (powerValue) powerValue.textContent = `~${power} W`;
  if (waterValue) waterValue.textContent = `${(9.3 * (1 + leakageFactor * 1.3)).toFixed(1)} trilhões de L/ano`;

  updateDatacenterUI(size, leakageFactor, Number(power));
}

function updateDatacenterUI(size, leakageFactor, chipPower) {
  const baseDataCenterLoadMW = 10; // example reference
  const addedLoad = baseDataCenterLoadMW * leakageFactor * 0.6;
  const totalLoad = baseDataCenterLoadMW + addedLoad;
  const pue = clamp(1.1 + leakageFactor * 0.9, 1.1, 2.0);

  const hoursPerYear = 24 * 365;
  const annualMWh = totalLoad * hoursPerYear;
  const co2PerMWh = 100; // kg CO2 / MWh example
  const co2KtPerYear = (annualMWh * co2PerMWh) / 1e6;

  if (energyValue) energyValue.textContent = `${totalLoad.toFixed(2)} MW`;
  if (pueValue) pueValue.textContent = `${pue.toFixed(2)}`;
  if (co2Value) co2Value.textContent = `${co2KtPerYear.toFixed(1)} kt CO₂/ano`;
}

function animate() { updateTunnelUI(); drawTunnel(); requestAnimationFrame(animate); }

tabButtons.forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));

if (barrierSlider) barrierSlider.addEventListener('input', updateTunnelUI);
if (energySlider) energySlider.addEventListener('input', updateTunnelUI);
if (transistorSlider) transistorSlider.addEventListener('input', updateTransistorUI);
if (toggleWave) toggleWave.addEventListener('click', () => {
  waveEnabled = !waveEnabled;
  toggleWave.textContent = waveEnabled ? 'Pausar tunelamento' : 'Ativar tunelamento';
});

// Expose API for external inspection/tests
window.updateTunnelUI = updateTunnelUI;
window.updateTransistorUI = updateTransistorUI;
window.updateDatacenterUI = updateDatacenterUI;
window.toggleWaveEnabled = () => { waveEnabled = !waveEnabled; };

updateTunnelUI(); updateTransistorUI(); if (canvas) animate();
