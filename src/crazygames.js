// src/crazygames.js
// CrazyGames SDK v3 — Integração Blindada com Watchdog de 2.5s e Anti-Softlock
import { sound } from './audio.js';

class CrazyGamesManager {
  constructor() {
    this.sdk = null;
    this.isInitialized = false;
    this.lastMidgameTime = 0;
    this.midgameIntervalMs = 180000; // 3 minutos de intervalo seguro
    this.isGameplayActive = false;
  }

  async init() {
    if (this.isInitialized) return;
    try {
      if (window.CrazyGames && window.CrazyGames.SDK) {
        this.sdk = window.CrazyGames.SDK;
        // Timeout rígido de 350ms para inicialização instantânea sem bloquear o boot
        await Promise.race([
          this.sdk.init(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('init timeout')), 350))
        ]);
        this.isInitialized = true;
        console.log('[CrazyGames] SDK v3 inicializado com sucesso.');
      } else {
        // Inicialização em background se o script async responder após o DOM
        setTimeout(() => {
          if (window.CrazyGames && window.CrazyGames.SDK && !this.isInitialized) {
            this.sdk = window.CrazyGames.SDK;
            this.sdk.init().then(() => {
              this.isInitialized = true;
              console.log('[CrazyGames] SDK v3 inicializado em segundo plano.');
            }).catch(() => {});
          }
        }, 300);
      }
    } catch (e) {
      console.warn('[CrazyGames] SDK em modo fallback local (zero latência):', e.message);
    }
  }

  // Verifica se o ambiente suporta requisição de anúncios reais
  canRequestLiveAds() {
    if (!this.sdk || !this.sdk.ad) return false;
    const host = window.location.hostname;
    if (host.includes('crazygames.com') || host.includes('1001juegos.com')) {
      return this.sdk.environment !== 'disabled';
    }
    return false;
  }

  // Ciclo de gameplay: Início da ação motora do jogador
  gameplayStart() {
    if (this.isGameplayActive) return;
    this.isGameplayActive = true;
    try {
      if (this.sdk && this.sdk.game && this.sdk.game.gameplayStart) {
        this.sdk.game.gameplayStart();
      }
    } catch (e) {}
  }

  // Ciclo de gameplay: Pausa, menu, modal ou morte
  gameplayStop() {
    if (!this.isGameplayActive) return;
    this.isGameplayActive = false;
    try {
      if (this.sdk && this.sdk.game && this.sdk.game.gameplayStop) {
        this.sdk.game.gameplayStop();
      }
    } catch (e) {}
  }

  // Requisição de Midgame Ad com Watchdog de 2.5s garantido
  requestMidgameAd(onComplete) {
    const now = Date.now();
    if (!this.canRequestLiveAds() || (now - this.lastMidgameTime < this.midgameIntervalMs)) {
      if (onComplete) onComplete();
      return;
    }

    this.gameplayStop();
    sound.setAdMuted(true);

    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        clearTimeout(watchdog);
        this.lastMidgameTime = Date.now();
        sound.setAdMuted(false);
        if (onComplete) onComplete();
      }
    };

    const watchdog = setTimeout(() => {
      console.warn('[CrazyGames] Watchdog de 2.5s disparado para Midgame Ad.');
      finish();
    }, 2500);

    try {
      this.sdk.ad.requestAd('midgame', {
        adStarted: () => console.log('[CrazyGames] Midgame Ad iniciado.'),
        adFinished: () => {
          console.log('[CrazyGames] Midgame Ad finalizado.');
          finish();
        },
        adError: (error) => {
          console.warn('[CrazyGames] Erro ao carregar Midgame Ad:', error);
          finish();
        }
      });
    } catch (err) {
      console.warn('[CrazyGames] Exceção em requestMidgameAd:', err);
      finish();
    }
  }

  // Requisição de Rewarded Ad (Anúncio Recompensado) com Watchdog de 2.5s
  requestRewardedAd(callbacks = {}) {
    const { onReward, onError, onComplete } = callbacks;

    if (!this.canRequestLiveAds()) {
      console.log('[CrazyGames] Ambiente Dev/Localhost: Simulando Rewarded Ad com sucesso.');
      if (onReward) onReward();
      if (onComplete) onComplete();
      return;
    }

    this.gameplayStop();
    sound.setAdMuted(true);

    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        clearTimeout(watchdog);
        sound.setAdMuted(false);
        if (onComplete) onComplete();
      }
    };

    const watchdog = setTimeout(() => {
      console.warn('[CrazyGames] Watchdog de 2.5s disparado para Rewarded Ad.');
      if (onError) onError('Watchdog Timeout');
      finish();
    }, 2500);

    try {
      this.sdk.ad.requestAd('rewarded', {
        adStarted: () => console.log('[CrazyGames] Rewarded Ad iniciado.'),
        adFinished: () => {
          console.log('[CrazyGames] Rewarded Ad concluído com sucesso.');
          if (onReward) onReward();
          finish();
        },
        adError: (error) => {
          console.warn('[CrazyGames] Erro no Rewarded Ad (AdBlock / Falha):', error);
          if (onError) onError(error);
          finish();
        }
      });
    } catch (err) {
      console.warn('[CrazyGames] Exceção em requestRewardedAd:', err);
      if (onError) onError(err);
      finish();
    }
  }
}

export const crazyGames = new CrazyGamesManager();
