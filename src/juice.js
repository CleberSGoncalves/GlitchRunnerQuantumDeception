// src/juice.js
// Juice & Game Feel Engine: Trauma² Screen Shake, Hit-Stop, Partículas Procedurais e Shader Glitch

export class JuiceEngine {
  constructor() {
    // 1. Screen Shake Exponencial Baseado em Trauma²
    this.trauma = 0;
    this.traumaDecay = 2.4;
    this.maxShakeOffset = 22;
    this.maxShakeAngle = 0.04;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeAngle = 0;

    // 2. Hit-Stop (Micro-congelamento de Impacto)
    this.isHitStopped = false;
    this.hitStopTimer = null;

    // 3. Partículas Procedurais
    this.particles = [];

    // 4. Glitch & Grade Cibernética do Mainframe
    this.glitchIntensity = 0;
    this.glitchTimer = 0;
    this.gridOffset = 0;
  }

  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  triggerHitStop(durationMs = 50, callback = null) {
    if (this.isHitStopped) return;
    this.isHitStopped = true;

    if (this.hitStopTimer) clearTimeout(this.hitStopTimer);
    this.hitStopTimer = setTimeout(() => {
      this.isHitStopped = false;
      if (callback) callback();
    }, durationMs);
  }

  triggerGlitch(intensity = 0.8, durationMs = 250) {
    this.glitchIntensity = intensity;
    setTimeout(() => {
      this.glitchIntensity = 0;
    }, durationMs);
  }

  // Emite explosão de detritos e pixels com gravidade na morte troll
  emitDeathExplosion(x, y, color = '#00f0ff') {
    this.addTrauma(0.65);
    this.triggerHitStop(50);
    this.triggerGlitch(0.7, 220);

    for (let i = 0; i < 32; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 320;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        size: 3 + Math.random() * 5,
        color: Math.random() > 0.35 ? color : '#ef4444',
        alpha: 1.0,
        life: 0.35 + Math.random() * 0.35,
        maxLife: 0.7,
        gravity: 800,
        type: 'debris'
      });
    }
  }

  // Emite faíscas douradas ao coletar Estrela Física
  emitStarCollect(x, y) {
    this.addTrauma(0.3);
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 240;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: Math.random() > 0.3 ? '#fbbf24' : '#fef08a',
        alpha: 1.0,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        gravity: 200,
        type: 'spark'
      });
    }
  }

  // Emite brilho ciano ao coletar Bit Quântico
  emitBitCollect(x, y) {
    this.addTrauma(0.15);
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: 3 + Math.random() * 3,
        color: '#38bdf8',
        alpha: 0.9,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45,
        gravity: 120,
        type: 'spark'
      });
    }
  }

  // Rastro digital ao correr e pular
  emitTrail(x, y, w, h, color = '#00f0ff') {
    this.particles.push({
      x: x + Math.random() * w,
      y: y + h - 2,
      vx: (Math.random() - 0.5) * 30,
      vy: -15 - Math.random() * 30,
      size: 2 + Math.random() * 3,
      color,
      alpha: 0.55,
      life: 0.16 + Math.random() * 0.1,
      maxLife: 0.26,
      gravity: -30,
      type: 'trail'
    });
  }

  // Confetti comemorativo na conclusão de fase
  emitVictoryConfetti(w, h) {
    this.addTrauma(0.4);
    this.triggerGlitch(0.6, 300);
    const colors = ['#00f0ff', '#22c55e', '#fbbf24', '#c084fc', '#f43f5e'];
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: -10,
        vx: (Math.random() - 0.5) * 160,
        vy: 120 + Math.random() * 220,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        life: 1.2 + Math.random() * 0.8,
        maxLife: 2.0,
        gravity: 100,
        type: 'confetti'
      });
    }
  }

  update(dt) {
    // 1. Trauma² Screen Shake Exponencial
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - this.traumaDecay * dt);
      const shake = this.trauma * this.trauma;
      this.shakeOffsetX = (Math.random() * 2 - 1) * this.maxShakeOffset * shake;
      this.shakeOffsetY = (Math.random() * 2 - 1) * this.maxShakeOffset * shake;
      this.shakeAngle = (Math.random() * 2 - 1) * this.maxShakeAngle * shake;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      this.shakeAngle = 0;
    }

    // 2. Partículas procedurais
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }

    this.gridOffset = (this.gridOffset + dt * 30) % 40;
    this.glitchTimer += dt;
  }

  // Renderiza fundo do mainframe cibernético corrompido
  renderBackground(ctx, w, h) {
    ctx.save();
    // Fundo azul escuro profundo
    ctx.fillStyle = '#070b16';
    ctx.fillRect(0, 0, w, h);

    // Grade cibernética neon
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = this.gridOffset; y <= h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Brilho gradiente de mainframe
    const grad = ctx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, Math.max(w, h) * 0.7);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.06)');
    grad.addColorStop(1, 'rgba(7, 11, 22, 0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  // Aplica distorção visual de glitch procedural em Canvas
  applyGlitchFilter(ctx, w, h) {
    if (this.glitchIntensity <= 0.01) return;
    ctx.save();
    const slices = 5;
    for (let i = 0; i < slices; i++) {
      if (Math.random() < 0.45) {
        const sy = Math.random() * h;
        const sh = 10 + Math.random() * 32;
        const shiftX = (Math.random() - 0.5) * 24 * this.glitchIntensity;
        try {
          ctx.drawImage(ctx.canvas, 0, sy, w, sh, shiftX, sy, w, sh);
        } catch (e) {}
      }
    }
    ctx.restore();
  }

  renderParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.type === 'spark' ? 8 : 0;

      if (p.type === 'spark') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    ctx.restore();
  }
}

export const juice = new JuiceEngine();
