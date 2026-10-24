// src/audio.js
// Sintetizador Web Audio API Procedural Completo (Zero arquivos externos 404)
// Suporte a mute de Ads, visibilitychange e pitch randômico

class QuantumAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.isAdMuted = false;
    this.bgmGain = null;
    this.isBgmActive = false;
    this.bgmInterval = null;

    // Escuta perda de foco para silenciar e pausar sons automaticamente
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.suspend();
        } else {
          this.resume();
        }
      });
      window.addEventListener('blur', () => this.suspend());
      window.addEventListener('focus', () => this.resume());
    }
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended' && !this.isAdMuted) {
      this.ctx.resume().catch(() => {});
    }
  }

  setAdMuted(muted) {
    this.isAdMuted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = (this.isMuted || this.isAdMuted) ? 0.0 : 1.0;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
    if (muted) {
      this.suspend();
    } else {
      this.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = (this.isMuted || this.isAdMuted) ? 0.0 : 1.0;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  playTone(type, startF, endF, dur, gainMax = 0.2, pitchRandom = 0.05) {
    if (this.isMuted || this.isAdMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const pMult = 1.0 + (Math.random() * 2 - 1) * pitchRandom;
      const sFreq = Math.max(20, startF * pMult);
      const eFreq = Math.max(20, endF * pMult);

      osc.type = type;
      osc.frequency.setValueAtTime(sFreq, now);
      osc.frequency.exponentialRampToValueAtTime(eFreq, now + dur);

      gain.gain.setValueAtTime(gainMax, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + dur);
    } catch (e) {}
  }

  // 1. Pulo Ágil com Pitch Randômico
  playJump() {
    this.playTone('sine', 180, 520, 0.11, 0.18, 0.08);
  }

  // 2. Aterrissagem com Impacto Sutil
  playLand() {
    this.playTone('triangle', 90, 45, 0.06, 0.12, 0.04);
  }

  // 3. Morte Troll com Queda Cômica (Pitch Drop + Ruído de Glitch)
  playPopDeath() {
    this.playTone('sawtooth', 440, 45, 0.18, 0.28, 0.05);
    // Ruído secundário de curto-circuito quântico
    if (this.isMuted || this.isAdMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  // 4. Armadilha Troll Disparada
  playTrapTrigger() {
    this.playTone('triangle', 360, 220, 0.09, 0.16, 0.06);
  }

  // 5. Coleta de Estrela Física (Arpejo Dourado Triunfante)
  playStarCollect() {
    if (this.isMuted || this.isAdMuted) return;
    this.init();
    if (!this.ctx) return;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // Dó, Mi, Sol, Dó (Maior)
    freqs.forEach((f, i) => {
      setTimeout(() => {
        this.playTone('sine', f, f * 1.02, 0.14, 0.2, 0.02);
      }, i * 50);
    });
  }

  // 6. Coleta de Bit Quântico (Blip Futurista)
  playBitCollect() {
    this.playTone('sine', 600, 920, 0.08, 0.14, 0.06);
  }

  // 7. Vitória da Fase (Fanfarra Sintética de Sucesso)
  playVictory() {
    if (this.isMuted || this.isAdMuted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone('sine', freq, freq, 0.22, 0.22, 0.01);
      }, idx * 75);
    });
  }

  // 8. Efeito de Glitch / Aberração Quântica
  playGlitch() {
    this.playTone('sawtooth', 800, 120, 0.08, 0.18, 0.2);
  }

  // 9. Clique de Botão da Interface
  playClick() {
    this.playTone('sine', 480, 260, 0.04, 0.1, 0.02);
  }

  // 10. Giro da Roleta da Sorte (Tic Mecânico)
  playWheelSpin() {
    this.playTone('triangle', 420, 300, 0.03, 0.08, 0.05);
  }

  // 11. Splash Screen FLUIDCLEB INTERACTIVE (0.0s a 2.8s)
  playFluidClebIntro() {
    if (this.isMuted || this.isAdMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Acorde espacial ascendente (Ciano / Cósmico)
      const freqs = [130.81, 196.00, 261.63, 392.00, 523.25];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 1.2);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.4 + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + idx * 0.08);
        osc.stop(now + 2.4);
      });
    } catch (e) {}
  }
}

export const sound = new QuantumAudioEngine();
