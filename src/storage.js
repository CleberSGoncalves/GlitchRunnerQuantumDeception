// src/storage.js
// Gerenciador de Persistência com Versionamento, Migração e Validação de Dados

const SAVE_KEY = 'glitch_runner_save_v2';
const LEGACY_KEY = 'troll_platformer_save_v1';

export class SaveManager {
  static getDefaultData() {
    return {
      version: 2,
      unlockedLevel: 1,
      levels: {}, // { [id]: { deaths: 0, completed: false, stars: 0, bits: 0 } }
      quantumBits: 100,
      selectedSkin: 'cyan',
      unlockedSkins: ['cyan'],
      dailyLogin: {
        lastClaimDate: '',
        streak: 0
      },
      quests: [
        { id: 'jump_15', type: 'jump', target: 15, current: 0, reward: 40, claimed: false, isWeekly: false },
        { id: 'clear_3', type: 'clear', target: 3, current: 0, reward: 60, claimed: false, isWeekly: false },
        { id: 'stars_5', type: 'star', target: 5, current: 0, reward: 80, claimed: false, isWeekly: false },
        { id: 'clear_12', type: 'clear', target: 12, current: 0, reward: 200, claimed: false, isWeekly: true },
        { id: 'no_deaths_5', type: 'flawless', target: 5, current: 0, reward: 250, claimed: false, isWeekly: true }
      ],
      achievements: [],
      luckyWheel: {
        lastSpinTimestamp: 0
      },
      locale: 'en',
      muted: false,
      loreSeen: false
    };
  }

  static get() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Garante campos default caso novos campos tenham sido adicionados
          const def = this.getDefaultData();
          return {
            ...def,
            ...parsed,
            dailyLogin: { ...def.dailyLogin, ...(parsed.dailyLogin || {}) },
            luckyWheel: { ...def.luckyWheel, ...(parsed.luckyWheel || {}) },
            levels: parsed.levels || {},
            quests: Array.isArray(parsed.quests) && parsed.quests.length > 0 ? parsed.quests : def.quests
          };
        }
      }

      // Migração de v1 para v2 caso exista save anterior
      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      if (legacyRaw) {
        try {
          const leg = JSON.parse(legacyRaw);
          const def = this.getDefaultData();
          def.unlockedLevel = leg.unlockedLevel || 1;
          def.levels = leg.levels || {};
          this.save(def);
          return def;
        } catch (e) {}
      }
    } catch (e) {
      console.warn('[SaveManager] Erro ao carregar save, restaurando padrão:', e);
    }
    return this.getDefaultData();
  }

  static save(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[SaveManager] Falha ao salvar no localStorage:', e);
    }
  }

  static recordDeath(levelId) {
    const s = this.get();
    if (!s.levels[levelId]) {
      s.levels[levelId] = { deaths: 0, completed: false, stars: 0, bits: 0 };
    }
    s.levels[levelId].deaths++;
    this.save(s);
    return s.levels[levelId].deaths;
  }

  static recordVictory(levelId, starsCount = 1, bitsCount = 0) {
    const s = this.get();
    if (!s.levels[levelId]) {
      s.levels[levelId] = { deaths: 0, completed: false, stars: 0, bits: 0 };
    }
    const lvl = s.levels[levelId];
    lvl.completed = true;
    lvl.stars = Math.max(lvl.stars || 0, starsCount);
    lvl.bits = Math.max(lvl.bits || 0, bitsCount);

    s.unlockedLevel = Math.max(s.unlockedLevel || 1, levelId + 1);
    this.save(s);
  }

  static addQuantumBits(amount) {
    const s = this.get();
    s.quantumBits = (s.quantumBits || 0) + amount;
    this.save(s);
    return s.quantumBits;
  }

  static spendQuantumBits(amount) {
    const s = this.get();
    if ((s.quantumBits || 0) >= amount) {
      s.quantumBits -= amount;
      this.save(s);
      return true;
    }
    return false;
  }

  static unlockSkin(skinId) {
    const s = this.get();
    if (!s.unlockedSkins.includes(skinId)) {
      s.unlockedSkins.push(skinId);
      this.save(s);
    }
  }

  static selectSkin(skinId) {
    const s = this.get();
    s.selectedSkin = skinId;
    this.save(s);
  }

  static canClaimDailyLogin() {
    const s = this.get();
    const today = new Date().toISOString().slice(0, 10);
    return s.dailyLogin.lastClaimDate !== today;
  }

  static claimDailyLogin() {
    const s = this.get();
    const today = new Date().toISOString().slice(0, 10);
    if (s.dailyLogin.lastClaimDate === today) return null;

    let newStreak = (s.dailyLogin.streak || 0) + 1;
    if (newStreak > 7) newStreak = 1;

    // Tabela de recompensas crescente de 7 dias
    const rewards = [50, 75, 100, 150, 200, 250, 400];
    const rewardBits = rewards[newStreak - 1] || 50;

    s.dailyLogin.lastClaimDate = today;
    s.dailyLogin.streak = newStreak;
    s.quantumBits = (s.quantumBits || 0) + rewardBits;

    this.save(s);
    return { streak: newStreak, rewardBits };
  }

  static updateQuest(type, amount = 1) {
    const s = this.get();
    let updated = false;
    for (const q of s.quests) {
      if (q.type === type && !q.claimed) {
        q.current = Math.min(q.target, (q.current || 0) + amount);
        updated = true;
      }
    }
    if (updated) this.save(s);
    return s.quests;
  }

  static claimQuestReward(questId) {
    const s = this.get();
    const q = s.quests.find(item => item.id === questId);
    if (q && q.current >= q.target && !q.claimed) {
      q.claimed = true;
      s.quantumBits = (s.quantumBits || 0) + q.reward;
      this.save(s);
      return q.reward;
    }
    return 0;
  }
}
