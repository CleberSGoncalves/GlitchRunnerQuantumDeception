// src/main.js
// Orquestrador Principal do Jogo: Intro FluidCleb, Lore, ModalController, CrazyGames SDK v3 e Meta-Game

import { sound } from './audio.js';
import { SaveManager } from './storage.js';
import { LEVELS, SECTORS } from './levels.js';
import { TrollPlatformerGame } from './game.js';
import { crazyGames } from './crazygames.js';

// Helper Safe DOM para blindar contra TypeError: null.textContent
function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ── Máquina de Estados dos Modais & Anti-Softlock ──────────────────
class ModalController {
  constructor() {
    this.modalStack = [];
    this.game = null;
  }

  setGame(game) {
    this.game = game;
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('hidden');
    if (!this.modalStack.includes(modalId)) {
      this.modalStack.push(modalId);
    }
    if (this.game) {
      this.game.isPaused = true;
      crazyGames.gameplayStop();
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
    this.modalStack = this.modalStack.filter(id => id !== modalId);

    // Se o modal fechado for a tela de vitória, desativa o roundOver
    if (modalId === 'modal-victory') {
      if (this.game) {
        this.game.isRoundOver = false;
        this.game.isPaused = false;
      }
      return;
    }

    // Se o jogador estava na tela de vitória (isRoundOver = true) e fechou um modal secundário,
    // reabre o modal de vitória em vez de deixar o jogo congelado sem interface!
    if (this.game && this.game.isRoundOver && modalId !== 'modal-victory') {
      const modalVic = document.getElementById('modal-victory');
      if (modalVic && !this.modalStack.includes('modal-victory')) {
        modalVic.classList.remove('hidden');
        this.modalStack.push('modal-victory');
        return;
      }
    }

    // Se não há mais modais abertos, retoma o jogo normalmente
    if (this.modalStack.length === 0 && this.game) {
      this.game.isPaused = false;
      crazyGames.gameplayStart();
    }
  }

  closeAll() {
    this.modalStack.forEach(id => {
      const modal = document.getElementById(id);
      if (modal) modal.classList.add('hidden');
    });
    this.modalStack = [];
    if (this.game) {
      this.game.isPaused = false;
    }
  }
}

export const modalController = new ModalController();

// ── Gerenciador de Localização (EN / PT-BR) ─────────────────────────
class LocalizationManager {
  constructor() {
    const s = SaveManager.get();
    const browserLang = (navigator.language || '').toLowerCase();
    this.currentLocale = s.locale || (browserLang.startsWith('pt') ? 'pt' : 'en');
  }

  toggle() {
    this.currentLocale = this.currentLocale === 'en' ? 'pt' : 'en';
    const s = SaveManager.get();
    s.locale = this.currentLocale;
    SaveManager.save(s);
    return this.currentLocale;
  }

  isPt() {
    return this.currentLocale === 'pt';
  }
}

export const i18n = new LocalizationManager();

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const introCanvas = document.getElementById('intro-canvas');
  if (!canvas) return;

  // 1. Inicializa CrazyGames SDK v3 em background sem bloquear
  crazyGames.init().catch(() => {});

  // 2. Inicializa Engine do Jogo
  const game = new TrollPlatformerGame(canvas);
  modalController.setGame(game);

  // Aplica skin salva
  const save = SaveManager.get();
  const skinColors = {
    cyan: '#00f0ff',
    gold: '#fbbf24',
    violet: '#c084fc',
    matrix: '#22c55e',
    crimson: '#ef4444'
  };
  game.setSkin(skinColors[save.selectedSkin || 'cyan'] || '#00f0ff');

  // Elementos do HUD
  const elStarFill = document.getElementById('hud-star-fill');
  const marker1 = document.getElementById('star-marker-1');
  const marker2 = document.getElementById('star-marker-2');
  const marker3 = document.getElementById('star-marker-3');
  const btnEarlyFinish = document.getElementById('btn-early-finish');
  const hudHint = document.getElementById('hud-level-hint');
  const btnQuickRetry = document.getElementById('btn-quick-retry');
  const btnSound = document.getElementById('btn-sound-toggle');
  const btnLang = document.getElementById('btn-lang-toggle');

  const updateHUDStars = (starsCount) => {
    const pct = Math.min(100, (starsCount / 3) * 100);
    if (elStarFill) elStarFill.style.width = `${pct}%`;

    if (marker1) marker1.className = `star-marker star-1 ${starsCount >= 1 ? 'lit' : ''}`;
    if (marker2) marker2.className = `star-marker star-2 ${starsCount >= 2 ? 'lit' : ''}`;
    if (marker3) marker3.className = `star-marker star-3 ${starsCount >= 3 ? 'lit' : ''}`;

    if (btnEarlyFinish) {
      if (starsCount >= 1) {
        btnEarlyFinish.classList.remove('hidden');
      } else {
        btnEarlyFinish.classList.add('hidden');
      }
    }
  };

  if (btnEarlyFinish) {
    btnEarlyFinish.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      game.winLevel();
    });
  }

  if (btnQuickRetry) {
    btnQuickRetry.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      game.fastRetry();
    });
  }

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      sound.init();
      const isMuted = sound.toggleMute();
      btnSound.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  // 3. Callbacks do Jogo
  game.onStarCollected = (starsCount) => {
    updateHUDStars(starsCount);
    SaveManager.updateQuest('star', 1);
  };

  game.onBitCollected = () => {
    const s = SaveManager.get();
    safeSetText('hud-bits-val', `💎 ${s.quantumBits || 0}`);
  };

  game.onJumpCallback = () => {
    SaveManager.updateQuest('jump', 1);
  };

  game.onLevelUpdate = (lvl, deaths, stars) => {
    const isPt = i18n.isPt();
    safeSetText('hud-level-title', isPt ? `NÍVEL ${lvl.id}` : `LVL ${lvl.id}`);
    safeSetText('hud-death-val', `💀 ${deaths}`);
    const currentSave = SaveManager.get();
    safeSetText('hud-bits-val', `💎 ${currentSave.quantumBits || 0}`);
    if (hudHint) {
      hudHint.textContent = isPt ? lvl.hintPt : lvl.hint;
    }
    updateHUDStars(stars);
  };

  game.onVictoryCallback = (lvl, deaths, starsWon, bitsEarned) => {
    const isPt = i18n.isPt();
    safeSetText('vic-title', isPt ? `${lvl.namePt} CONCLUÍDO!` : `${lvl.name} BREACHED!`);
    safeSetText('vic-stars', '★'.repeat(starsWon) + '☆'.repeat(3 - starsWon));
    safeSetText('vic-stats', isPt ? `Mortes: ${deaths} • Estrelas Físicas: ${starsWon}/3` : `Deaths: ${deaths} • Physical Stars: ${starsWon}/3`);
    safeSetText('vic-reward-amount', `+${bitsEarned} QUANTUM BITS`);

    modalController.openModal('modal-victory');

    // Atualiza missões diárias
    SaveManager.updateQuest('clear', 1);
    if (deaths === 0) {
      SaveManager.updateQuest('flawless', 1);
    }

    // Solicita anúncio de transição (Midgame Ad) seguro respeitando intervalo de 3 min
    crazyGames.requestMidgameAd();
  };

  // 4. Dobrar Recompensa com Rewarded Ad
  const btnVicDouble = document.getElementById('btn-vic-double');
  if (btnVicDouble) {
    btnVicDouble.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      crazyGames.requestRewardedAd({
        onReward: () => {
          const starsWon = Math.max(1, game.starsCollected);
          const extraBits = 25 + starsWon * 20;
          SaveManager.addQuantumBits(extraBits);
          const s = SaveManager.get();
          safeSetText('hud-bits-val', `💎 ${s.quantumBits || 0}`);
          safeSetText('vic-reward-amount', `+${extraBits * 2} BITS (DOBRADO!)`);
          btnVicDouble.style.display = 'none';
          sound.playStarCollect();
        },
        onError: () => {
          console.warn('[Rewarded Ad] Falha ou bloqueado por AdBlock.');
        }
      });
    });
  }

  // 5. Próximo Nível
  const btnVicNext = document.getElementById('btn-vic-next');
  if (btnVicNext) {
    btnVicNext.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      modalController.closeModal('modal-victory');
      const nextIdx = (game.currentLevelIndex + 1) % LEVELS.length;
      game.loadLevel(nextIdx);
      crazyGames.gameplayStart();
    });
  }

  // 6. Grid de Níveis (1 a 18)
  const renderLevelsGrid = () => {
    const grid = document.getElementById('levels-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const s = SaveManager.get();
    const unlocked = s.unlockedLevel || 1;
    const isPt = i18n.isPt();

    LEVELS.forEach((lvl, idx) => {
      const isLocked = lvl.id > unlocked;
      const data = s.levels[lvl.id] || { deaths: 0, completed: false, stars: 0 };
      const card = document.createElement('div');
      card.className = `level-card ${isLocked ? 'locked' : ''} ${game.currentLevelIndex === idx ? 'current' : ''}`;

      const starsDisplay = data.completed ? ('★'.repeat(data.stars || 1) + '☆'.repeat(3 - (data.stars || 1))) : '☆☆☆';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 13px; font-weight: 900; color: #38bdf8;">#${lvl.id < 10 ? '0' + lvl.id : lvl.id}</span>
          <span style="font-size: 11px; color: #fbbf24;">${starsDisplay}</span>
        </div>
        <div style="font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${isPt ? lvl.namePt : lvl.name}
        </div>
        <div style="font-size: 10px; color: ${data.completed ? '#22c55e' : '#94a3b8'};">
          ${data.completed ? (isPt ? '✓ CONCLUÍDO' : '✓ CLEARED') : (isLocked ? (isPt ? '🔒 BLOQUEADO' : '🔒 LOCKED') : (isPt ? 'PENDENTE' : 'READY'))}
        </div>
      `;

      if (!isLocked) {
        card.addEventListener('click', () => {
          sound.init();
          sound.playClick();
          modalController.closeAll();
          game.loadLevel(idx);
          crazyGames.gameplayStart();
        });
      }
      grid.appendChild(card);
    });
  };

  const btnOpenMenu = document.getElementById('btn-open-menu');
  const btnCloseMenu = document.getElementById('btn-close-menu');
  if (btnOpenMenu) {
    btnOpenMenu.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      renderLevelsGrid();
      modalController.openModal('modal-level-select');
    });
  }
  if (btnCloseMenu) {
    btnCloseMenu.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      modalController.closeModal('modal-level-select');
    });
  }

  // 7. Daily Login Calendar (7 Dias)
  const renderDailyLogin = () => {
    const grid = document.getElementById('daily-login-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const s = SaveManager.get();
    const isPt = i18n.isPt();
    const canClaim = SaveManager.canClaimDailyLogin();
    const currentStreak = s.dailyLogin.streak || 0;
    const rewards = [50, 75, 100, 150, 200, 250, 400];

    rewards.forEach((rew, idx) => {
      const dayNum = idx + 1;
      const isPast = dayNum <= currentStreak && !canClaim;
      const isToday = canClaim && (dayNum === currentStreak + 1 || (currentStreak === 7 && dayNum === 1));
      const row = document.createElement('div');
      row.className = `login-row ${isPast ? 'claimed' : ''} ${isToday ? 'active' : ''}`;
      row.innerHTML = `
        <span style="font-weight: 700;">${isPt ? `Dia ${dayNum}` : `Day ${dayNum}`}</span>
        <span style="color: #fbbf24; font-weight: 900;">+${rew} BITS 💎</span>
        <span style="font-size: 11px; color: ${isPast ? '#22c55e' : (isToday ? '#fbbf24' : '#64748b')};">
          ${isPast ? (isPt ? '✓ COLETADO' : '✓ CLAIMED') : (isToday ? (isPt ? 'DISPONÍVEL' : 'AVAILABLE') : (isPt ? 'EM BREVE' : 'UPCOMING'))}
        </span>
      `;
      grid.appendChild(row);
    });

    const btnClaim = document.getElementById('btn-claim-daily');
    if (btnClaim) {
      btnClaim.disabled = !canClaim;
      btnClaim.textContent = canClaim ? (isPt ? 'RESGATAR RECOMPENSA DE HOJE' : 'CLAIM TODAY\'S REWARD') : (isPt ? 'RECOMPENSA JÁ COLETADA HOJE' : 'ALREADY CLAIMED TODAY');
    }
  };

  const btnOpenLogin = document.getElementById('btn-open-login');
  const hubBtnLogin = document.getElementById('hub-btn-login');
  const btnCloseLogin = document.getElementById('btn-close-login');
  const btnClaimDaily = document.getElementById('btn-claim-daily');

  const openDailyLoginModal = () => {
    sound.init();
    sound.playClick();
    renderDailyLogin();
    modalController.openModal('modal-daily-login');
  };

  if (btnOpenLogin) btnOpenLogin.addEventListener('click', openDailyLoginModal);
  if (hubBtnLogin) hubBtnLogin.addEventListener('click', openDailyLoginModal);
  if (btnCloseLogin) {
    btnCloseLogin.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      modalController.closeModal('modal-daily-login');
    });
  }

  if (btnClaimDaily) {
    btnClaimDaily.addEventListener('click', () => {
      sound.init();
      const res = SaveManager.claimDailyLogin();
      if (res) {
        sound.playStarCollect();
        renderDailyLogin();
        const s = SaveManager.get();
        safeSetText('hud-bits-val', `💎 ${s.quantumBits || 0}`);
      }
    });
  }

  // 8. Quests & Missões
  const renderQuests = () => {
    const list = document.getElementById('quests-list');
    if (!list) return;
    list.innerHTML = '';
    const s = SaveManager.get();
    const isPt = i18n.isPt();

    const titles = {
      jump_15: { en: 'Perform 15 Quantum Jumps', pt: 'Realizar 15 Saltos Quânticos' },
      clear_3: { en: 'Breach 3 Mainframe Levels', pt: 'Concluir 3 Fases do Mainframe' },
      stars_5: { en: 'Collect 5 Physical Stars', pt: 'Coletar 5 Estrelas Físicas' },
      clear_12: { en: 'Breach 12 Sectors (Weekly)', pt: 'Concluir 12 Fases (Semanal)' },
      no_deaths_5: { en: 'Clear 5 Levels with 0 Deaths', pt: 'Concluir 5 Fases com 0 Mortes' }
    };

    s.quests.forEach(q => {
      const item = document.createElement('div');
      item.className = 'quest-item';
      const info = titles[q.id] || { en: 'Mission', pt: 'Missão' };
      const title = isPt ? info.pt : info.en;
      const isReady = q.current >= q.target && !q.claimed;

      item.innerHTML = `
        <div>
          <div style="font-size: 12px; font-weight: 700; color: #fff;">${title}</div>
          <div style="font-size: 11px; color: #94a3b8;">${q.current}/${q.target} • <span style="color: #fbbf24;">+${q.reward} BITS</span></div>
        </div>
        <div>
          ${q.claimed
            ? '<span style="font-size: 11px; color: #22c55e;">✓ CONCLUÍDO</span>'
            : `<button class="btn-primary" style="padding: 6px 12px; font-size: 11px;" ${!isReady ? 'disabled style="opacity: 0.5;"' : ''}>${isPt ? 'RESGATAR' : 'CLAIM'}</button>`
          }
        </div>
      `;

      if (isReady) {
        const btn = item.querySelector('button');
        if (btn) {
          btn.addEventListener('click', () => {
            sound.init();
            const rew = SaveManager.claimQuestReward(q.id);
            if (rew > 0) {
              sound.playStarCollect();
              renderQuests();
              const curS = SaveManager.get();
              safeSetText('hud-bits-val', `💎 ${curS.quantumBits || 0}`);
            }
          });
        }
      }
      list.appendChild(item);
    });
  };

  const btnOpenQuests = document.getElementById('btn-open-quests');
  const hubBtnQuests = document.getElementById('hub-btn-quests');
  const btnCloseQuests = document.getElementById('btn-close-quests');

  const openQuestsModal = () => {
    sound.init();
    sound.playClick();
    renderQuests();
    modalController.openModal('modal-quests');
  };

  if (btnOpenQuests) btnOpenQuests.addEventListener('click', openQuestsModal);
  if (hubBtnQuests) hubBtnQuests.addEventListener('click', openQuestsModal);
  if (btnCloseQuests) {
    btnCloseQuests.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      modalController.closeModal('modal-quests');
    });
  }

  // 9. Conquistas & Achievements
  const renderAchievements = () => {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const s = SaveManager.get();
    const isPt = i18n.isPt();

    const achs = [
      { id: 'first_clear', title: 'First Breach', titlePt: 'Primeira Invasão', desc: 'Clear level 1', descPt: 'Conclua a fase 1', unlocked: (s.unlockedLevel || 1) > 1 },
      { id: 'star_hunter', title: 'Star Gatherer', titlePt: 'Caçador de Estrelas', desc: 'Reach 15 stars', descPt: 'Acumule 15 estrelas físicas', unlocked: Object.values(s.levels || {}).reduce((a, b) => a + (b.stars || 0), 0) >= 15 },
      { id: 'master_runner', title: 'Quantum Master', titlePt: 'Mestre Quântico', desc: 'Clear all 18 levels', descPt: 'Conclua todas as 18 fases', unlocked: (s.unlockedLevel || 1) >= 18 },
      { id: 'bit_rich', title: 'Byte Hoarder', titlePt: 'Acumulador de Bytes', desc: 'Have 500+ Quantum Bits', descPt: 'Tenha mais de 500 Bits', unlocked: (s.quantumBits || 0) >= 500 }
    ];

    achs.forEach(a => {
      const item = document.createElement('div');
      item.className = 'ach-item';
      item.innerHTML = `
        <div>
          <div style="font-weight: 700; color: ${a.unlocked ? '#fbbf24' : '#fff'};">${isPt ? a.titlePt : a.title}</div>
          <div style="font-size: 11px; color: #94a3b8;">${isPt ? a.descPt : a.desc}</div>
        </div>
        <span style="font-size: 14px;">${a.unlocked ? '🏆' : '🔒'}</span>
      `;
      grid.appendChild(item);
    });
  };

  const btnOpenVault = document.getElementById('btn-open-vault');
  const hubBtnVault = document.getElementById('hub-btn-vault');
  const btnCloseVault = document.getElementById('btn-close-vault');

  const openVaultModal = () => {
    sound.init();
    sound.playClick();
    renderAchievements();
    modalController.openModal('modal-achievements');
  };

  if (btnOpenVault) btnOpenVault.addEventListener('click', openVaultModal);
  if (hubBtnVault) hubBtnVault.addEventListener('click', openVaultModal);
  if (btnCloseVault) {
    btnCloseVault.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      modalController.closeModal('modal-achievements');
    });
  }

  // 10. Loja de Skins (Skins Shop)
  const renderSkinsShop = () => {
    const grid = document.getElementById('skins-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const s = SaveManager.get();
    const isPt = i18n.isPt();

    const skins = [
      { id: 'cyan', name: 'Cyan Runner', namePt: 'Corredor Ciano', color: '#00f0ff', price: 0 },
      { id: 'gold', name: 'Quantum Gold', namePt: 'Ouro Quântico', color: '#fbbf24', price: 150 },
      { id: 'violet', name: 'Neon Violet', namePt: 'Violeta Neon', color: '#c084fc', price: 200 },
      { id: 'matrix', name: 'Matrix Hacker', namePt: 'Hacker da Matrix', color: '#22c55e', price: 250 },
      { id: 'crimson', name: 'Crimson Glitch', namePt: 'Glitch Carmesim', color: '#ef4444', price: 300 }
    ];

    skins.forEach(sk => {
      const isUnlocked = s.unlockedSkins.includes(sk.id);
      const isSelected = s.selectedSkin === sk.id;
      const card = document.createElement('div');
      card.className = 'skin-card';
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 24px; height: 28px; background: ${sk.color}; border-radius: 4px; box-shadow: 0 0 10px ${sk.color};"></div>
          <div>
            <div style="font-weight: 700; color: #fff;">${isPt ? sk.namePt : sk.name}</div>
            <div style="font-size: 11px; color: #fbbf24;">${sk.price === 0 ? (isPt ? 'GRÁTIS' : 'FREE') : `${sk.price} BITS`}</div>
          </div>
        </div>
        <div>
          ${isSelected
            ? `<button class="btn-primary" style="padding: 6px 12px; font-size: 11px;" disabled>${isPt ? 'EQUIPADO' : 'EQUIPPED'}</button>`
            : isUnlocked
              ? `<button class="btn-secondary" style="padding: 6px 12px; font-size: 11px;" data-skin="${sk.id}">${isPt ? 'EQUIPAR' : 'EQUIP'}</button>`
              : `<button class="btn-primary" style="padding: 6px 12px; font-size: 11px;" data-buy="${sk.id}">${isPt ? 'COMPRAR' : 'BUY'}</button>`
          }
        </div>
      `;

      const btnEquip = card.querySelector('[data-skin]');
      if (btnEquip) {
        btnEquip.addEventListener('click', () => {
          sound.init();
          sound.playClick();
          SaveManager.selectSkin(sk.id);
          game.setSkin(sk.color);
          renderSkinsShop();
        });
      }

      const btnBuy = card.querySelector('[data-buy]');
      if (btnBuy) {
        btnBuy.addEventListener('click', () => {
          sound.init();
          if (SaveManager.spendQuantumBits(sk.price)) {
            sound.playStarCollect();
            SaveManager.unlockSkin(sk.id);
            SaveManager.selectSkin(sk.id);
            game.setSkin(sk.color);
            const curS = SaveManager.get();
            safeSetText('hud-bits-val', `💎 ${curS.quantumBits || 0}`);
            renderSkinsShop();
          } else {
            sound.playTrapTrigger();
          }
        });
      }

      grid.appendChild(card);
    });
  };

  const btnOpenShop = document.getElementById('btn-open-shop');
  const hubBtnShop = document.getElementById('hub-btn-shop');
  const btnCloseSkins = document.getElementById('btn-close-skins');

  const openShopModal = () => {
    sound.init();
    sound.playClick();
    renderSkinsShop();
    modalController.openModal('modal-skins');
  };

  if (btnOpenShop) btnOpenShop.addEventListener('click', openShopModal);
  if (hubBtnShop) hubBtnShop.addEventListener('click', openShopModal);
  if (btnCloseSkins) {
    btnCloseSkins.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      modalController.closeModal('modal-skins');
    });
  }

  // 11. Leaderboard Modal
  const btnOpenLeaderboard = document.getElementById('btn-open-leaderboard');
  const hubBtnLeaderboard = document.getElementById('hub-btn-leaderboard');
  const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');

  const openLeaderboardModal = () => {
    sound.init();
    sound.playClick();
    modalController.openModal('modal-leaderboard');
  };

  if (btnOpenLeaderboard) btnOpenLeaderboard.addEventListener('click', openLeaderboardModal);
  if (hubBtnLeaderboard) hubBtnLeaderboard.addEventListener('click', openLeaderboardModal);
  if (btnCloseLeaderboard) {
    btnCloseLeaderboard.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      modalController.closeModal('modal-leaderboard');
    });
  }

  // 12. Roleta da Sorte (Canvas Lucky Wheel)
  const wheelCanvas = document.getElementById('wheel-canvas');
  let wheelAngle = 0;
  let isWheelSpinning = false;

  const wheelPrizes = [
    { label: '50 BITS', bits: 50, color: '#0284c7' },
    { label: '100 BITS', bits: 100, color: '#0f172a' },
    { label: 'SHIELD', shield: true, color: '#38bdf8' },
    { label: '75 BITS', bits: 75, color: '#0f172a' },
    { label: '150 BITS', bits: 150, color: '#f59e0b' },
    { label: '25 BITS', bits: 25, color: '#0f172a' },
    { label: '200 BITS', bits: 200, color: '#10b981' },
    { label: '500 JACKPOT', bits: 500, color: '#ef4444' }
  ];

  const drawWheel = () => {
    if (!wheelCanvas) return;
    const wctx = wheelCanvas.getContext('2d');
    const cx = wheelCanvas.width / 2;
    const cy = wheelCanvas.height / 2;
    const radius = cx - 10;
    const sliceAngle = (Math.PI * 2) / wheelPrizes.length;

    wctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    wctx.save();
    wctx.translate(cx, cy);
    wctx.rotate(wheelAngle);

    wheelPrizes.forEach((p, idx) => {
      const a = idx * sliceAngle;
      wctx.beginPath();
      wctx.moveTo(0, 0);
      wctx.arc(0, 0, radius, a, a + sliceAngle);
      wctx.closePath();
      wctx.fillStyle = p.color;
      wctx.fill();
      wctx.strokeStyle = '#fff';
      wctx.lineWidth = 2;
      wctx.stroke();

      // Rótulo
      wctx.save();
      wctx.rotate(a + sliceAngle / 2);
      wctx.textAlign = 'right';
      wctx.fillStyle = '#fff';
      wctx.font = 'bold 11px sans-serif';
      wctx.fillText(p.label, radius - 14, 4);
      wctx.restore();
    });

    wctx.restore();
  };

  const spinWheelAction = (onFinished = null) => {
    if (isWheelSpinning) return;
    isWheelSpinning = true;

    const spins = 5 + Math.random() * 4;
    const targetAngle = wheelAngle + spins * Math.PI * 2;
    const duration = 3500;
    const startTime = performance.now();
    const startAngle = wheelAngle;

    const anim = (t) => {
      const elapsed = t - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Easing cúbico desacelerando
      const ease = 1 - Math.pow(1 - progress, 3);
      wheelAngle = startAngle + (targetAngle - startAngle) * ease;
      sound.playWheelSpin();
      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(anim);
      } else {
        isWheelSpinning = false;
        // Calcula o prêmio final
        const sliceAngle = (Math.PI * 2) / wheelPrizes.length;
        const normalizedAngle = (wheelAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        // O ponteiro fica no topo (3 * PI / 2)
        const pointerAngle = (Math.PI * 1.5 - normalizedAngle + Math.PI * 2) % (Math.PI * 2);
        const winIdx = Math.floor(pointerAngle / sliceAngle) % wheelPrizes.length;
        const prize = wheelPrizes[winIdx];

        sound.playStarCollect();
        if (prize.bits) {
          SaveManager.addQuantumBits(prize.bits);
          const s = SaveManager.get();
          safeSetText('hud-bits-val', `💎 ${s.quantumBits || 0}`);
        }
        if (prize.shield) {
          game.grantShield(4.0);
        }

        const btnRewarded = document.getElementById('btn-wheel-rewarded');
        if (btnRewarded) btnRewarded.classList.remove('hidden');

        if (onFinished) onFinished(prize);
      }
    };
    requestAnimationFrame(anim);
  };

  const btnOpenWheel = document.getElementById('btn-open-wheel');
  const hubBtnWheel = document.getElementById('hub-btn-wheel');
  const btnCloseWheel = document.getElementById('btn-close-wheel');
  const btnSpinWheel = document.getElementById('btn-spin-wheel');
  const btnWheelRewarded = document.getElementById('btn-wheel-rewarded');

  const openWheelModal = () => {
    sound.init();
    sound.playClick();
    drawWheel();
    modalController.openModal('modal-wheel');
  };

  if (btnOpenWheel) btnOpenWheel.addEventListener('click', openWheelModal);
  if (hubBtnWheel) hubBtnWheel.addEventListener('click', openWheelModal);
  if (btnCloseWheel) {
    btnCloseWheel.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      modalController.closeModal('modal-wheel');
    });
  }

  if (btnSpinWheel) {
    btnSpinWheel.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      spinWheelAction();
    });
  }

  if (btnWheelRewarded) {
    btnWheelRewarded.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      crazyGames.requestRewardedAd({
        onReward: () => {
          spinWheelAction();
        }
      });
    });
  }

  // 13. Alternância de Idioma (EN / PT-BR)
  const updateLocaleUI = () => {
    const isPt = i18n.isPt();
    if (btnLang) btnLang.textContent = isPt ? '🌐 PT' : '🌐 EN';
    const hubLang = document.getElementById('hub-btn-lang');
    if (hubLang) hubLang.textContent = isPt ? '🌐 Idioma PT' : '🌐 Lang EN';

    safeSetText('levels-modal-title', isPt ? 'SETORES DO MAINFRAME QUÂNTICO' : 'QUANTUM MAINFRAME SECTORS');
    safeSetText('daily-modal-title', isPt ? 'RECOMPENSAS DIÁRIAS (7 DIAS)' : 'DAILY LOGIN REWARDS (7 DAYS)');
    safeSetText('daily-modal-subtitle', isPt ? 'Faça login todos os dias para acumular Bits Quânticos!' : 'Log in daily to claim increasing Quantum Bits!');
    safeSetText('quests-modal-title', isPt ? '📜 MISSÕES QUÂNTICAS' : '📜 QUANTUM MISSIONS');
    safeSetText('vault-modal-title', isPt ? '💎 CONQUISTAS DO SISTEMA' : '💎 SYSTEM ACHIEVEMENTS');
    safeSetText('shop-modal-title', isPt ? 'VISUAIS & RASTROS DO OPERADOR' : 'OPERATOR SKINS & TRAILS');
    safeSetText('wheel-modal-title', isPt ? 'ROLETA DA SORTE QUÂNTICA' : 'QUANTUM LUCKY WHEEL');
    safeSetText('vic-reward-label', isPt ? 'Recompensa da Fase:' : 'Reward Earned:');

    if (game.level) {
      safeSetText('hud-level-title', isPt ? `NÍVEL ${game.level.id}` : `LVL ${game.level.id}`);
      if (hudHint) {
        hudHint.textContent = isPt ? game.level.hintPt : game.level.hint;
      }
    }
  };

  if (btnLang) {
    btnLang.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      i18n.toggle();
      updateLocaleUI();
      renderLevelsGrid();
    });
  }
  const hubBtnLang = document.getElementById('hub-btn-lang');
  if (hubBtnLang) {
    hubBtnLang.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      i18n.toggle();
      updateLocaleUI();
      renderLevelsGrid();
    });
  }

  // 14. Controles Mobile Touch (Dock Isolado Anti-Sobreposição)
  const touchLeft = document.getElementById('touch-left');
  const touchRight = document.getElementById('touch-right');
  const touchJump = document.getElementById('touch-jump');

  const bindTouch = (el, onDown, onUp) => {
    if (!el) return;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      sound.init();
      onDown();
    });
    el.addEventListener('pointerup', (e) => {
      e.preventDefault();
      onUp();
    });
    el.addEventListener('pointercancel', (e) => {
      e.preventDefault();
      onUp();
    });
    el.addEventListener('pointerleave', (e) => {
      onUp();
    });
  };

  bindTouch(touchLeft, () => { game.keys.left = true; }, () => { game.keys.left = false; });
  bindTouch(touchRight, () => { game.keys.right = true; }, () => { game.keys.right = false; });
  bindTouch(touchJump, () => {
    game.keys.jump = true;
    game.player.jumpBuffer = 0.15;
  }, () => {
    game.keys.jump = false;
  });

  // 15. FLUIDCLEB INTERACTIVE INTRO (0.0s a 2.8s) com Tap-to-Skip
  let introCompleted = false;

  const proceedToGameplay = (skipped = false) => {
    if (introCompleted) return;
    introCompleted = true;

    if (introCanvas) {
      introCanvas.style.opacity = '0';
      setTimeout(() => {
        if (introCanvas.parentNode) introCanvas.parentNode.removeChild(introCanvas);
      }, 350);
    }

    const s = SaveManager.get();
    const modalLore = document.getElementById('modal-lore');

    // Se o jogador nunca viu a lore, exibe o modal de Lore com Land in Gameplay em 1 clique
    if (!s.loreSeen && modalLore) {
      modalController.openModal('modal-lore');
    } else {
      game.isPaused = false;
      game.isRoundOver = false;
      if (!game.isRunning) game.start();
      crazyGames.gameplayStart();
    }
  };

  const runFluidClebIntro = () => {
    if (!introCanvas) {
      proceedToGameplay(true);
      return;
    }

    const ctx = introCanvas.getContext('2d');
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    introCanvas.width = w * dpr;
    introCanvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Permite pular instantaneamente a splash screen com clique, toque ou tecla
    const instantSkip = () => {
      sound.init();
      proceedToGameplay(true);
    };
    introCanvas.addEventListener('click', instantSkip, { once: true });
    introCanvas.addEventListener('touchstart', instantSkip, { passive: true, once: true });
    window.addEventListener('keydown', instantSkip, { once: true });

    try {
      sound.playFluidClebIntro();
    } catch (e) {}

    const startTime = performance.now();
    const duration = 2800; // 2.8s oficial

    const orbs = [];
    for (let i = 0; i < 22; i++) {
      orbs.push({
        x: w / 2 + (Math.random() - 0.5) * 240,
        y: h + Math.random() * 60,
        targetY: h / 2 - 25,
        radius: 3 + Math.random() * 6,
        color: ['#00f5ff', '#38bdf8', '#0284c7'][Math.floor(Math.random() * 3)]
      });
    }

    const animateIntro = (now) => {
      if (introCompleted) return;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, w, h);

      // Orbes ascendentes em fusão central
      orbs.forEach(orb => {
        orb.y += (orb.targetY - orb.y) * 0.08;
        ctx.save();
        ctx.globalAlpha = Math.min(1, (1 - progress) * 1.5);
        ctx.fillStyle = orb.color;
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Emblema Central e Logo
      const logoAlpha = Math.min(1, progress * 1.8);
      ctx.save();
      ctx.globalAlpha = logoAlpha;
      ctx.translate(w / 2, h / 2 - 25);

      // Gota Metálica
      ctx.fillStyle = '#0284c7';
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(0, -32, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(0, -32, 9, 0, Math.PI * 2);
      ctx.fill();

      // Tipografia Neon
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00f5ff';
      ctx.font = '900 36px sans-serif';
      ctx.fillText('FLUIDCLEB', 0, 24);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 13px sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('I N T E R A C T I V E', 0, 44);
      ctx.restore();

      // Barra de Progresso Suave
      const barW = Math.min(240, w * 0.65);
      const barH = 3;
      const barX = (w - barW) / 2;
      const barY = h * 0.72;

      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#00f5ff';
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 6;
      ctx.fillRect(barX, barY, barW * progress, barH);

      // Dica de Pular
      ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
      ctx.font = '600 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TAP TO SKIP / TOQUE PARA PULAR', w / 2, barY + 24);

      if (progress < 1) {
        requestAnimationFrame(animateIntro);
      } else {
        proceedToGameplay(false);
      }
    };

    requestAnimationFrame(animateIntro);
  };

  // 16. Handlers da Lore (Land in Gameplay em 1 clique)
  const btnLoreSkip = document.getElementById('btn-lore-skip');
  const btnLoreStart = document.getElementById('btn-lore-start');

  const startTrialsGameplay = () => {
    sound.init();
    sound.playClick();
    const s = SaveManager.get();
    s.loreSeen = true;
    SaveManager.save(s);

    modalController.closeModal('modal-lore');
    game.isPaused = false;
    game.isRoundOver = false;
    if (!game.isRunning) game.start();
    crazyGames.gameplayStart();
  };

  if (btnLoreSkip) btnLoreSkip.addEventListener('click', startTrialsGameplay);
  if (btnLoreStart) btnLoreStart.addEventListener('click', startTrialsGameplay);

  // Inicializa a fase 0 e a interface de idioma
  updateLocaleUI();
  game.loadLevel(0);

  // Inicia a Splash Screen FluidCleb
  runFluidClebIntro();
});
