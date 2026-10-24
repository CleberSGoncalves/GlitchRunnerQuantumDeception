# Glitch Runner: Quantum Deception

[![CrazyGames SDK v3](https://img.shields.io/badge/CrazyGames-SDK_v3_Ready-green.svg)](https://crazygames.com)
[![Build Size](https://img.shields.io/badge/Bundle_Size-%3C100KB-blue.svg)]()
[![Platform](https://img.shields.io/badge/Platform-HTML5_WebGL-purple.svg)]()
[![Brand](https://img.shields.io/badge/Brand-FluidCleb_Interactive-00f0ff.svg)]()

> 🎮 Jogo web de Plataforma Troll de alta precisão 100% homologado para os requisitos oficiais do **CrazyGames**.

- **URL Pública de Entrega**: [https://glitchrunnerquantumdeception.kinomuse.com.br](https://glitchrunnerquantumdeception.kinomuse.com.br)
- **Gênero / Estilo**: Plataforma Troll Subversivo (Level Devil / Quantum Glitches)
- **Marca Oficial**: **FluidCleb Interactive**
- **Plataformas**: Desktop (Chrome, Firefox, Edge, Safari) e Mobile (Android, iOS - Portrait & Landscape)
- **Stack Tecnológica**: Vite + Canvas/WebGL HTML5 + Godot Engine 4.7.2 (GDScript 2.0)

---

## ⚡ 1. Ambientação & Core Gameplay Loop
Um operador digital precisa escapar de um mainframe corrompido onde as leis da física mudam a cada salto e os caminhos seguros desaparecem repentinamente. O jogador inicia com alta velocidade, memoriza armadilhas invisíveis e pisos falsos com tentativas rápidas, morre de forma cômica com reinício instantâneo (< 40ms) e quebra a barreira da singularidade em 18 fases repletas de mecânicas subversivas.

---

## 🧩 2. Módulos & Arquitetura Homologada
1. **Intro FluidCleb Interactive (0.0s a 2.8s)**:
   - Splash Screen procedural em Canvas com orbes cósmicos (`#00f5ff`, `#38bdf8`, `#0284c7`), fusão central, gota metálica, logo em neon e sintetizador Web Audio suave, com botão e toque para pular instantâneo.
2. **Land in Gameplay & Lore em 1 Clique**:
   - Apresentação da premissa com botão "SKIP INTRO ➔" permitindo entrar na partida com no máximo 1 clique.
3. **Máquina de Estados dos Modais & Anti-Softlock**:
   - `ModalController` centralizado com pilha de estados (`modalStack`) que previne softlocks e reabre telas de vitória caso modais secundários sejam fechados.
4. **Blindagem CrazyGames SDK v3**:
   - Watchdog de 2.5 segundos para Midgame e Rewarded Ads, cláusula `finally` garantida para restauração de áudio e despausa de física, e bypass instantâneo em ambientes locais de teste.
5. **Arquitetura Edge-to-Edge & Dock Isolado Mobile**:
   - Canvas ocupando 100% da tela via `ResizeObserver` e `devicePixelRatio`.
   - Top HUD compacto (`LVL X` / `NÍVEL X`) sem sobreposição.
   - Dock de controles touch dedicado no modo retrato (`.portrait-mode .mobile-controls`, 115px de altura) com proibição absoluta de sobreposição sobre o chão e o jogador.
6. **Sistema de 3 Estrelas Físicas (Zero Estrelas Grátis)**:
   - 3 Estrelas físicas posicionadas no cenário que exigem contato real de hitbox.
   - Barra de progresso com marcos em tempo real e botão verde pulsante `✅ CONCLUIR FASE (★) ➔` ao alcançar 1★.
7. **Game Juice & Feedback Sensorial**:
   - Trauma² Screen Shake (`trauma * trauma`) com decaimento exponencial suave.
   - Hit-Stop de 40ms a 70ms em mortes e impactos críticos.
   - Squash & Stretch procedural elástico ao pular, aterrissar e colapsar.
   - Partículas comemorativas, rastros digitais e distorção de glitch scanlines.
8. **Ecossistema Meta-Game Completo**:
   - **Daily Login Calendar**: 7 dias com recompensas progressivas de Bits Quânticos.
   - **Missões Diárias & Semanais**: Quests de saltos, conclusão de fases e estrelas com opção de dobrar com Rewarded Ad.
   - **Loja de Visuais**: 5 skins customizadas para o operador (Cyan Runner, Quantum Gold, Neon Violet, Matrix Hacker, Crimson Glitch).
   - **Roleta da Sorte Quântica**: Giro diário a cada 12h com giros extras via anúncio premiado.
   - **Cofre de Conquistas**: Troféus de maestria no mainframe.

---

## 🛠️ 3. Comandos de Build & Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento local
npm run dev

# Compilar build de produção minificado
npm run build

# Executar backup automatizado no GitHub
backup_github.bat
```

---

## 🌐 4. Créditos & Links Oficiais
- Desenvolvido sob o selo **FluidCleb Interactive**
- Produção e publicação oficial: [https://kinomuse.com.br](https://kinomuse.com.br)
