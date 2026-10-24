// src/levels.js
// 18 Níveis Subversivos com Mecânicas Troll Quânticas (Level Devil Style)
// Cada nível contém 3 Estrelas Físicas e Bits Quânticos colecionáveis no cenário.

export const SECTORS = [
  { id: 1, name: "Mainframe Root", namePt: "Raiz do Mainframe", levels: [1, 2, 3, 4, 5] },
  { id: 2, name: "Quantum Flux", namePt: "Fluxo Quântico", levels: [6, 7, 8, 9, 10] },
  { id: 3, name: "Corrupted Kernel", namePt: "Kernel Corrompido", levels: [11, 12, 13, 14] },
  { id: 4, name: "Singularity Breach", namePt: "Ruptura da Singularidade", levels: [15, 16, 17, 18] }
];

export const LEVELS = [
  // ── SETOR 1: MAINFRAME ROOT ──────────────────────────────────────────
  {
    id: 1,
    sector: 1,
    name: "The Shy Portal",
    namePt: "A Porta Tímida",
    hint: "The exit seems nervous when you get close...",
    hintPt: "A saída parece tímida quando você chega perto...",
    spawn: { x: 80, y: 440 },
    door: { x: 740, y: 420, originalX: 740 },
    platforms: [
      { x: 40, y: 480, w: 260, h: 40 },
      { x: 360, y: 480, w: 260, h: 40 },
      { x: 680, y: 480, w: 240, h: 40 }
    ],
    spikes: [
      { x: 308, y: 505, w: 42, h: 30, dir: 'up' },
      { x: 628, y: 505, w: 42, h: 30, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 220, y: 420, collected: false },
      { id: 2, x: 490, y: 390, collected: false },
      { id: 3, x: 840, y: 420, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 150, y: 430, collected: false },
      { id: 2, x: 570, y: 440, collected: false }
    ],
    traps: [
      { type: 'runaway_door', triggerDist: 110, shiftX: 130, activated: false }
    ]
  },
  {
    id: 2,
    sector: 1,
    name: "Quantum Styrofoam",
    namePt: "Piso de Isopor",
    hint: "Don't linger on digital illusions.",
    hintPt: "Não confie em pisos de bytes fofos.",
    spawn: { x: 80, y: 440 },
    door: { x: 850, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 200, h: 40 },
      { id: 'fake_floor_2', x: 290, y: 480, w: 210, h: 40, isFalling: false, fallSpeed: 0 },
      { x: 550, y: 480, w: 200, h: 40 },
      { x: 790, y: 480, w: 140, h: 40 }
    ],
    spikes: [
      { x: 248, y: 510, w: 34, h: 30, dir: 'up' },
      { x: 508, y: 510, w: 34, h: 30, dir: 'up' },
      { x: 758, y: 510, w: 24, h: 30, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 160, y: 430, collected: false },
      { id: 2, x: 390, y: 380, collected: false },
      { id: 3, x: 670, y: 410, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 390, y: 440, collected: false },
      { id: 2, x: 830, y: 430, collected: false }
    ],
    traps: [
      { type: 'falling_floor', targetId: 'fake_floor_2', activated: false }
    ]
  },
  {
    id: 3,
    sector: 1,
    name: "The Falling Kernel",
    namePt: "O Teto Traiçoeiro",
    hint: "Look above before you sprint forward.",
    hintPt: "Olhe para cima antes de correr.",
    spawn: { x: 80, y: 440 },
    door: { x: 860, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 890, h: 40 }
    ],
    spikes: [
      { x: 380, y: 480, w: 32, h: 32, dir: 'up' },
      { x: 412, y: 480, w: 32, h: 32, dir: 'up' },
      { x: 670, y: 480, w: 32, h: 32, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 240, y: 420, collected: false },
      { id: 2, x: 520, y: 320, collected: false },
      { id: 3, x: 780, y: 420, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 330, y: 440, collected: false },
      { id: 2, x: 610, y: 440, collected: false }
    ],
    traps: [
      { type: 'falling_ceiling', x: 470, y: 120, w: 150, h: 44, triggerX: 410, vy: 0, activated: false }
    ]
  },
  {
    id: 4,
    sector: 1,
    name: "Pop-Up Glitch Spikes",
    namePt: "Espinhos que Brotam",
    hint: "Solid ground isn't always safe.",
    hintPt: "O chão liso pode ter surpresas pontiagudas.",
    spawn: { x: 80, y: 440 },
    door: { x: 860, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 260, h: 40 },
      { x: 350, y: 480, w: 260, h: 40 },
      { x: 670, y: 480, w: 260, h: 40 }
    ],
    spikes: [
      { x: 308, y: 512, w: 34, h: 30, dir: 'up' },
      { x: 618, y: 512, w: 34, h: 30, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 180, y: 420, collected: false },
      { id: 2, x: 480, y: 370, collected: false },
      { id: 3, x: 780, y: 420, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 400, y: 440, collected: false },
      { id: 2, x: 730, y: 440, collected: false }
    ],
    traps: [
      { type: 'pop_spike', x: 490, y: 480, currentY: 510, targetY: 450, triggerX: 430, activated: false }
    ]
  },
  {
    id: 5,
    sector: 1,
    name: "Neural Inversion",
    namePt: "Inversão Neural",
    hint: "Right becomes left inside purple fields.",
    hintPt: "Direita vira esquerda no campo roxo.",
    spawn: { x: 80, y: 440 },
    door: { x: 860, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 890, h: 40 },
      { x: 380, y: 350, w: 200, h: 28 }
    ],
    spikes: [
      { x: 310, y: 480, w: 34, h: 32, dir: 'up' },
      { x: 610, y: 480, w: 34, h: 32, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 200, y: 420, collected: false },
      { id: 2, x: 480, y: 290, collected: false },
      { id: 3, x: 760, y: 420, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 430, y: 320, collected: false },
      { id: 2, x: 530, y: 320, collected: false }
    ],
    traps: [
      { type: 'reverse_controls_zone', x: 340, y: 180, w: 280, h: 300 }
    ]
  },

  // ── SETOR 2: QUANTUM FLUX ──────────────────────────────────────────
  {
    id: 6,
    sector: 2,
    name: "The Decoy Portal",
    namePt: "A Porta Falsa",
    hint: "Never trust a portal that falls over.",
    hintPt: "A primeira porta nem sempre é a verdadeira.",
    spawn: { x: 80, y: 440 },
    door: { x: 840, y: 420, isFalling: false, vy: 0 },
    platforms: [
      { x: 40, y: 480, w: 240, h: 40 },
      { x: 340, y: 480, w: 240, h: 40 },
      { x: 640, y: 480, w: 270, h: 40 }
    ],
    spikes: [
      { x: 290, y: 512, w: 42, h: 30, dir: 'up' },
      { x: 590, y: 512, w: 42, h: 30, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 190, y: 420, collected: false },
      { id: 2, x: 460, y: 410, collected: false },
      { id: 3, x: 740, y: 410, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 380, y: 440, collected: false },
      { id: 2, x: 680, y: 440, collected: false }
    ],
    traps: [
      { type: 'falling_door', triggerX: 720, activated: false, spawnRealAt: { x: 120, y: 420 } }
    ]
  },
  {
    id: 7,
    sector: 2,
    name: "Disappearing Bridge",
    namePt: "Ponte Desvanecente",
    hint: "Platforms disappear mid-air. Leap with conviction!",
    hintPt: "Plataformas somem no ar. Pule com fé!",
    spawn: { x: 80, y: 440 },
    door: { x: 860, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 180, h: 40 },
      { id: 'flicker_1', x: 270, y: 450, w: 140, h: 30, isGlitching: true, alpha: 1 },
      { id: 'flicker_2', x: 460, y: 410, w: 140, h: 30, isGlitching: true, alpha: 1 },
      { id: 'flicker_3', x: 650, y: 450, w: 140, h: 30, isGlitching: true, alpha: 1 },
      { x: 820, y: 480, w: 120, h: 40 }
    ],
    spikes: [
      { x: 228, y: 515, w: 580, h: 30, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 340, y: 390, collected: false },
      { id: 2, x: 530, y: 350, collected: false },
      { id: 3, x: 720, y: 390, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 480, y: 360, collected: false },
      { id: 2, x: 870, y: 430, collected: false }
    ],
    traps: [
      { type: 'flicker_platforms', interval: 1.2, timer: 0 }
    ]
  },
  {
    id: 8,
    sector: 2,
    name: "Gravity Inversion Field",
    namePt: "Campo Gravitacional Invertido",
    hint: "Walk on the ceiling to cross the pit.",
    hintPt: "Ande no teto para atravessar o abismo.",
    spawn: { x: 80, y: 440 },
    door: { x: 860, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 200, h: 40 },
      { x: 280, y: 150, w: 420, h: 30, isCeiling: true }, // Teto transitável
      { x: 750, y: 480, w: 180, h: 40 }
    ],
    spikes: [
      { x: 250, y: 515, w: 490, h: 30, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 160, y: 420, collected: false },
      { id: 2, x: 490, y: 220, collected: false },
      { id: 3, x: 800, y: 420, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 360, y: 210, collected: false },
      { id: 2, x: 620, y: 210, collected: false }
    ],
    traps: [
      { type: 'gravity_invert_zone', x: 240, y: 120, w: 490, h: 360 }
    ]
  },
  {
    id: 9,
    sector: 2,
    name: "Phase Shift Laser",
    namePt: "Laser de Fase Quântica",
    hint: "Time your dash between energy pulses.",
    hintPt: "Cronometre o salto entre as pulsações de energia.",
    spawn: { x: 80, y: 440 },
    door: { x: 860, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 240, h: 40 },
      { x: 350, y: 480, w: 240, h: 40 },
      { x: 660, y: 480, w: 250, h: 40 }
    ],
    spikes: [
      { x: 290, y: 515, w: 50, h: 30, dir: 'up' },
      { x: 600, y: 515, w: 50, h: 30, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 180, y: 420, collected: false },
      { id: 2, x: 470, y: 400, collected: false },
      { id: 3, x: 770, y: 420, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 420, y: 440, collected: false },
      { id: 2, x: 520, y: 440, collected: false }
    ],
    traps: [
      { type: 'laser_barrier', x: 470, y: 280, w: 12, h: 200, activeTime: 1.0, inactiveTime: 1.2, timer: 0, isActive: true }
    ]
  },
  {
    id: 10,
    sector: 2,
    name: "The Moving Treadmill",
    namePt: "A Esteira Aceleradora",
    hint: "Counter the momentum before spikes catch you.",
    hintPt: "Compense o impulso antes de bater nos espinhos.",
    spawn: { x: 80, y: 440 },
    door: { x: 860, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 180, h: 40 },
      { x: 260, y: 480, w: 460, h: 40, isConveyor: true, speed: 220 },
      { x: 770, y: 480, w: 160, h: 40 }
    ],
    spikes: [
      { x: 228, y: 515, w: 26, h: 30, dir: 'up' },
      { x: 728, y: 480, w: 32, h: 32, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 150, y: 420, collected: false },
      { id: 2, x: 480, y: 390, collected: false },
      { id: 3, x: 820, y: 420, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 380, y: 430, collected: false },
      { id: 2, x: 580, y: 430, collected: false }
    ],
    traps: []
  },

  // ── SETOR 3: CORRUPTED KERNEL ───────────────────────────────────────
  {
    id: 11,
    sector: 3,
    name: "The Infinite Pit Glitch",
    namePt: "O Salto do Abismo",
    hint: "Sometimes falling into the abyss lifts you up.",
    hintPt: "Às vezes cair no abismo te leva ao topo.",
    spawn: { x: 80, y: 440 },
    door: { x: 850, y: 220 },
    platforms: [
      { x: 40, y: 480, w: 220, h: 40 },
      { x: 720, y: 280, w: 210, h: 30 }
    ],
    spikes: [],
    physicalStars: [
      { id: 1, x: 160, y: 420, collected: false },
      { id: 2, x: 450, y: 300, collected: false },
      { id: 3, x: 800, y: 230, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 450, y: 480, collected: false },
      { id: 2, x: 760, y: 240, collected: false }
    ],
    traps: [
      { type: 'bottom_teleport_zone', triggerY: 530, targetX: 740, targetY: 180 }
    ]
  },
  {
    id: 12,
    sector: 3,
    name: "Collapsing Cascade",
    namePt: "Cascata Desmoronante",
    hint: "Hop without pausing or fall into static.",
    hintPt: "Pule sem parar ou caia na estática.",
    spawn: { x: 80, y: 440 },
    door: { x: 860, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 160, h: 40 },
      { id: 'step_1', x: 240, y: 470, w: 120, h: 30, isFalling: false, fallSpeed: 0 },
      { id: 'step_2', x: 410, y: 440, w: 120, h: 30, isFalling: false, fallSpeed: 0 },
      { id: 'step_3', x: 580, y: 410, w: 120, h: 30, isFalling: false, fallSpeed: 0 },
      { x: 750, y: 480, w: 180, h: 40 }
    ],
    spikes: [
      { x: 208, y: 515, w: 530, h: 30, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 300, y: 410, collected: false },
      { id: 2, x: 470, y: 370, collected: false },
      { id: 3, x: 640, y: 340, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 470, y: 410, collected: false },
      { id: 2, x: 810, y: 430, collected: false }
    ],
    traps: [
      { type: 'falling_floor', targetId: 'step_1', activated: false },
      { type: 'falling_floor', targetId: 'step_2', activated: false },
      { type: 'falling_floor', targetId: 'step_3', activated: false }
    ]
  },
  {
    id: 13,
    sector: 3,
    name: "Charging Spikes",
    namePt: "Espinhos em Carga",
    hint: "Obstacles track your altitude.",
    hintPt: "Os espinhos perseguem sua altitude.",
    spawn: { x: 80, y: 440 },
    door: { x: 860, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 890, h: 40 }
    ],
    spikes: [
      { id: 'slider_spike', x: 650, y: 450, w: 32, h: 32, dir: 'up', isMoving: false, vx: 0 }
    ],
    physicalStars: [
      { id: 1, x: 220, y: 420, collected: false },
      { id: 2, x: 500, y: 350, collected: false },
      { id: 3, x: 780, y: 420, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 380, y: 440, collected: false },
      { id: 2, x: 600, y: 440, collected: false }
    ],
    traps: [
      { type: 'charging_spike', targetId: 'slider_spike', triggerX: 420, speed: -380, activated: false }
    ]
  },
  {
    id: 14,
    sector: 3,
    name: "The Ceiling Squeeze",
    namePt: "A Prensa do Teto",
    hint: "Hurry before the system compresses you.",
    hintPt: "Rápido antes que o sistema comprima o espaço.",
    spawn: { x: 80, y: 440 },
    door: { x: 860, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 890, h: 40 }
    ],
    spikes: [
      { x: 360, y: 480, w: 32, h: 32, dir: 'up' },
      { x: 580, y: 480, w: 32, h: 32, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 250, y: 420, collected: false },
      { id: 2, x: 480, y: 390, collected: false },
      { id: 3, x: 740, y: 420, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 420, y: 440, collected: false },
      { id: 2, x: 640, y: 440, collected: false }
    ],
    traps: [
      { type: 'slow_falling_ceiling', x: 280, y: 160, w: 420, h: 60, speed: 45, maxDropY: 380 }
    ]
  },

  // ── SETOR 4: SINGULARITY BREACH ─────────────────────────────────────
  {
    id: 15,
    sector: 4,
    name: "Zero-G Chamber",
    namePt: "Câmara de Gravidade Zero",
    hint: "High jumps, slow landings. Float safely.",
    hintPt: "Pulos altos, descidas lentas. Flutue com cuidado.",
    spawn: { x: 80, y: 440 },
    door: { x: 860, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 200, h: 40 },
      { x: 340, y: 380, w: 180, h: 30 },
      { x: 600, y: 320, w: 180, h: 30 },
      { x: 800, y: 480, w: 140, h: 40 }
    ],
    spikes: [
      { x: 248, y: 515, w: 540, h: 30, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 200, y: 350, collected: false },
      { id: 2, x: 440, y: 260, collected: false },
      { id: 3, x: 690, y: 210, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 420, y: 340, collected: false },
      { id: 2, x: 680, y: 280, collected: false }
    ],
    traps: [
      { type: 'low_gravity_level', gravityMult: 0.45 }
    ]
  },
  {
    id: 16,
    sector: 4,
    name: "Dimensional Blindspot",
    namePt: "Ponto Cego Dimensional",
    hint: "Platforms reveal themselves only when near.",
    hintPt: "Plataformas aparecem só quando você se aproxima.",
    spawn: { x: 80, y: 440 },
    door: { x: 860, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 160, h: 40 },
      { x: 250, y: 450, w: 120, h: 30, isInvisible: true, revealed: false },
      { x: 430, y: 420, w: 120, h: 30, isInvisible: true, revealed: false },
      { x: 610, y: 450, w: 120, h: 30, isInvisible: true, revealed: false },
      { x: 780, y: 480, w: 160, h: 40 }
    ],
    spikes: [
      { x: 208, y: 515, w: 560, h: 30, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 310, y: 380, collected: false },
      { id: 2, x: 490, y: 350, collected: false },
      { id: 3, x: 670, y: 380, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 310, y: 410, collected: false },
      { id: 2, x: 670, y: 410, collected: false }
    ],
    traps: [
      { type: 'reveal_on_proximity', distance: 130 }
    ]
  },
  {
    id: 17,
    sector: 4,
    name: "Triple Portal Shuffle",
    namePt: "Embaralhamento Quântico",
    hint: "Corner the elusive portal three times.",
    hintPt: "Cercar a porta saltitante 3 vezes.",
    spawn: { x: 80, y: 440 },
    door: { x: 480, y: 420, hopCount: 0 },
    platforms: [
      { x: 40, y: 480, w: 200, h: 40 },
      { x: 300, y: 480, w: 200, h: 40 },
      { x: 560, y: 480, w: 200, h: 40 },
      { x: 800, y: 480, w: 140, h: 40 }
    ],
    spikes: [
      { x: 248, y: 512, w: 44, h: 30, dir: 'up' },
      { x: 508, y: 512, w: 44, h: 30, dir: 'up' },
      { x: 768, y: 512, w: 24, h: 30, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 180, y: 420, collected: false },
      { id: 2, x: 440, y: 410, collected: false },
      { id: 3, x: 700, y: 410, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 360, y: 440, collected: false },
      { id: 2, x: 870, y: 430, collected: false }
    ],
    traps: [
      { type: 'triple_shuffle_door', targets: [{ x: 720, y: 420 }, { x: 120, y: 420 }, { x: 860, y: 420 }], currentIdx: 0 }
    ]
  },
  {
    id: 18,
    sector: 4,
    name: "Mainframe Singularity",
    namePt: "A Singularidade Final",
    hint: "Master all physics subversions to escape the mainframe!",
    hintPt: "Domine todas as subversões para escapar do mainframe!",
    spawn: { x: 80, y: 440 },
    door: { x: 870, y: 420 },
    platforms: [
      { x: 40, y: 480, w: 160, h: 40 },
      { id: 'boss_fake', x: 240, y: 480, w: 130, h: 40, isFalling: false, fallSpeed: 0 },
      { x: 410, y: 480, w: 160, h: 40 },
      { x: 620, y: 480, w: 140, h: 40 },
      { x: 800, y: 480, w: 140, h: 40 }
    ],
    spikes: [
      { x: 208, y: 515, w: 26, h: 30, dir: 'up' },
      { x: 378, y: 515, w: 26, h: 30, dir: 'up' },
      { x: 578, y: 515, w: 36, h: 30, dir: 'up' },
      { x: 768, y: 515, w: 26, h: 30, dir: 'up' }
    ],
    physicalStars: [
      { id: 1, x: 300, y: 390, collected: false },
      { id: 2, x: 490, y: 360, collected: false },
      { id: 3, x: 690, y: 380, collected: false }
    ],
    quantumBits: [
      { id: 1, x: 490, y: 430, collected: false },
      { id: 2, x: 860, y: 370, collected: false }
    ],
    traps: [
      { type: 'falling_floor', targetId: 'boss_fake', activated: false },
      { type: 'reverse_controls_zone', x: 400, y: 220, w: 180, h: 260 },
      { type: 'pop_spike', x: 690, y: 480, currentY: 510, targetY: 450, triggerX: 630, activated: false }
    ]
  }
];
