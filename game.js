"use strict";

/* =========================================================
   星剣と魔導書のクロニクル
   game.js 完全版
========================================================= */


/* =========================================================
   1. DOM取得
========================================================= */

function getElement(id) {
  return document.getElementById(id);
}


/* =========================================================
   2. 定数
========================================================= */

const SAVE_KEY = "starSwordAstralSaveV1";

const TREE_WIDTH = 2600;
const TREE_HEIGHT = 2600;

const TREE_CENTER = {
  x: TREE_WIDTH / 2,
  y: TREE_HEIGHT / 2
};


/* =========================================================
   3. 初期ゲームデータ
========================================================= */

function createNewGame() {
  return {
    version: 1,

    level: 1,
    exp: 0,

    gold: 120,
    crystal: 1000,
    soul: 25,

    stage: 1,

    attackLevel: 0,
    defenseLevel: 0,

    rebirths: 0,

    idleBank: 0,
    lastSave: Date.now(),

    tree: {
      core: 1
    },

    inventory: [],

    gachaHistory: []
  };
}


/* =========================================================
   4. セーブデータ読み込み
========================================================= */

let game = createNewGame();

const savedData = localStorage.getItem(SAVE_KEY);

if (savedData) {
  try {
    const parsedData = JSON.parse(savedData);

    game = {
      ...game,
      ...parsedData
    };
  } catch (error) {
    console.error(
      "セーブデータの読み込みに失敗しました。",
      error
    );
  }
}


/* =========================================================
   5. セーブデータ修復
========================================================= */

function repairSaveData() {
  if (!game.tree || Array.isArray(game.tree)) {
    game.tree = {
      core: 1
    };
  }

  if (!game.tree.core) {
    game.tree.core = 1;
  }

  if (!Array.isArray(game.inventory)) {
    game.inventory = [];
  }

  if (!Array.isArray(game.gachaHistory)) {
    game.gachaHistory = [];
  }

  if (!Number.isFinite(game.idleBank)) {
    game.idleBank = 0;
  }

  if (!Number.isFinite(game.lastSave)) {
    game.lastSave = Date.now();
  }
}

repairSaveData();


/* =========================================================
   6. セーブ
========================================================= */

function saveGame() {
  game.lastSave = Date.now();

  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(game)
  );
}


/* =========================================================
   7. 数値表示
========================================================= */

function formatNumber(value) {
  const number = Math.floor(value);

  if (number >= 1_000_000_000) {
    return `${(number / 1_000_000_000).toFixed(2)}B`;
  }

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(2)}M`;
  }

  if (number >= 10_000) {
    return `${(number / 1_000).toFixed(1)}K`;
  }

  return number.toLocaleString("ja-JP");
}


/* =========================================================
   8. 豪華紋章データ
========================================================= */

const emblemDesigns = {
  core: {
    symbol: "✦",
    className: "rebirth"
  },

  war: {
    symbol: "♠",
    className: "war"
  },

  sword: {
    symbol: "⚔",
    className: "sword"
  },

  guard: {
    symbol: "◆",
    className: "guard"
  },

  magic: {
    symbol: "✧",
    className: "magic"
  },

  fate: {
    symbol: "✦",
    className: "fate"
  },

  astral: {
    symbol: "◆",
    className: "astral"
  },

  rebirth: {
    symbol: "∞",
    className: "rebirth"
  },

  death: {
    symbol: "☠",
    className: "death"
  },

  moon: {
    symbol: "☾",
    className: "moon"
  },

  fire: {
    symbol: "♨",
    className: "fire"
  },

  thunder: {
    symbol: "ϟ",
    className: "thunder"
  },

  poison: {
    symbol: "♧",
    className: "poison"
  },

  star: {
    symbol: "✦",
    className: "fate"
  },

  crystal: {
    symbol: "◆",
    className: "astral"
  }
};


/* =========================================================
   9. 紋章HTML生成
========================================================= */

function createEmblem(type, size = "") {
  const design =
    emblemDesigns[type] ||
    emblemDesigns.star;

  return `
    <span
      class="rpg-icon ${design.className} ${size}"
      aria-hidden="true"
    >
      ${design.symbol}
    </span>
  `;
}


/* =========================================================
   10. 星魂盤データ
========================================================= */

const treeNodes = [];
const treeEdges = [];


/* =========================================================
   11. 中央コア
========================================================= */

treeNodes.push({
  id: "core",

  name: "星魂の核",

  icon: "core",

  type: "core",

  size: "core",

  x: TREE_CENTER.x,
  y: TREE_CENTER.y,

  maxRank: 1,
  baseCost: 0,

  effect: "none",
  value: 0,

  required: null,
  exclude: null,

  description:
    "すべての星魂能力へつながる起点。転生者の魂を星魂盤へ接続する。"
});


/* =========================================================
   12. 系統設定
========================================================= */

const treeBranches = [
  {
    id: "war",

    name: "闘争",

    defaultIcon: "war",
    keystoneIcon: "death",

    angle: -155,

    effect: "attack",

    labels: [
      "猛攻",
      "剣気",
      "裂傷",
      "破甲",
      "連撃",
      "会心眼",
      "怒涛",
      "武神",
      "狂戦士",
      "処刑星"
    ],

    description:
      "攻撃力、会心、連撃、ボスへのダメージを強化する。"
  },

  {
    id: "guard",

    name: "守護",

    defaultIcon: "guard",
    keystoneIcon: "guard",

    angle: 155,

    effect: "defense",

    labels: [
      "生命",
      "堅牢",
      "再生",
      "鉄壁",
      "耐性",
      "活力",
      "聖域",
      "不屈",
      "守護神",
      "不死星"
    ],

    description:
      "HP、防御力、回復力、生存能力を強化する。"
  },

  {
    id: "magic",

    name: "魔導",

    defaultIcon: "magic",
    keystoneIcon: "magic",

    angle: -90,

    effect: "magic",

    labels: [
      "魔力",
      "元素",
      "集中",
      "高速詠唱",
      "炎術",
      "雷術",
      "氷術",
      "秘術",
      "大魔導",
      "星界魔法"
    ],

    description:
      "魔力、属性攻撃、スキルダメージを強化する。"
  },

  {
    id: "fate",

    name: "運命",

    defaultIcon: "fate",
    keystoneIcon: "moon",

    angle: 90,

    effect: "idle",

    labels: [
      "黄金律",
      "経験知",
      "幸運",
      "時流",
      "祝福",
      "繁栄",
      "加速",
      "星の恩寵",
      "運命改変",
      "豊穣星"
    ],

    description:
      "ゴールド、経験値、放置報酬を増加させる。"
  },

  {
    id: "astral",

    name: "星界",

    defaultIcon: "astral",
    keystoneIcon: "crystal",

    angle: -25,

    effect: "loot",

    labels: [
      "星石",
      "宝運",
      "装備共鳴",
      "希少発見",
      "秘宝",
      "星光",
      "水晶共鳴",
      "星辰",
      "奇跡",
      "天星"
    ],

    description:
      "装備ボーナス、クリスタル、召喚報酬を強化する。"
  },

  {
    id: "rebirth",

    name: "輪廻",

    defaultIcon: "rebirth",
    keystoneIcon: "rebirth",

    angle: 25,

    effect: "rebirth",

    labels: [
      "魂",
      "記憶",
      "輪廻",
      "再誕",
      "転生",
      "超越",
      "永劫",
      "星魂",
      "神化",
      "無限輪廻"
    ],

    description:
      "転生報酬、星魂獲得量、恒久能力を強化する。"
  }
];


/* =========================================================
   13. 派生ノード名
========================================================= */

const sideNodeNames = {
  war: [
    "剣技",
    "追撃",
    "斬撃",
    "致命傷",
    "吸血剣",
    "反撃",
    "狂気",
    "処刑",
    "攻勢",
    "戦意"
  ],

  guard: [
    "装甲",
    "活性",
    "治癒",
    "障壁",
    "耐火",
    "耐雷",
    "耐魔",
    "生命力",
    "守護壁",
    "再生力"
  ],

  magic: [
    "炎属性",
    "雷属性",
    "氷属性",
    "光属性",
    "闇属性",
    "詠唱速度",
    "元素共鳴",
    "魔力回路",
    "秘術",
    "星詠み"
  ],

  fate: [
    "ゴールド",
    "経験値",
    "放置時間",
    "幸運",
    "報酬倍率",
    "成長速度",
    "祝福",
    "時の流れ",
    "収穫",
    "繁栄"
  ],

  astral: [
    "装備強化",
    "宝箱",
    "レア発見",
    "クリスタル",
    "秘宝",
    "召喚運",
    "星石",
    "共鳴",
    "星界の欠片",
    "奇跡"
  ],

  rebirth: [
    "星魂",
    "転生倍率",
    "記憶継承",
    "輪廻",
    "魂力",
    "永劫",
    "再誕",
    "超越",
    "恒久強化",
    "神化"
  ]
};


/* =========================================================
   14. 派生ノードアイコン
========================================================= */

function getSideNodeIcon(type, level, index) {
  const number = level + index;

  switch (type) {
    case "war":
      if (number % 5 === 0) {
        return "death";
      }

      if (number % 3 === 0) {
        return "fire";
      }

      return "sword";

    case "guard":
      if (number % 4 === 0) {
        return "moon";
      }

      return "guard";

    case "magic":
      if (number % 4 === 0) {
        return "fire";
      }

      if (number % 4 === 1) {
        return "thunder";
      }

      if (number % 4 === 2) {
        return "moon";
      }

      return "magic";

    case "fate":
      if (number % 2 === 0) {
        return "moon";
      }

      return "fate";

    case "astral":
      if (number % 2 === 0) {
        return "crystal";
      }

      return "star";

    case "rebirth":
      if (number % 4 === 0) {
        return "death";
      }

      return "rebirth";

    default:
      return "star";
  }
}


/* =========================================================
   15. 派生ノード名取得
========================================================= */

function getSideNodeName(type, level, index) {
  const names = sideNodeNames[type];

  return names[
    (level * 2 + index) % names.length
  ];
}


/* =========================================================
   16. メイン系統生成
========================================================= */

function createTreeBranch(branch) {
  const radians =
    branch.angle *
    Math.PI /
    180;

  let previousNodeId = "core";

  for (let level = 1; level <= 10; level++) {
    const distance =
      135 +
      level * 104;

    const curve =
      Math.sin(level * 1.32) *
      52;

    const perpendicularAngle =
      radians +
      Math.PI / 2;

    const x =
      TREE_CENTER.x +
      Math.cos(radians) *
      distance +
      Math.cos(perpendicularAngle) *
      curve;

    const y =
      TREE_CENTER.y +
      Math.sin(radians) *
      distance +
      Math.sin(perpendicularAngle) *
      curve;

    const nodeId =
      `${branch.id}_main_${level}`;

    let nodeSize = "small";
    let maxRank = 3;
    let value =
      0.025 +
      level * 0.004;

    if (
      level === 4 ||
      level === 7
    ) {
      nodeSize = "medium";
      maxRank = 2;
      value += 0.04;
    }

    if (level === 9) {
      nodeSize = "major";
      maxRank = 1;
      value += 0.1;
    }

    if (level === 10) {
      nodeSize = "keystone";
      maxRank = 1;
      value = 0.3;
    }

    let icon =
      branch.defaultIcon;

    if (level === 10) {
      icon =
        branch.keystoneIcon;
    }

    treeNodes.push({
      id: nodeId,

      name:
        branch.labels[
          level - 1
        ],

      icon,

      type:
        branch.id,

      size:
        nodeSize,

      x,
      y,

      maxRank,

      baseCost:
        Math.max(
          1,
          Math.ceil(level / 2)
        ),

      effect:
        branch.effect,

      value,

      required:
        previousNodeId,

      exclude:
        getKeystoneExclusion(
          branch.id,
          level
        ),

      description:
        createNodeDescription(
          branch,
          level,
          nodeSize
        )
    });

    treeEdges.push({
      from:
        previousNodeId,

      to:
        nodeId
    });

    if (level >= 2) {
      createSideBranch(
        branch,
        nodeId,
        x,
        y,
        radians,
        level
      );
    }

    previousNodeId =
      nodeId;
  }
}


/* =========================================================
   17. キーストーン相互排他
========================================================= */

function getKeystoneExclusion(type, level) {
  if (level !== 10) {
    return null;
  }

  if (type === "war") {
    return "guard_main_10";
  }

  if (type === "guard") {
    return "war_main_10";
  }

  if (type === "magic") {
    return "astral_main_10";
  }

  if (type === "astral") {
    return "magic_main_10";
  }

  return null;
}


/* =========================================================
   18. ノード説明生成
========================================================= */

function createNodeDescription(
  branch,
  level,
  size
) {
  if (size === "keystone") {
    return (
      `${branch.name}系統の究極能力。` +
      `${branch.description}` +
      "ほかの強力なキーストーンと同時取得できない場合がある。"
    );
  }

  if (size === "major") {
    return (
      `${branch.name}系統の大型能力。` +
      branch.description
    );
  }

  return (
    `${branch.name}系能力を強化する。` +
    branch.description
  );
}


/* =========================================================
   19. 派生枝生成
========================================================= */

function createSideBranch(
  branch,
  parentId,
  parentX,
  parentY,
  radians,
  level
) {
  const sideCount =
    level % 3 === 0
      ? 2
      : 1;

  for (
    let sideIndex = 0;
    sideIndex < sideCount;
    sideIndex++
  ) {
    const direction =
      sideIndex === 0
        ? 1
        : -1;

    let previousNodeId =
      parentId;

    const sideLength =
      2 +
      (level % 2);

    for (
      let sideLevel = 1;
      sideLevel <= sideLength;
      sideLevel++
    ) {
      const perpendicularAngle =
        radians +
        Math.PI / 2;

      const sideDistance =
        72 *
        sideLevel *
        direction;

      const forwardDistance =
        34 *
        sideLevel;

      const wobble =
        Math.sin(
          sideLevel +
          level
        ) *
        18;

      const x =
        parentX +
        Math.cos(radians) *
        forwardDistance +
        Math.cos(perpendicularAngle) *
        (
          sideDistance +
          wobble
        );

      const y =
        parentY +
        Math.sin(radians) *
        forwardDistance +
        Math.sin(perpendicularAngle) *
        (
          sideDistance +
          wobble
        );

      const nodeId =
        `${branch.id}_side_${level}_${sideIndex}_${sideLevel}`;

      const isMajor =
        sideLevel === sideLength &&
        level % 4 === 0;

      treeNodes.push({
        id: nodeId,

        name:
          getSideNodeName(
            branch.id,
            level,
            sideLevel +
            sideIndex
          ),

        icon:
          isMajor
            ? branch.defaultIcon
            : getSideNodeIcon(
                branch.id,
                level,
                sideLevel +
                sideIndex
              ),

        type:
          branch.id,

        size:
          isMajor
            ? "major"
            : "small",

        x,
        y,

        maxRank:
          isMajor
            ? 1
            : 2,

        baseCost:
          Math.max(
            1,
            Math.ceil(level / 3)
          ),

        effect:
          getSideNodeEffect(
            branch.id,
            level,
            sideLevel
          ),

        value:
          isMajor
            ? 0.13
            : 0.025,

        required:
          previousNodeId,

        exclude:
          null,

        description:
          `${branch.name}系統から派生した特殊能力。`
      });

      treeEdges.push({
        from:
          previousNodeId,

        to:
          nodeId
      });

      previousNodeId =
        nodeId;
    }
  }
}


/* =========================================================
   20. 派生ノード効果
========================================================= */

function getSideNodeEffect(
  type,
  level,
  sideLevel
) {
  if (type === "war") {
    if ((level + sideLevel) % 3 === 0) {
      return "bossDamage";
    }

    return "attack";
  }

  if (type === "guard") {
    if ((level + sideLevel) % 3 === 0) {
      return "hp";
    }

    return "defense";
  }

  if (type === "magic") {
    if ((level + sideLevel) % 3 === 0) {
      return "skillDamage";
    }

    return "magic";
  }

  if (type === "fate") {
    if ((level + sideLevel) % 2 === 0) {
      return "gold";
    }

    return "idle";
  }

  if (type === "astral") {
    if ((level + sideLevel) % 2 === 0) {
      return "crystal";
    }

    return "loot";
  }

  if (type === "rebirth") {
    if ((level + sideLevel) % 2 === 0) {
      return "soulGain";
    }

    return "rebirth";
  }

  return "none";
}


/* =========================================================
   21. ツリー生成
========================================================= */

function generateTree() {
  treeBranches.forEach(
    createTreeBranch
  );

  createCrossConnections();
}


/* =========================================================
   22. 系統間の合流線
========================================================= */

function createCrossConnections() {
  const connections = [
    [
      "war_main_5",
      "magic_main_5"
    ],

    [
      "war_main_7",
      "astral_main_6"
    ],

    [
      "guard_main_5",
      "fate_main_5"
    ],

    [
      "guard_main_7",
      "rebirth_main_6"
    ],

    [
      "magic_main_7",
      "astral_main_7"
    ],

    [
      "fate_main_7",
      "rebirth_main_7"
    ]
  ];

  connections.forEach(
    ([from, to]) => {
      treeEdges.push({
        from,
        to,
        cross: true
      });
    }
  );
}

generateTree();


/* =========================================================
   23. ツリーランク
========================================================= */

function getNodeRank(id) {
  return Number(
    game.tree[id] || 0
  );
}


/* =========================================================
   24. ノード取得条件
========================================================= */

function isNodeAvailable(node) {
  if (node.id === "core") {
    return true;
  }

  if (
    node.exclude &&
    getNodeRank(
      node.exclude
    ) > 0
  ) {
    return false;
  }

  if (!node.required) {
    return true;
  }

  return (
    getNodeRank(
      node.required
    ) > 0
  );
}


/* =========================================================
   25. ノードコスト
========================================================= */

function getNodeCost(node) {
  return (
    node.baseCost +
    getNodeRank(node.id)
  );
}


/* =========================================================
   26. ツリーボーナス
========================================================= */

function getTreeBonus(effect) {
  return treeNodes.reduce(
    (total, node) => {
      if (node.effect !== effect) {
        return total;
      }

      return (
        total +
        getNodeRank(node.id) *
        node.value
      );
    },
    0
  );
}


/* =========================================================
   27. ステータス計算
========================================================= */

function calculatePlayerStats() {
  const rebirthMultiplier =
    1 +
    game.rebirths * 0.12 +
    getTreeBonus("rebirth");

  const baseAttack =
    25 +
    game.level * 7 +
    game.attackLevel * 8;

  const baseDefense =
    10 +
    game.level * 3 +
    game.defenseLevel * 6;

  const baseHp =
    180 +
    game.level * 35;

  const attack =
    baseAttack *
    rebirthMultiplier *
    (
      1 +
      getTreeBonus("attack")
    );

  const defense =
    baseDefense *
    rebirthMultiplier *
    (
      1 +
      getTreeBonus("defense")
    );

  const hp =
    baseHp *
    rebirthMultiplier *
    (
      1 +
      getTreeBonus("hp") +
      getTreeBonus("defense") *
      0.35
    );

  const magicMultiplier =
    1 +
    getTreeBonus("magic");

  const skillDamageMultiplier =
    1 +
    getTreeBonus("skillDamage");

  const power =
    attack * 14 +
    defense * 10 +
    hp * 2 +
    magicMultiplier * 400 +
    skillDamageMultiplier * 300;

  return {
    attack:
      Math.floor(attack),

    defense:
      Math.floor(defense),

    hp:
      Math.floor(hp),

    power:
      Math.floor(power),

    magicMultiplier,

    skillDamageMultiplier
  };
}


/* =========================================================
   28. 経験値必要量
========================================================= */

function getRequiredExp() {
  return (
    game.level * 100
  );
}


/* =========================================================
   29. レベルアップ
========================================================= */

function processLevelUps() {
  let leveledUp = false;

  while (
    game.exp >=
    getRequiredExp()
  ) {
    game.exp -=
      getRequiredExp();

    game.level++;

    leveledUp = true;
  }

  if (leveledUp) {
    showToast(
      `レベル${game.level}になった！`
    );
  }
}


/* =========================================================
   30. 放置効率
========================================================= */

function getIdleRate() {
  const stageRate =
    1 +
    game.stage * 0.22;

  return (
    stageRate *
    (
      1 +
      getTreeBonus("idle")
    )
  );
}


/* =========================================================
   31. オフライン報酬
========================================================= */

function calculateOfflineReward() {
  const now = Date.now();

  const elapsedSeconds =
    Math.min(
      8 * 60 * 60,
      Math.max(
        0,
        (
          now -
          game.lastSave
        ) / 1000
      )
    );

  const reward =
    Math.floor(
      elapsedSeconds *
      getIdleRate()
    );

  game.idleBank += reward;

  game.lastSave = now;
}


/* =========================================================
   32. トースト
========================================================= */

let toastTimer = null;

function showToast(message) {
  const toast =
    getElement("toast");

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(toastTimer);

  toastTimer = setTimeout(
    () => {
      toast.classList.remove(
        "show"
      );
    },
    1800
  );
}


/* =========================================================
   33. 戦闘ログ
========================================================= */

function setBattleLog(message) {
  getElement("log").textContent =
    message;
}


/* =========================================================
   34. 戦闘エフェクト
========================================================= */

function playBattleEffect(type) {
  const effect =
    getElement(
      "battleEffect"
    );

  const symbols = {
    slash: "⚔",
    fire: "♨",
    thunder: "ϟ",
    magic: "✦"
  };

  effect.textContent =
    symbols[type] ||
    symbols.slash;

  effect.classList.remove(
    "play"
  );

  void effect.offsetWidth;

  effect.classList.add(
    "play"
  );
}


/* =========================================================
   35. ダメージ表示
========================================================= */

function showDamageNumber(damage) {
  const damageElement =
    getElement(
      "damageNumber"
    );

  damageElement.textContent =
    formatNumber(damage);

  damageElement.classList.remove(
    "show"
  );

  void damageElement.offsetWidth;

  damageElement.classList.add(
    "show"
  );
}


/* =========================================================
   36. 戦闘
========================================================= */

let battleInProgress = false;
let currentBattleTimer = null;

getElement("fight").addEventListener(
  "click",
  startBossBattle
);


function startBossBattle() {
  if (battleInProgress) {
    return;
  }

  battleInProgress = true;

  getElement("fight").disabled =
    true;

  const player =
    calculatePlayerStats();

  const enemyMaxHp =
    Math.floor(
      180 *
      Math.pow(
        1.28,
        game.stage - 1
      )
    );

  let enemyHp =
    enemyMaxHp;

  let playerHp =
    player.hp;

  let turn = 0;

  getElement("maxhp").textContent =
    formatNumber(enemyMaxHp);

  getElement("hp").textContent =
    formatNumber(enemyHp);

  getElement("hpbar").style.width =
    "100%";

  setBattleLog(
    `Stage ${game.stage}の戦闘開始！`
  );

  currentBattleTimer =
    setInterval(
      () => {
        turn++;

        const skill =
          selectBattleSkill(turn);

        const damage =
          calculateBattleDamage(
            player,
            skill
          );

        enemyHp -= damage;

        showDamageNumber(damage);

        playBattleEffect(
          skill.effect
        );

        setBattleLog(
          `${skill.name}！ ${formatNumber(damage)}ダメージ！`
        );

        getElement("hp").textContent =
          formatNumber(
            Math.max(
              0,
              enemyHp
            )
          );

        getElement("hpbar").style.width =
          `${Math.max(
            0,
            enemyHp /
            enemyMaxHp *
            100
          )}%`;

        if (enemyHp <= 0) {
          finishBattleVictory();

          return;
        }

        const enemyDamage =
          calculateEnemyDamage(
            player.defense
          );

        playerHp -= enemyDamage;

        if (playerHp <= 0) {
          finishBattleDefeat();
        }
      },
      650
    );
}


/* =========================================================
   37. 戦闘スキル選択
========================================================= */

function selectBattleSkill(turn) {
  const skills = [
    {
      name: "星剣斬り",
      multiplier: 1,
      effect: "slash"
    },

    {
      name: "炎星撃",
      multiplier:
        1.2 +
        getTreeBonus("magic") *
        0.35,
      effect: "fire"
    },

    {
      name: "雷光剣",
      multiplier:
        1.15 +
        getTreeBonus("skillDamage"),
      effect: "thunder"
    },

    {
      name: "星界奥義",
      multiplier:
        1.6 +
        getTreeBonus("magic") *
        0.5,
      effect: "magic"
    }
  ];

  return skills[
    (turn - 1) %
    skills.length
  ];
}


/* =========================================================
   38. ダメージ計算
========================================================= */

function calculateBattleDamage(
  player,
  skill
) {
  const variation =
    0.9 +
    Math.random() * 0.2;

  const bossBonus =
    1 +
    getTreeBonus(
      "bossDamage"
    );

  return Math.max(
    1,

    Math.floor(
      player.attack *
      skill.multiplier *
      player.skillDamageMultiplier *
      bossBonus *
      variation
    )
  );
}


/* =========================================================
   39. 敵ダメージ
========================================================= */

function calculateEnemyDamage(
  defense
) {
  const rawDamage =
    18 +
    game.stage * 9;

  return Math.max(
    3,

    Math.floor(
      rawDamage -
      defense * 0.32
    )
  );
}


/* =========================================================
   40. 戦闘勝利
========================================================= */

function finishBattleVictory() {
  clearInterval(
    currentBattleTimer
  );

  const goldReward =
    Math.floor(
      (
        40 +
        game.stage * 18
      ) *
      (
        1 +
        getTreeBonus("gold")
      )
    );

  const expReward =
    Math.floor(
      (
        45 +
        game.stage * 12
      ) *
      (
        1 +
        getTreeBonus("idle") *
        0.25
      )
    );

  const crystalReward =
    Math.max(
      15,
      Math.floor(
        15 *
        (
          1 +
          getTreeBonus("crystal")
        )
      )
    );

  game.gold +=
    goldReward;

  game.exp +=
    expReward;

  game.crystal +=
    crystalReward;

  game.stage++;

  processLevelUps();

  setBattleLog(
    `勝利！ +${formatNumber(goldReward)}G / +${formatNumber(expReward)}EXP / +${crystalReward}◆`
  );

  battleInProgress = false;

  getElement("fight").disabled =
    false;

  saveGame();
  renderGame();
}


/* =========================================================
   41. 戦闘敗北
========================================================= */

function finishBattleDefeat() {
  clearInterval(
    currentBattleTimer
  );

  setBattleLog(
    "敗北した。強化や星魂盤を見直そう。"
  );

  battleInProgress = false;

  getElement("fight").disabled =
    false;
}


/* =========================================================
   42. 攻撃強化
========================================================= */

getElement("train").addEventListener(
  "click",
  () => {
    const cost =
      getAttackUpgradeCost();

    if (game.gold < cost) {
      showToast(
        "ゴールドが足りません"
      );

      return;
    }

    game.gold -= cost;
    game.attackLevel++;

    saveGame();
    renderGame();

    showToast(
      "攻撃力を強化した！"
    );
  }
);


function getAttackUpgradeCost() {
  return (
    50 +
    game.attackLevel * 40
  );
}


/* =========================================================
   43. 防御強化
========================================================= */

getElement("armor").addEventListener(
  "click",
  () => {
    const cost =
      getDefenseUpgradeCost();

    if (game.gold < cost) {
      showToast(
        "ゴールドが足りません"
      );

      return;
    }

    game.gold -= cost;
    game.defenseLevel++;

    saveGame();
    renderGame();

    showToast(
      "防御力を強化した！"
    );
  }
);


function getDefenseUpgradeCost() {
  return (
    50 +
    game.defenseLevel * 40
  );
}


/* =========================================================
   44. 放置報酬受取
========================================================= */

getElement("claim").addEventListener(
  "click",
  () => {
    const reward =
      Math.floor(
        game.idleBank
      );

    if (reward <= 0) {
      showToast(
        "まだ報酬がありません"
      );

      return;
    }

    game.gold += reward;
    game.idleBank = 0;

    saveGame();
    renderGame();

    showToast(
      `${formatNumber(reward)}Gを獲得！`
    );
  }
);


/* =========================================================
   45. ガチャデータ
========================================================= */

const gachaItems = [
  {
    name: "星剣アルディオン",
    type: "武器"
  },

  {
    name: "月影の魔導書",
    type: "秘奥義"
  },

  {
    name: "天星の弓",
    type: "武器"
  },

  {
    name: "輪廻の指輪",
    type: "装備"
  },

  {
    name: "星界水晶",
    type: "秘宝"
  },

  {
    name: "炎帝の紋章",
    type: "秘奥義"
  },

  {
    name: "雷神の護符",
    type: "装備"
  },

  {
    name: "不死鳥の羽",
    type: "秘宝"
  }
];


/* =========================================================
   46. ガチャ
========================================================= */

function summon(count, cost) {
  if (game.crystal < cost) {
    showToast(
      "クリスタルが足りません"
    );

    return;
  }

  game.crystal -= cost;

  const results = [];

  for (let index = 0; index < count; index++) {
    let rarity =
      rollRarity();

    if (
      count === 10 &&
      index === 9 &&
      rarity === "R"
    ) {
      rarity = "SR";
    }

    const baseItem =
      gachaItems[
        Math.floor(
          Math.random() *
          gachaItems.length
        )
      ];

    const item = {
      id:
        `${Date.now()}_${Math.random()}`,

      name:
        baseItem.name,

      type:
        baseItem.type,

      rarity,

      power:
        getItemPower(rarity)
    };

    game.inventory.push(item);
    game.gachaHistory.push(item);

    results.push(item);
  }

  game.gachaHistory =
    game.gachaHistory.slice(-30);

  renderGachaResults(results);

  saveGame();
  renderGame();

  showToast(
    `${count}回召喚した！`
  );
}


/* =========================================================
   47. レアリティ抽選
========================================================= */

function rollRarity() {
  const roll =
    Math.random();

  if (roll < 0.05) {
    return "SSR";
  }

  if (roll < 0.28) {
    return "SR";
  }

  return "R";
}


/* =========================================================
   48. アイテム性能
========================================================= */

function getItemPower(rarity) {
  const lootBonus =
    1 +
    getTreeBonus("loot");

  if (rarity === "SSR") {
    return Math.floor(
      35 * lootBonus
    );
  }

  if (rarity === "SR") {
    return Math.floor(
      15 * lootBonus
    );
  }

  return Math.floor(
    6 * lootBonus
  );
}


/* =========================================================
   49. ガチャボタン
========================================================= */

getElement("pull1").addEventListener(
  "click",
  () => {
    summon(1, 100);
  }
);


getElement("pull10").addEventListener(
  "click",
  () => {
    summon(10, 900);
  }
);


/* =========================================================
   50. ガチャ結果表示
========================================================= */

function renderGachaResults(results) {
  getElement("results").innerHTML =
    results
      .map(
        item => `
          <article class="card ${item.rarity}">
            <strong>
              ${item.rarity}
            </strong>

            <span>
              ${item.name}
            </span>

            <small>
              ${item.type}
            </small>
          </article>
        `
      )
      .join("");
}


/* =========================================================
   51. ガチャ履歴
========================================================= */

function renderGachaHistory() {
  const inventoryElement =
    getElement("inventory");

  if (
    game.gachaHistory.length === 0
  ) {
    inventoryElement.innerHTML = `
      <article class="card R">
        召喚履歴はありません
      </article>
    `;

    return;
  }

  inventoryElement.innerHTML =
    game.gachaHistory
      .slice()
      .reverse()
      .map(
        item => `
          <article class="card ${item.rarity}">
            <strong>
              ${item.rarity}
            </strong>

            <span>
              ${item.name}
            </span>

            <small>
              戦力 +${item.power}
            </small>
          </article>
        `
      )
      .join("");
}


/* =========================================================
   52. 装備ボーナス
========================================================= */

function getInventoryPower() {
  return game.inventory.reduce(
    (total, item) => {
      return (
        total +
        Number(item.power || 0)
      );
    },
    0
  );
}


/* =========================================================
   53. 転生報酬
========================================================= */

function getRebirthSoulGain() {
  if (game.stage < 10) {
    return 0;
  }

  const baseGain =
    Math.floor(
      game.stage / 5
    );

  const soulMultiplier =
    1 +
    getTreeBonus("soulGain");

  return Math.max(
    1,

    Math.floor(
      baseGain *
      soulMultiplier
    )
  );
}


/* =========================================================
   54. 転生
========================================================= */

getElement("doRebirth").addEventListener(
  "click",
  () => {
    if (game.stage < 10) {
      showToast(
        "Stage 10で転生が解放されます"
      );

      return;
    }

    const soulGain =
      getRebirthSoulGain();

    const confirmed =
      confirm(
        `転生して星魂${soulGain}個を獲得しますか？\n\nレベル・経験値・ステージ・ゴールド・通常強化がリセットされます。`
      );

    if (!confirmed) {
      return;
    }

    game.soul += soulGain;
    game.rebirths++;

    game.level = 1;
    game.exp = 0;

    game.gold = 120;

    game.stage = 1;

    game.attackLevel = 0;
    game.defenseLevel = 0;

    game.idleBank = 0;

    saveGame();
    renderGame();
    renderTree();

    showToast(
      `転生した！ 星魂+${soulGain}`
    );
  }
);


/* =========================================================
   55. ツリーノードの表示クラス
========================================================= */

function getTreeNodeState(node) {
  const rank =
    getNodeRank(node.id);

  if (rank > 0) {
    return "owned";
  }

  if (isNodeAvailable(node)) {
    return "available";
  }

  return "locked";
}


/* =========================================================
   56. ツリー描画
========================================================= */

function renderTree() {
  const nodeContainer =
    getElement("treeNodes");

  nodeContainer.innerHTML = "";

  treeNodes.forEach(
    node => {
      const button =
        document.createElement(
          "button"
        );

      const rank =
        getNodeRank(node.id);

      const state =
        getTreeNodeState(node);

      button.className =
        `tree-node treeNode ${node.type} ${node.size} ${state}`;

      if (
        rank >= node.maxRank
      ) {
        button.classList.add(
          "maxed"
        );
      }

      button.style.left =
        `${node.x}px`;

      button.style.top =
        `${node.y}px`;

      button.dataset.id =
        node.id;

      button.dataset.name =
        node.name;

      button.dataset.type =
        node.type;

      button.setAttribute(
        "aria-label",
        node.name
      );

      button.innerHTML =
        createEmblem(
          node.icon
        );

      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          selectTreeNode(
            node
          );
        }
      );

      nodeContainer.appendChild(
        button
      );
    }
  );

  renderTreeLines();
  applyTreeFilter();
  applyNodeSearch();
}


/* =========================================================
   57. 接続線描画
========================================================= */

function renderTreeLines() {
  const svg =
    getElement("treeLines");

  svg.innerHTML = "";

  treeEdges.forEach(
    edge => {
      const fromNode =
        treeNodes.find(
          node =>
            node.id === edge.from
        );

      const toNode =
        treeNodes.find(
          node =>
            node.id === edge.to
        );

      if (!fromNode || !toNode) {
        return;
      }

      const line =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );

      line.setAttribute(
        "x1",
        fromNode.x
      );

      line.setAttribute(
        "y1",
        fromNode.y
      );

      line.setAttribute(
        "x2",
        toNode.x
      );

      line.setAttribute(
        "y2",
        toNode.y
      );

      let lineClass =
        "tree-line";

      if (
        getNodeRank(toNode.id) > 0
      ) {
        lineClass +=
          " active";
      } else if (
        isNodeAvailable(toNode)
      ) {
        lineClass +=
          " available";
      }

      line.setAttribute(
        "class",
        lineClass
      );

      svg.appendChild(line);
    }
  );
}


/* =========================================================
   58. ノード詳細
========================================================= */

let selectedNodeId = null;

function selectTreeNode(node) {
  selectedNodeId =
    node.id;

  document
    .querySelectorAll(
      ".tree-node"
    )
    .forEach(
      element => {
        element.classList.toggle(
          "selected",
          element.dataset.id ===
          node.id
        );
      }
    );

  const rank =
    getNodeRank(node.id);

  const cost =
    getNodeCost(node);

  const available =
    isNodeAvailable(node);

  const maxed =
    rank >= node.maxRank;

  let buttonText =
    `強化 ✦${cost}`;

  let disabled = false;

  if (node.id === "core") {
    buttonText =
      "起点ノード";

    disabled = true;
  } else if (maxed) {
    buttonText =
      "最大ランク";

    disabled = true;
  } else if (!available) {
    if (
      node.exclude &&
      getNodeRank(
        node.exclude
      ) > 0
    ) {
      buttonText =
        "別のキーストーンと相互排他";
    } else {
      buttonText =
        "前提ノードが必要";
    }

    disabled = true;
  } else if (game.soul < cost) {
    buttonText =
      `星魂不足 ✦${cost}`;

    disabled = true;
  }

  const detail =
    getElement(
      "nodeDetail"
    );

  detail.innerHTML = `
    ${createEmblem(
      node.icon,
      "medium"
    )}

    <div>
      <strong>
        ${node.name}
      </strong>

      <p>
        ${node.description}
      </p>

      <p>
        Rank ${rank}/${node.maxRank}
        ・
        1ランク効果
        +${Math.round(
          node.value * 100
        )}%
      </p>

      <button
        id="buyNode"
        ${disabled ? "disabled" : ""}
      >
        ${buttonText}
      </button>
    </div>
  `;

  const buyButton =
    getElement("buyNode");

  if (buyButton) {
    buyButton.addEventListener(
      "click",
      () => {
        purchaseTreeNode(
          node
        );
      }
    );
  }
}


/* =========================================================
   59. ノード購入
========================================================= */

function purchaseTreeNode(node) {
  if (
    node.id === "core"
  ) {
    return;
  }

  if (!isNodeAvailable(node)) {
    return;
  }

  const currentRank =
    getNodeRank(node.id);

  if (
    currentRank >=
    node.maxRank
  ) {
    return;
  }

  const cost =
    getNodeCost(node);

  if (game.soul < cost) {
    showToast(
      "星魂が足りません"
    );

    return;
  }

  game.soul -= cost;

  game.tree[node.id] =
    currentRank + 1;

  saveGame();
  renderGame();
  renderTree();
  selectTreeNode(node);

  showToast(
    `${node.name}を強化した！`
  );
}


/* =========================================================
   60. ツリー払い戻し計算
========================================================= */

function calculateTreeRefund() {
  return treeNodes.reduce(
    (total, node) => {
      if (node.id === "core") {
        return total;
      }

      const rank =
        getNodeRank(node.id);

      let nodeRefund = 0;

      for (
        let rankIndex = 0;
        rankIndex < rank;
        rankIndex++
      ) {
        nodeRefund +=
          node.baseCost +
          rankIndex;
      }

      return (
        total +
        nodeRefund
      );
    },
    0
  );
}


/* =========================================================
   61. ツリーリセット
========================================================= */

getElement("resetTree").addEventListener(
  "click",
  () => {
    const refund =
      calculateTreeRefund();

    if (refund <= 0) {
      showToast(
        "リセットする能力がありません"
      );

      return;
    }

    const confirmed =
      confirm(
        `星魂盤をリセットして星魂${refund}個を払い戻しますか？`
      );

    if (!confirmed) {
      return;
    }

    game.soul += refund;

    game.tree = {
      core: 1
    };

    selectedNodeId = null;

    saveGame();
    renderGame();
    renderTree();

    resetNodeDetail();

    showToast(
      `星魂${refund}個を払い戻しました`
    );
  }
);


/* =========================================================
   62. ノード詳細初期化
========================================================= */

function resetNodeDetail() {
  getElement("nodeDetail").innerHTML = `
    ${createEmblem(
      "fate",
      "medium"
    )}

    <div>
      <strong>
        星魂盤
      </strong>

      <p>
        ノードを選択してください。
      </p>
    </div>
  `;
}


/* =========================================================
   63. ツリーカメラ
========================================================= */

let treeScale = 0.7;

let treeX = 0;
let treeY = 0;

let treeDragging = false;

let pointerStartX = 0;
let pointerStartY = 0;

let cameraStartX = 0;
let cameraStartY = 0;


/* =========================================================
   64. ツリー変形
========================================================= */

function updateTreeTransform() {
  const world =
    getElement("treeWorld");

  world.style.transform =
    `translate(${treeX}px, ${treeY}px) scale(${treeScale})`;

  getElement("zoomDisplay").textContent =
    `${Math.round(
      treeScale * 100
    )}%`;
}


/* =========================================================
   65. ツリー中央へ移動
========================================================= */

function centerTree() {
  const viewport =
    getElement(
      "treeViewport"
    );

  treeX =
    viewport.clientWidth / 2 -
    TREE_CENTER.x *
    treeScale;

  treeY =
    viewport.clientHeight / 2 -
    TREE_CENTER.y *
    treeScale;

  updateTreeTransform();
}


/* =========================================================
   66. ポインタ操作
========================================================= */

const treeViewport =
  getElement(
    "treeViewport"
  );


treeViewport.addEventListener(
  "pointerdown",
  event => {
    if (
      event.target.closest(
        ".tree-node"
      )
    ) {
      return;
    }

    treeDragging = true;

    pointerStartX =
      event.clientX;

    pointerStartY =
      event.clientY;

    cameraStartX =
      treeX;

    cameraStartY =
      treeY;

    treeViewport.setPointerCapture(
      event.pointerId
    );
  }
);


treeViewport.addEventListener(
  "pointermove",
  event => {
    if (!treeDragging) {
      return;
    }

    treeX =
      cameraStartX +
      (
        event.clientX -
        pointerStartX
      );

    treeY =
      cameraStartY +
      (
        event.clientY -
        pointerStartY
      );

    updateTreeTransform();
  }
);


treeViewport.addEventListener(
  "pointerup",
  event => {
    treeDragging = false;

    if (
      treeViewport.hasPointerCapture(
        event.pointerId
      )
    ) {
      treeViewport.releasePointerCapture(
        event.pointerId
      );
    }
  }
);


treeViewport.addEventListener(
  "pointercancel",
  () => {
    treeDragging = false;
  }
);


/* =========================================================
   67. ホイールズーム
========================================================= */

treeViewport.addEventListener(
  "wheel",
  event => {
    event.preventDefault();

    const previousScale =
      treeScale;

    if (event.deltaY < 0) {
      treeScale += 0.07;
    } else {
      treeScale -= 0.07;
    }

    treeScale =
      Math.max(
        0.3,
        Math.min(
          1.5,
          treeScale
        )
      );

    const rectangle =
      treeViewport.getBoundingClientRect();

    const pointerX =
      event.clientX -
      rectangle.left;

    const pointerY =
      event.clientY -
      rectangle.top;

    const worldX =
      (
        pointerX -
        treeX
      ) /
      previousScale;

    const worldY =
      (
        pointerY -
        treeY
      ) /
      previousScale;

    treeX =
      pointerX -
      worldX *
      treeScale;

    treeY =
      pointerY -
      worldY *
      treeScale;

    updateTreeTransform();
  },
  {
    passive: false
  }
);


/* =========================================================
   68. ズームボタン
========================================================= */

getElement("zoomIn").addEventListener(
  "click",
  () => {
    treeScale =
      Math.min(
        1.5,
        treeScale + 0.1
      );

    updateTreeTransform();
  }
);


getElement("zoomOut").addEventListener(
  "click",
  () => {
    treeScale =
      Math.max(
        0.3,
        treeScale - 0.1
      );

    updateTreeTransform();
  }
);


getElement("centerTree").addEventListener(
  "click",
  centerTree
);


/* =========================================================
   69. ノード検索
========================================================= */

function applyNodeSearch() {
  const searchElement =
    getElement(
      "nodeSearch"
    );

  const searchText =
    searchElement.value
      .trim()
      .toLowerCase();

  document
    .querySelectorAll(
      ".tree-node"
    )
    .forEach(
      nodeElement => {
        const nodeName =
          nodeElement.dataset.name
            .toLowerCase();

        const isMatch =
          searchText.length > 0 &&
          nodeName.includes(
            searchText
          );

        nodeElement.classList.toggle(
          "search-hit",
          isMatch
        );

        nodeElement.classList.toggle(
          "searchHit",
          isMatch
        );
      }
    );
}


getElement("nodeSearch").addEventListener(
  "input",
  applyNodeSearch
);


/* =========================================================
   70. 系統フィルター
========================================================= */

let activeTreeFilter = "all";

document
  .querySelectorAll(
    ".tree-filters button"
  )
  .forEach(
    button => {
      button.addEventListener(
        "click",
        () => {
          activeTreeFilter =
            button.dataset.filter;

          document
            .querySelectorAll(
              ".tree-filters button"
            )
            .forEach(
              filterButton => {
                filterButton.classList.toggle(
                  "active",
                  filterButton === button
                );
              }
            );

          applyTreeFilter();
        }
      );
    }
  );


function applyTreeFilter() {
  document
    .querySelectorAll(
      ".tree-node"
    )
    .forEach(
      nodeElement => {
        const nodeType =
          nodeElement.dataset.type;

        const filteredOut =
          activeTreeFilter !== "all" &&
          nodeType !==
            activeTreeFilter &&
          nodeType !== "core";

        nodeElement.classList.toggle(
          "filtered-out",
          filteredOut
        );
      }
    );
}


/* =========================================================
   71. 画面切り替え
========================================================= */

function openPage(pageId) {
  document
    .querySelectorAll(
      ".page"
    )
    .forEach(
      page => {
        page.classList.remove(
          "active"
        );
      }
    );

  const selectedPage =
    getElement(pageId);

  if (selectedPage) {
    selectedPage.classList.add(
      "active"
    );
  }

  document
    .querySelectorAll(
      ".bottom-nav button"
    )
    .forEach(
      button => {
        button.classList.toggle(
          "active",
          button.dataset.page ===
            pageId
        );
      }
    );

  if (pageId === "tree") {
    renderTree();

    setTimeout(
      centerTree,
      0
    );
  }

  if (pageId === "gacha") {
    renderGachaHistory();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   72. メイン描画
========================================================= */

function renderGame() {
  const player =
    calculatePlayerStats();

  const inventoryPower =
    getInventoryPower();

  const finalPower =
    player.power +
    inventoryPower * 20;

  const requiredExp =
    getRequiredExp();

  getElement("lv").textContent =
    game.level;

  getElement("gold").textContent =
    formatNumber(game.gold);

  getElement("crystal").textContent =
    formatNumber(game.crystal);

  getElement("gachaCrystal").textContent =
    formatNumber(game.crystal);

  getElement("soul").textContent =
    formatNumber(game.soul);

  getElement("treeSoul").textContent =
    formatNumber(game.soul);

  getElement("stage").textContent =
    game.stage;

  getElement("power").textContent =
    formatNumber(finalPower);

  getElement("playerHp").textContent =
    formatNumber(player.hp);

  getElement("atk").textContent =
    formatNumber(player.attack);

  getElement("def").textContent =
    formatNumber(player.defense);

  getElement("xp").textContent =
    formatNumber(game.exp);

  getElement("xpneed").textContent =
    formatNumber(requiredExp);

  getElement("xpbar").style.width =
    `${Math.min(
      100,
      game.exp /
      requiredExp *
      100
    )}%`;

  getElement("stageProgress").style.width =
    `${Math.min(
      100,
      (
        (
          game.stage - 1
        ) %
        5
      ) /
      4 *
      100
    )}%`;

  getElement("attackLevel").textContent =
    game.attackLevel;

  getElement("defenseLevel").textContent =
    game.defenseLevel;

  getElement("trainCost").textContent =
    formatNumber(
      getAttackUpgradeCost()
    );

  getElement("armorCost").textContent =
    formatNumber(
      getDefenseUpgradeCost()
    );

  getElement("offlineGold").textContent =
    formatNumber(
      game.idleBank
    );

  getElement("rebirths").textContent =
    game.rebirths;

  getElement("perm").textContent =
    `${(
      1 +
      game.rebirths * 0.12 +
      getTreeBonus("rebirth")
    ).toFixed(2)}x`;

  getElement("gainSoul").textContent =
    getRebirthSoulGain();

  getElement("doRebirth").disabled =
    game.stage < 10;

  renderGachaHistory();
}


/* =========================================================
   73. リアルタイム放置報酬
========================================================= */

setInterval(
  () => {
    game.idleBank +=
      Math.max(
        1,
        Math.floor(
          getIdleRate()
        )
      );

    getElement("offlineGold").textContent =
      formatNumber(
        game.idleBank
      );
  },
  1000
);


/* =========================================================
   74. 定期セーブ
========================================================= */

setInterval(
  saveGame,
  15000
);


/* =========================================================
   75. ページを閉じる前に保存
========================================================= */

window.addEventListener(
  "beforeunload",
  saveGame
);


/* =========================================================
   76. 画面サイズ変更
========================================================= */

window.addEventListener(
  "resize",
  () => {
    const treePage =
      getElement("tree");

    if (
      treePage.classList.contains(
        "active"
      )
    ) {
      centerTree();
    }
  }
);


/* =========================================================
   77. 起動
========================================================= */

calculateOfflineReward();

saveGame();

renderGame();
renderTree();
resetNodeDetail();

openPage("adventure");
