// src/game.js
// Engine de Plataforma Troll com Física Determinística e Subversões Quânticas
// Coyote Time, Jump Buffer, Anti-NaN, Coletáveis Físicos e Dock Anti-Sobreposição

import { sound } from './audio.js';
import { SaveManager } from './storage.js';
import { LEVELS } from './levels.js';
import { juice } from './juice.js';

export class TrollPlatformerGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.container = document.getElementById('game-container') || document.body;

    this.currentLevelIndex = 0;
    this.level = null;

    // Resolução virtual interna
    this.vw = 960;
    this.vh = 560;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    // Física do Jogador
    this.player = {
      x: 80,
      y: 440,
      w: 24,
      h: 28,
      vx: 0,
      vy: 0,
      speed: 280,
      jumpForce: -540,
      gravity: 1450,
      isGrounded: false,
      coyoteTimer: 0,
      jumpBuffer: 0,
      scaleX: 1,
      scaleY: 1,
      isDead: false,
      isWon: false,
      isReversed: false,
      isGravityInverted: false,
      hasShield: false,
      shieldTimer: 0,
      color: '#00f0ff',
      trailColor: '#00f0ff'
    };

    // Estados e Controles
    this.keys = { left: false, right: false, jump: false };
    this.deathCount = 0;
    this.starsCollected = 0;
    this.bitsCollected = 0;

    this.isPaused = false;
    this.isRoundOver = false;
    this.isAdPaused = false;
    this.isRunning = false;

    // Callbacks
    this.onLevelUpdate = null;
    this.onVictoryCallback = null;
    this.onStarCollected = null;
    this.onBitCollected = null;
    this.onJumpCallback = null;

    this.initResize();
    this.initInputs();
  }

  setSkin(color, trailColor = null) {
    this.player.color = color;
    this.player.trailColor = trailColor || color;
  }

  grantShield(durationSeconds = 3.0) {
    this.player.hasShield = true;
    this.player.shieldTimer = durationSeconds;
    juice.addTrauma(0.2);
  }

  initResize() {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;

      // Anti-Sobreposição Mobile: Reserva topo e dock inferior no modo retrato
      const isPortrait = h >= w * 1.05;
      if (isPortrait) {
        this.container.classList.add('portrait-mode');
        const hudH = 60;
        const ctrlH = 120;
        const availH = Math.max(160, h - hudH - ctrlH);

        this.scale = Math.min(w / this.vw, availH / this.vh);
        this.offsetX = Math.floor((w - this.vw * this.scale) / 2);
        this.offsetY = Math.floor(hudH + (availH - this.vh * this.scale) / 2);
      } else {
        this.container.classList.remove('portrait-mode');
        this.scale = Math.min(w / this.vw, h / this.vh);
        this.offsetX = Math.floor((w - this.vw * this.scale) / 2);
        this.offsetY = Math.floor((h - this.vh * this.scale) / 2);
      }

      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
  }

  initInputs() {
    const handleKeyDown = (e) => {
      sound.init();
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        e.preventDefault();
        this.keys.jump = true;
        this.player.jumpBuffer = 0.15; // Jump Buffer
      }
      if (e.code === 'KeyR') {
        this.fastRetry();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') this.keys.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  loadLevel(index) {
    this.currentLevelIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
    // Cópia profunda para reiniciar armadilhas e coletáveis
    this.level = JSON.parse(JSON.stringify(LEVELS[this.currentLevelIndex]));
    this.deathCount = 0;
    this.starsCollected = 0;
    this.bitsCollected = 0;
    this.isRoundOver = false;
    this.isPaused = false;
    this.isAdPaused = false;

    this.respawnPlayer();

    if (this.onLevelUpdate) {
      this.onLevelUpdate(this.level, this.deathCount, this.starsCollected);
    }
  }

  respawnPlayer() {
    this.player.x = this.level.spawn.x;
    this.player.y = this.level.spawn.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isDead = false;
    this.player.isWon = false;
    this.player.scaleX = 1;
    this.player.scaleY = 1;
    this.player.isReversed = false;
    this.player.isGravityInverted = false;
  }

  fastRetry() {
    if (this.player.isWon) return;
    this.killPlayer();
  }

  killPlayer() {
    if (this.player.isDead || this.player.isWon) return;

    // Se o escudo estiver ativo, absorve o dano e concede breve imunidade
    if (this.player.hasShield && this.player.shieldTimer > 0) {
      this.player.hasShield = false;
      this.player.shieldTimer = 0;
      sound.playTrapTrigger();
      juice.addTrauma(0.4);
      return;
    }

    this.player.isDead = true;
    sound.playPopDeath();
    juice.emitDeathExplosion(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, this.player.color);

    this.deathCount = SaveManager.recordDeath(this.level.id);

    // Efeito cômico de esmagamento / squash flat
    this.player.scaleY = 0.2;
    this.player.scaleX = 1.6;

    if (this.onLevelUpdate) {
      this.onLevelUpdate(this.level, this.deathCount, this.starsCollected);
    }

    // Fast-Retry (< 40ms de delay de humor)
    setTimeout(() => {
      // Restaura armadilhas que precisam de reset da fase atual
      this.level = JSON.parse(JSON.stringify(LEVELS[this.currentLevelIndex]));
      // Preserva estrelas físicas já coletadas nesta tentativa de corrida
      this.respawnPlayer();
    }, 280);
  }

  winLevel() {
    if (this.player.isWon || this.player.isDead) return;
    this.player.isWon = true;
    this.isRoundOver = true;

    // Se alcançou a porta, ganha ao menos a 1ª Estrela de conclusão
    const finalStars = Math.max(1, this.starsCollected);
    sound.playVictory();
    juice.emitVictoryConfetti(this.vw, this.vh);

    const bitsEarned = 25 + finalStars * 20;
    SaveManager.recordVictory(this.level.id, finalStars, this.bitsCollected);
    SaveManager.addQuantumBits(bitsEarned);

    if (this.onVictoryCallback) {
      this.onVictoryCallback(this.level, this.deathCount, finalStars, bitsEarned);
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(currentTime) {
    if (!this.isRunning) return;
    const rawDt = (currentTime - this.lastTime) / 1000;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.05); // Fixed Timestep Cap anti-lag
    this.lastTime = currentTime;

    if (!this.isPaused && !this.isAdPaused && !juice.isHitStopped) {
      if (!this.player.isDead && !this.player.isWon) {
        this.update(dt);
      }
    }

    juice.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const p = this.player;

    // Atualiza temporizador de escudo invulnerável
    if (p.hasShield) {
      p.shieldTimer = Math.max(0, p.shieldTimer - dt);
      if (p.shieldTimer <= 0) p.hasShield = false;
    }

    // 1. Zonas Especiais (Inversão de Controles e Gravidade)
    p.isReversed = false;
    p.isGravityInverted = false;

    if (this.level.traps) {
      for (const t of this.level.traps) {
        if (t.type === 'reverse_controls_zone') {
          if (p.x + p.w > t.x && p.x < t.x + t.w && p.y + p.h > t.y && p.y < t.y + t.h) {
            p.isReversed = true;
          }
        }
        if (t.type === 'gravity_invert_zone') {
          if (p.x + p.w > t.x && p.x < t.x + t.w && p.y + p.h > t.y && p.y < t.y + t.h) {
            p.isGravityInverted = true;
          }
        }
      }
    }

    // 2. Movimento Horizontal com Aceleração Suave
    let moveDir = 0;
    if (this.keys.left) moveDir -= 1;
    if (this.keys.right) moveDir += 1;
    if (p.isReversed) moveDir = -moveDir;

    p.vx = moveDir * p.speed;

    // Emite rastro ao correr
    if (Math.abs(p.vx) > 50 && p.isGrounded) {
      juice.emitTrail(p.x, p.y, p.w, p.h, p.trailColor);
    }

    // 3. Gravidade e Pulo com Coyote Time & Jump Buffer
    const gravMult = (this.level.traps && this.level.traps.some(t => t.type === 'low_gravity_level')) ? 0.45 : 1.0;
    const curGravity = p.gravity * gravMult * (p.isGravityInverted ? -1 : 1);
    const curJumpForce = p.jumpForce * (p.isGravityInverted ? -1 : 1);

    if (p.isGrounded) {
      p.coyoteTimer = 0.12; // 120ms Coyote Time
    } else {
      p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    }

    p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);

    if (p.jumpBuffer > 0 && p.coyoteTimer > 0) {
      p.vy = curJumpForce;
      p.jumpBuffer = 0;
      p.coyoteTimer = 0;
      p.isGrounded = false;
      p.scaleX = 0.8;
      p.scaleY = 1.25; // Stretch no salto
      sound.playJump();
      if (this.onJumpCallback) this.onJumpCallback();
    }

    // Aplica gravidade
    p.vy += curGravity * dt;

    // Guarda Anti-NaN para evitar física quebrada
    if (!Number.isFinite(p.x) || Number.isNaN(p.x)) p.x = 80;
    if (!Number.isFinite(p.y) || Number.isNaN(p.y)) p.y = 440;
    if (!Number.isFinite(p.vx) || Number.isNaN(p.vx)) p.vx = 0;
    if (!Number.isFinite(p.vy) || Number.isNaN(p.vy)) p.vy = 0;

    // 4. Integração de Movimento e Colisão AABB
    p.x += p.vx * dt;
    this.resolveHorizontalCollisions();

    p.y += p.vy * dt;
    this.resolveVerticalCollisions();

    // Retorno Elástico de Escala (Squash & Stretch)
    p.scaleX += (1.0 - p.scaleX) * Math.min(1.0, dt * 12);
    p.scaleY += (1.0 - p.scaleY) * Math.min(1.0, dt * 12);

    // 5. Atualização de Armadilhas Dinâmicas
    this.updateTraps(dt);

    // 6. Coleta de Estrelas Físicas (Hitbox real obrigatória)
    if (this.level.physicalStars) {
      for (const st of this.level.physicalStars) {
        if (!st.collected) {
          const dist = Math.hypot((p.x + p.w / 2) - st.x, (p.y + p.h / 2) - st.y);
          if (dist < 26) {
            st.collected = true;
            this.starsCollected++;
            sound.playStarCollect();
            juice.emitStarCollect(st.x, st.y);
            if (this.onStarCollected) {
              this.onStarCollected(this.starsCollected);
            }
          }
        }
      }
    }

    // 7. Coleta de Bits Quânticos
    if (this.level.quantumBits) {
      for (const bit of this.level.quantumBits) {
        if (!bit.collected) {
          const dist = Math.hypot((p.x + p.w / 2) - bit.x, (p.y + p.h / 2) - bit.y);
          if (dist < 24) {
            bit.collected = true;
            this.bitsCollected++;
            sound.playBitCollect();
            juice.emitBitCollect(bit.x, bit.y);
            SaveManager.addQuantumBits(10);
            if (this.onBitCollected) {
              this.onBitCollected(this.bitsCollected);
            }
          }
        }
      }
    }

    // 8. Colisão com Espinhos
    for (const sp of this.level.spikes) {
      if (this.checkSpikeCollision(p, sp)) {
        this.killPlayer();
        return;
      }
    }

    // 9. Queda no Abismo
    if (p.y > this.vh + 60 || p.y < -100) {
      this.killPlayer();
      return;
    }

    // 10. Chegada na Porta de Saída
    const d = this.level.door;
    if (p.x + p.w > d.x && p.x < d.x + 36 && p.y + p.h > d.y && p.y < d.y + 48) {
      this.winLevel();
    }
  }

  resolveHorizontalCollisions() {
    const p = this.player;
    for (const plat of this.level.platforms) {
      if (plat.invisible && !plat.revealed) continue;
      if (p.x + p.w > plat.x && p.x < plat.x + plat.w && p.y + p.h > plat.y && p.y < plat.y + plat.h) {
        if (p.vx > 0) p.x = plat.x - p.w;
        else if (p.vx < 0) p.x = plat.x + plat.w;
      }
    }
  }

  resolveVerticalCollisions() {
    const p = this.player;
    p.isGrounded = false;

    for (const plat of this.level.platforms) {
      if (plat.invisible && !plat.revealed) continue;
      if (p.x + p.w > plat.x && p.x < plat.x + plat.w && p.y + p.h > plat.y && p.y < plat.y + plat.h) {
        if (p.vy > 0 && !p.isGravityInverted) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.isGrounded = true;

          // Efeito de esteira horizontal
          if (plat.isConveyor) {
            p.x += plat.speed * 0.016;
          }

          // Piso falso caindo
          if ((plat.id === 'fake_floor_2' || plat.id === 'step_1' || plat.id === 'step_2' || plat.id === 'step_3' || plat.id === 'boss_fake') && !plat.isFalling) {
            plat.isFalling = true;
            sound.playTrapTrigger();
          }
        } else if (p.vy < 0 && p.isGravityInverted) {
          p.y = plat.y + plat.h;
          p.vy = 0;
          p.isGrounded = true;
        } else if (p.vy < 0 && !p.isGravityInverted) {
          p.y = plat.y + plat.h;
          p.vy = 0;
        } else if (p.vy > 0 && p.isGravityInverted) {
          p.y = plat.y - p.h;
          p.vy = 0;
        }
      }
    }
  }

  updateTraps(dt) {
    const p = this.player;
    if (!this.level.traps) return;

    for (const t of this.level.traps) {
      // 1. Porta que Foge
      if (t.type === 'runaway_door') {
        const door = this.level.door;
        const dist = Math.abs(p.x - door.x);
        if (dist < t.triggerDist && !t.activated) {
          t.activated = true;
          door.x += t.shiftX;
          sound.playTrapTrigger();
          juice.addTrauma(0.3);
        }
      }

      // 2. Piso que Desaba
      if (t.type === 'falling_floor') {
        const targetPlat = this.level.platforms.find(pl => pl.id === t.targetId);
        if (targetPlat && targetPlat.isFalling) {
          targetPlat.fallSpeed = (targetPlat.fallSpeed || 0) + 1300 * dt;
          targetPlat.y += targetPlat.fallSpeed * dt;
        }
      }

      // 3. Teto de Espinhos que Cai
      if (t.type === 'falling_ceiling') {
        if (p.x > t.triggerX && !t.activated) {
          t.activated = true;
          sound.playTrapTrigger();
          juice.addTrauma(0.4);
        }
        if (t.activated) {
          t.vy = (t.vy || 0) + 1900 * dt;
          t.y += t.vy * dt;
          if (p.x + p.w > t.x && p.x < t.x + t.w && p.y + p.h > t.y && p.y < t.y + t.h) {
            this.killPlayer();
          }
        }
      }

      // 4. Espinho que Brota do Piso
      if (t.type === 'pop_spike') {
        if (p.x > t.triggerX && !t.activated) {
          t.activated = true;
          sound.playTrapTrigger();
          juice.addTrauma(0.3);
        }
        if (t.activated && t.currentY > t.targetY) {
          t.currentY -= 360 * dt;
          if (p.x + p.w > t.x - 16 && p.x < t.x + 16 && p.y + p.h > t.currentY && p.y < t.currentY + 30) {
            this.killPlayer();
          }
        }
      }

      // 5. Porta que Cai no Abismo
      if (t.type === 'falling_door') {
        const door = this.level.door;
        if (p.x > t.triggerX && !t.activated) {
          t.activated = true;
          door.isFalling = true;
          sound.playTrapTrigger();
          juice.addTrauma(0.35);
        }
        if (door.isFalling) {
          door.vy = (door.vy || 0) + 1300 * dt;
          door.y += door.vy * dt;
          if (door.y > this.vh + 50 && t.spawnRealAt && !door.respawned) {
            door.respawned = true;
            door.isFalling = false;
            door.x = t.spawnRealAt.x;
            door.y = t.spawnRealAt.y;
            door.vy = 0;
            sound.playGlitch();
          }
        }
      }

      // 6. Laser Rítmico
      if (t.type === 'laser_barrier') {
        t.timer += dt;
        if (t.isActive && t.timer >= t.activeTime) {
          t.isActive = false;
          t.timer = 0;
        } else if (!t.isActive && t.timer >= t.inactiveTime) {
          t.isActive = true;
          t.timer = 0;
          sound.playGlitch();
        }
        if (t.isActive) {
          if (p.x + p.w > t.x && p.x < t.x + t.w && p.y + p.h > t.y && p.y < t.y + t.h) {
            this.killPlayer();
          }
        }
      }

      // 7. Espinho Perseguidor Horizontal
      if (t.type === 'charging_spike') {
        const sp = this.level.spikes.find(s => s.id === t.targetId);
        if (sp && p.x > t.triggerX && !t.activated) {
          t.activated = true;
          sp.isMoving = true;
          sp.vx = t.speed;
          sound.playTrapTrigger();
        }
        if (sp && sp.isMoving) {
          sp.x += sp.vx * dt;
        }
      }

      // 8. Teto Descente Contínuo
      if (t.type === 'slow_falling_ceiling') {
        if (t.y < t.maxDropY) {
          t.y += t.speed * dt;
        }
        if (p.x + p.w > t.x && p.x < t.x + t.w && p.y + p.h > t.y && p.y < t.y + t.h) {
          this.killPlayer();
        }
      }

      // 9. Ponto Cego (Revelação por Proximidade)
      if (t.type === 'reveal_on_proximity') {
        for (const pl of this.level.platforms) {
          if (pl.isInvisible) {
            const dist = Math.hypot((p.x + p.w / 2) - (pl.x + pl.w / 2), (p.y + p.h / 2) - (pl.y + pl.h / 2));
            pl.revealed = dist < t.distance;
          }
        }
      }

      // 10. Embaralhamento da Porta (3 Pulos)
      if (t.type === 'triple_shuffle_door') {
        const door = this.level.door;
        const dist = Math.hypot((p.x + p.w / 2) - (door.x + 18), (p.y + p.h / 2) - (door.y + 24));
        if (dist < 90 && t.currentIdx < t.targets.length) {
          const target = t.targets[t.currentIdx];
          door.x = target.x;
          door.y = target.y;
          t.currentIdx++;
          sound.playTrapTrigger();
          juice.addTrauma(0.25);
        }
      }

      // 11. Teleporte pelo Abismo
      if (t.type === 'bottom_teleport_zone') {
        if (p.y > t.triggerY) {
          p.x = t.targetX;
          p.y = t.targetY;
          p.vy = -300;
          sound.playGlitch();
          juice.addTrauma(0.3);
        }
      }
    }
  }

  checkSpikeCollision(p, sp) {
    return (
      p.x + p.w > sp.x + 4 &&
      p.x < sp.x + sp.w - 4 &&
      p.y + p.h > sp.y + 6 &&
      p.y < sp.y + sp.h
    );
  }

  render() {
    const ctx = this.ctx;
    ctx.save();

    // 1. Fundo do Mainframe Cibernético
    juice.renderBackground(ctx, window.innerWidth, window.innerHeight);

    // 2. Aplica Escala e Screen Shake Trauma²
    ctx.translate(this.offsetX + juice.shakeOffsetX, this.offsetY + juice.shakeOffsetY);
    if (juice.shakeAngle !== 0) {
      ctx.rotate(juice.shakeAngle);
    }
    ctx.scale(this.scale, this.scale);

    // Área do Jogo
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, this.vw, this.vh);

    // 3. Renderiza Zonas Especiais (Inversão)
    if (this.level.traps) {
      for (const t of this.level.traps) {
        if (t.type === 'reverse_controls_zone') {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.16)';
          ctx.fillRect(t.x, t.y, t.w, t.h);
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(t.x, t.y, t.w, t.h);
          ctx.setLineDash([]);
          ctx.fillStyle = '#c084fc';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('⚡ CONTROLES INVERTIDOS', t.x + 10, t.y + 24);
        }
        if (t.type === 'gravity_invert_zone') {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
          ctx.fillRect(t.x, t.y, t.w, t.h);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.strokeRect(t.x, t.y, t.w, t.h);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('▲ GRAVIDADE INVERTIDA (TETO)', t.x + 10, t.y + 24);
        }
        if (t.type === 'laser_barrier' && t.isActive) {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.fillRect(t.x, t.y, t.w, t.h);
          ctx.shadowBlur = 0;
        }
        if (t.type === 'slow_falling_ceiling') {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(t.x, t.y, t.w, t.h);
          ctx.strokeStyle = '#fff';
          ctx.strokeRect(t.x, t.y, t.w, t.h);
        }
      }
    }

    // 4. Renderiza Plataformas
    ctx.lineWidth = 2;
    for (const plat of this.level.platforms) {
      if (plat.isInvisible && !plat.revealed) continue;

      ctx.fillStyle = plat.isConveyor ? '#0369a1' : '#1e293b';
      ctx.strokeStyle = plat.isFalling ? '#f43f5e' : '#38bdf8';
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

      if (plat.isConveyor) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('➔ ESTEIRA ➔', plat.x + 10, plat.y + 24);
      }
    }

    // 5. Renderiza Armadilhas Dinâmicas Visíveis
    if (this.level.traps) {
      for (const t of this.level.traps) {
        if (t.type === 'falling_ceiling') {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(t.x, t.y, t.w, t.h);
          ctx.strokeStyle = '#fff';
          ctx.strokeRect(t.x, t.y, t.w, t.h);
        } else if (t.type === 'pop_spike' && t.activated) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(t.x, t.currentY);
          ctx.lineTo(t.x - 16, t.currentY + 30);
          ctx.lineTo(t.x + 16, t.currentY + 30);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // 6. Renderiza Espinhos Fixos
    ctx.fillStyle = '#ef4444';
    for (const sp of this.level.spikes) {
      ctx.beginPath();
      ctx.moveTo(sp.x + sp.w / 2, sp.y);
      ctx.lineTo(sp.x, sp.y + sp.h);
      ctx.lineTo(sp.x + sp.w, sp.y + sp.h);
      ctx.closePath();
      ctx.fill();
    }

    // 7. Renderiza Estrelas Físicas (Hitbox visível com rotação pulsante)
    if (this.level.physicalStars) {
      const starPulse = 1.0 + Math.sin(performance.now() * 0.006) * 0.15;
      for (const st of this.level.physicalStars) {
        if (!st.collected) {
          ctx.save();
          ctx.translate(st.x, st.y);
          ctx.scale(starPulse, starPulse);
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 14;
          ctx.font = 'bold 22px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', 0, 0);
          ctx.restore();
        }
      }
    }

    // 8. Renderiza Bits Quânticos Colecionáveis
    if (this.level.quantumBits) {
      const bitPulse = 1.0 + Math.cos(performance.now() * 0.008) * 0.12;
      for (const bit of this.level.quantumBits) {
        if (!bit.collected) {
          ctx.save();
          ctx.translate(bit.x, bit.y);
          ctx.scale(bitPulse, bitPulse);
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // 9. Renderiza Porta de Saída
    const d = this.level.door;
    ctx.save();
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 16;
    ctx.fillRect(d.x, d.y, 36, 48);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(d.x + 6, d.y + 6, 24, 42);
    ctx.fillStyle = '#22c55e';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', d.x + 18, d.y - 6);
    ctx.restore();

    // 10. Renderiza Jogador com Squash & Stretch e Escudo
    const p = this.player;
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    ctx.scale(p.scaleX, p.scaleY);

    // Escudo de Invulnerabilidade
    if (p.hasShield) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, p.w * 0.9, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Corpo do Jogador
    ctx.fillStyle = p.isDead ? '#ef4444' : p.color;
    ctx.shadowColor = p.isDead ? '#ef4444' : p.color;
    ctx.shadowBlur = 14;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

    // Olhos cômicos
    ctx.fillStyle = '#000';
    ctx.fillRect(-p.w / 4 - 2, -p.h / 4, 4, 4);
    ctx.fillRect(p.w / 4 - 2, -p.h / 4, 4, 4);
    ctx.restore();

    // 11. Partículas Procedurais
    juice.renderParticles(ctx);

    ctx.restore();

    // 12. Shader de Glitch em Tela Cheia
    juice.applyGlitchFilter(ctx, window.innerWidth, window.innerHeight);
  }
}
