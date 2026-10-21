// ========================================
// 星剣と魔導書のクロニクル
// ========================================


const $ = id =>
  document.getElementById(id);


// ========================================
// GAME DATA
// ========================================

function newGame() {

  return {

    level: 1,

    exp: 0,

    gold: 120,

    crystal: 1000,

    soul: 25,

    stage: 1,

    attackLevel: 0,

    defenseLevel: 0,

    rebirths: 0,

    bank: 0,

    tree: {
      core: 1
    },

    inventory: [],

    lastSave:
      Date.now()

  };

}


let game =
  newGame();


const saved =
  localStorage.getItem(
    "astralIdleSave"
  );


if (saved) {

  try {

    game = {
      ...game,
      ...JSON.parse(saved)
    };

  }

  catch (error) {

    console.error(error);

  }

}


// ========================================
// SAVE
// ========================================

function saveGame() {

  game.lastSave =
    Date.now();

  localStorage.setItem(
    "astralIdleSave",
    JSON.stringify(game)
  );

}


// ========================================
// SKILL TREE
// ========================================

const treeNodes = [];

const treeEdges = [];


/*
中心座標
*/

const TREE_CENTER = {
  x: 1200,
  y: 1200
};


// ========================================
// CORE
// ========================================

treeNodes.push({

  id: "core",

  name:
    "星魂の核",

  icon:
    "☀",

  type:
    "core",

  size:
    "core",

  x:
    TREE_CENTER.x,

  y:
    TREE_CENTER.y,

  maxRank:
    1,

  cost:
    0,

  effect:
    "all",

  value:
    0,

  description:
    "すべての星魂能力の起点。"

});


// ========================================
// BRANCH CONFIG
// ========================================

const branches = [

  {
    id:
      "war",

    name:
      "闘争",

    icon:
      "⚔",

    angle:
      -150,

    color:
      "#e94d59",

    effect:
      "attack",

    labels: [
      "猛攻",
      "剣気",
      "破甲",
      "連撃",
      "会心",
      "怒涛",
      "武神",
      "死線",
      "狂戦",
      "処刑"
    ]
  },


  {
    id:
      "guard",

    name:
      "守護",

    icon:
      "🛡",

    angle:
      150,

    color:
      "#50c77b",

    effect:
      "defense",

    labels: [
      "生命",
      "堅牢",
      "再生",
      "鉄壁",
      "抵抗",
      "活力",
      "守護",
      "不屈",
      "聖盾",
      "不死"
    ]
  },


  {
    id:
      "magic",

    name:
      "魔導",

    icon:
      "🔮",

    angle:
      -90,

    color:
      "#457de8",

    effect:
      "magic",

    labels: [
      "魔力",
      "元素",
      "集中",
      "詠唱",
      "炎術",
      "雷術",
      "氷術",
      "秘術",
      "大魔導",
      "星魔"
    ]
  },


  {
    id:
      "fate",

    name:
      "運命",

    icon:
      "✦",

    angle:
      90,

    color:
      "#a759dc",

    effect:
      "idle",

    labels: [
      "黄金",
      "経験",
      "幸運",
      "時流",
      "祝福",
      "繁栄",
      "加速",
      "恩寵",
      "運命",
      "豊穣"
    ]
  },


  {
    id:
      "astral",

    name:
      "星界",

    icon:
      "💎",

    angle:
      -30,

    color:
      "#3fc8cc",

    effect:
      "loot",

    labels: [
      "星石",
      "宝運",
      "装備",
      "希少",
      "秘宝",
      "星光",
      "共鳴",
      "星辰",
      "奇跡",
      "天星"
    ]
  },


  {
    id:
      "rebirth",

    name:
      "輪廻",

    icon:
      "♾",

    angle:
      30,

    color:
      "#ece2aa",

    effect:
      "rebirth",

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
      "無限"
    ]
  }

];


// ========================================
// CREATE LARGE TREE
// ========================================

function createTree() {

  branches.forEach(
    branch => {

      createBranch(
        branch
      );

    }
  );

}


function createBranch(
  branch
) {

  const radians =
    branch.angle *
    Math.PI /
    180;


  let previous =
    "core";


  /*
  メイン幹 10ノード
  */

  for (
    let i = 1;
    i <= 10;
    i++
  ) {

    const distance =
      130 +
      i *
      105;


    const spread =
      Math.sin(
        i * 1.4
      ) *
      45;


    const x =
      TREE_CENTER.x +
      Math.cos(
        radians
      ) *
      distance +
      Math.cos(
        radians +
        Math.PI / 2
      ) *
      spread;


    const y =
      TREE_CENTER.y +
      Math.sin(
        radians
      ) *
      distance +
      Math.sin(
        radians +
        Math.PI / 2
      ) *
      spread;


    const id =
      branch.id +
      "_main_" +
      i;


    let size =
      "small";


    if (
      i === 4 ||
      i === 7
    ) {

      size =
        "medium";

    }


    if (
      i === 10
    ) {

      size =
        "keystone";

    }


    treeNodes.push({

      id,

      name:
        branch.labels[
          i - 1
        ],

      icon:
        i === 10
          ?
          branch.icon
          :
          "●",

      type:
        branch.id,

      size,

      x,

      y,

      maxRank:
        size ===
        "keystone"
          ?
          1
          :
          3,

      cost:
        Math.ceil(
          i / 2
        ),

      effect:
        branch.effect,

      value:
        size ===
        "keystone"
          ?
          0.25
          :
          0.025 +
          i *
          0.004,

      required:
        previous,

      description:
        branch.name +
        "系能力を強化する。"

    });


    treeEdges.push({

      from:
        previous,

      to:
        id

    });


    /*
    各メインノードから
    小枝を1～2本生成
    */

    if (
      i >= 2
    ) {

      createSideNodes(
        branch,
        id,
        x,
        y,
        radians,
        i
      );

    }


    previous =
      id;

  }

}


// ========================================
// SIDE BRANCHES
// ========================================

function createSideNodes(
  branch,
  parentId,
  parentX,
  parentY,
  radians,
  level
) {

  const sideCount =
    level % 3 === 0
      ?
      2
      :
      1;


  for (
    let side = 0;
    side < sideCount;
    side++
  ) {

    const direction =
      side === 0
        ?
        1
        :
        -1;


    let previous =
      parentId;


    const length =
      2 +
      (
        level %
        2
      );


    for (
      let j = 1;
      j <= length;
      j++
    ) {

      const offset =
        80 *
        j;


      const forward =
        35 *
        j;


      const x =
        parentX +
        Math.cos(
          radians
        ) *
        forward +
        Math.cos(
          radians +
          Math.PI / 2
        ) *
        offset *
        direction;


      const y =
        parentY +
        Math.sin(
          radians
        ) *
        forward +
        Math.sin(
          radians +
          Math.PI / 2
        ) *
        offset *
        direction;


      const id =
        branch.id +
        "_side_" +
        level +
        "_" +
        side +
        "_" +
        j;


      const major =
        j === length &&
        level % 4 === 0;


      treeNodes.push({

        id,

        name:
          getSideNodeName(
            branch.id,
            level,
            j
          ),

        icon:
          major
            ?
            branch.icon
            :
            "◆",

        type:
          branch.id,

        size:
          major
            ?
            "major"
            :
            "small",

        x,

        y,

        maxRank:
          major
            ?
            1
            :
            2,

        cost:
          Math.max(
            1,
            Math.ceil(
              level /
              3
            )
          ),

        effect:
          branch.effect,

        value:
          major
            ?
            0.12
            :
            0.02,

        required:
          previous,

        description:
          branch.name +
          "の派生能力。"

      });


      treeEdges.push({

        from:
          previous,

        to:
          id

      });


      previous =
        id;

    }

  }

}


// ========================================
// SIDE NODE NAMES
// ========================================

function getSideNodeName(
  type,
  level,
  index
) {

  const names = {

    war: [
      "剣技",
      "斬撃",
      "裂傷",
      "反撃",
      "致命",
      "追撃"
    ],

    guard: [
      "活性",
      "装甲",
      "治癒",
      "障壁",
      "耐性",
      "生命"
    ],

    magic: [
      "炎",
      "雷",
      "氷",
      "光",
      "闇",
      "元素"
    ],

    fate: [
      "黄金",
      "経験",
      "放置",
      "幸運",
      "速度",
      "報酬"
    ],

    astral: [
      "装備",
      "宝箱",
      "希少",
      "星石",
      "秘宝",
      "共鳴"
    ],

    rebirth: [
      "星魂",
      "転生",
      "記憶",
      "永劫",
      "魂力",
      "輪廻"
    ]

  };


  const list =
    names[type];


  return (
    list[
      (
        level +
        index
      ) %
      list.length
    ] +
    " " +
    level
  );

}


createTree();


// ========================================
// TREE STATE
// ========================================

function rank(
  id
) {

  return (
    game.tree[id] ||
    0
  );

}


function nodeAvailable(
  node
) {

  if (
    node.id ===
    "core"
  ) {

    return true;

  }


  return (
    rank(
      node.required
    ) >
    0
  );

}


// ========================================
// TREE BONUSES
// ========================================

function treeBonus(
  effect
) {

  let total =
    0;


  treeNodes.forEach(
    node => {

      if (
        node.effect ===
        effect
      ) {

        total +=
          rank(
            node.id
          ) *
          node.value;

      }

    }
  );


  return total;

}


// ========================================
// STATS
// ========================================

function stats() {

  const permanent =
    1 +
    game.rebirths *
    .12;


  let attack =
    (
      25 +
      game.level *
      7 +
      game.attackLevel *
      8
    ) *
    permanent *
    (
      1 +
      treeBonus(
        "attack"
      )
    );


  let defense =
    (
      10 +
      game.level *
      3 +
      game.defenseLevel *
      6
    ) *
    permanent *
    (
      1 +
      treeBonus(
        "defense"
      )
    );


  let hp =
    (
      180 +
      game.level *
      35
    ) *
    permanent *
    (
      1 +
      treeBonus(
        "defense"
      ) *
      .5
    );


  return {

    attack:
      Math.floor(
        attack
      ),

    defense:
      Math.floor(
        defense
      ),

    hp:
      Math.floor(
        hp
      ),

    power:
      Math.floor(
        attack *
        14 +
        defense *
        10 +
        hp *
        2
      )

  };

}


// ========================================
// RENDER TREE
// ========================================

function renderTree() {

  const container =
    $("treeNodes");


  container.innerHTML =
    "";


  treeNodes.forEach(
    node => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "treeNode " +
        node.type +
        " " +
        (
          node.size ||
          ""
        );


      if (
        rank(
          node.id
        ) >
        0
      ) {

        button.classList.add(
          "owned"
        );

      }

      else if (
        nodeAvailable(
          node
        )
      ) {

        button.classList.add(
          "available"
        );

      }

      else {

        button.classList.add(
          "locked"
        );

      }


      button.style.left =
        node.x +
        "px";

      button.style.top =
        node.y +
        "px";


      button.dataset.id =
        node.id;

      button.dataset.name =
        node.name;


      button.innerHTML =
        node.icon;


      button.onclick =
        () =>
          selectNode(
            node
          );


      container.appendChild(
        button
      );

    }
  );


  renderLines();

}


// ========================================
// CONNECTIONS
// ========================================

function renderLines() {

  const svg =
    $("treeLines");


  svg.innerHTML =
    "";


  treeEdges.forEach(
    edge => {

      const from =
        treeNodes.find(
          node =>
            node.id ===
            edge.from
        );


      const to =
        treeNodes.find(
          node =>
            node.id ===
            edge.to
        );


      if (
        !from ||
        !to
      ) {

        return;

      }


      const line =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );


      line.setAttribute(
        "x1",
        from.x
      );

      line.setAttribute(
        "y1",
        from.y
      );

      line.setAttribute(
        "x2",
        to.x
      );

      line.setAttribute(
        "y2",
        to.y
      );


      line.setAttribute(
        "class",
        rank(
          to.id
        ) >
        0
          ?
          "treeLine active"
          :
          "treeLine"
      );


      svg.appendChild(
        line
      );

    }
  );

}


// ========================================
// NODE DETAILS
// ========================================

function selectNode(
  node
) {

  const current =
    rank(
      node.id
    );


  const price =
    node.cost +
    current;


  let status =
    "";


  if (
    current >=
    node.maxRank
  ) {

    status =
      "最大ランク";

  }

  else if (
    !nodeAvailable(
      node
    )
  ) {

    status =
      "前のノードを取得してください";

  }

  else {

    status =
      `強化 🌟${price}`;

  }


  $("nodeDetail")
    .innerHTML = `

      <div class="detailIcon">
        ${node.icon}
      </div>

      <div style="flex:1">

        <strong>
          ${node.name}
        </strong>

        <p>
          ${node.description}
        </p>

        <p>
          Rank
          ${current}
          /
          ${node.maxRank}
          ・
          効果
          +${Math.round(
            node.value *
            100
          )}%
        </p>

        <button
          id="buyNode"
        >
          ${status}
        </button>

      </div>

    `;


  const button =
    $("buyNode");


  if (
    current >=
      node.maxRank ||
    !nodeAvailable(
      node
    )
  ) {

    button.disabled =
      true;

  }


  button.onclick =
    () => {

      buyNode(
        node
      );

    };

}


// ========================================
// PURCHASE NODE
// ========================================

function buyNode(
  node
) {

  const current =
    rank(
      node.id
    );


  const price =
    node.cost +
    current;


  if (
    game.soul <
    price
  ) {

    toast(
      "星魂が足りません"
    );

    return;

  }


  if (
    !nodeAvailable(
      node
    )
  ) {

    return;

  }


  if (
    current >=
    node.maxRank
  ) {

    return;

  }


  game.soul -=
    price;


  game.tree[
    node.id
  ] =
    current +
    1;


  saveGame();

  render();

  renderTree();

  selectNode(
    node
  );


  toast(
    node.name +
    "を取得！"
  );

}


// ========================================
// RESET TREE
// ========================================

$("resetTree")
  .onclick =
  () => {

    let refund =
      0;


    treeNodes.forEach(
      node => {

        if (
          node.id ===
          "core"
        ) {

          return;

        }


        const r =
          rank(
            node.id
          );


        for (
          let i = 0;
          i < r;
          i++
        ) {

          refund +=
            node.cost +
            i;

        }

      }
    );


    if (
      refund ===
      0
    ) {

      toast(
        "取得能力がありません"
      );

      return;

    }


    if (
      !confirm(
        `星魂${refund}個を返却してリセットしますか？`
      )
    ) {

      return;

    }


    game.soul +=
      refund;


    game.tree = {
      core: 1
    };


    saveGame();

    render();

    renderTree();

}


// ========================================
// TREE CAMERA
// ========================================

let treeScale =
  .75;


let treeX =
  0;

let treeY =
  0;


let dragging =
  false;

let dragStartX =
  0;

let dragStartY =
  0;


function updateTreeTransform() {

  $("treeWorld")
    .style.transform =
    `translate(
      ${treeX}px,
      ${treeY}px
    )
    scale(
      ${treeScale}
    )`;


  $("zoomDisplay")
    .textContent =
    Math.round(
      treeScale *
      100
    ) +
    "%";

}


function centerTree() {

  const viewport =
    $("treeViewport");


  treeX =
    viewport.clientWidth /
    2 -
    TREE_CENTER.x *
    treeScale;


  treeY =
    viewport.clientHeight /
    2 -
    TREE_CENTER.y *
    treeScale;


  updateTreeTransform();

}


$("treeViewport")
  .addEventListener(
    "pointerdown",
    event => {

      dragging =
        true;


      dragStartX =
        event.clientX -
        treeX;


      dragStartY =
        event.clientY -
        treeY;


      $("treeViewport")
        .setPointerCapture(
          event.pointerId
        );

    }
  );


$("treeViewport")
  .addEventListener(
    "pointermove",
    event => {

      if (
        !dragging
      ) {

        return;

      }


      treeX =
        event.clientX -
        dragStartX;


      treeY =
        event.clientY -
        dragStartY;


      updateTreeTransform();

    }
  );


$("treeViewport")
  .addEventListener(
    "pointerup",
    () => {

      dragging =
        false;

    }
  );


$("treeViewport")
  .addEventListener(
    "wheel",
    event => {

      event.preventDefault();


      if (
        event.deltaY <
        0
      ) {

        treeScale +=
          .05;

      }

      else {

        treeScale -=
          .05;

      }


      treeScale =
        Math.max(
          .35,
          Math.min(
            1.5,
            treeScale
          )
        );


      updateTreeTransform();

    },
    {
      passive:
        false
    }
  );


$("zoomIn")
  .onclick =
  () => {

    treeScale =
      Math.min(
        1.5,
        treeScale +
        .1
      );


    updateTreeTransform();

  };


$("zoomOut")
  .onclick =
  () => {

    treeScale =
      Math.max(
        .35,
        treeScale -
        .1
      );


    updateTreeTransform();

  };


$("centerTree")
  .onclick =
  centerTree;


// ========================================
// SEARCH
// ========================================

$("nodeSearch")
  .addEventListener(
    "input",
    event => {

      const value =
        event.target.value
        .trim()
        .toLowerCase();


      document
        .querySelectorAll(
          ".treeNode"
        )
        .forEach(
          element => {

            element
              .classList
              .remove(
                "searchHit"
              );


            if (
              value &&
              element
                .dataset
                .name
                .toLowerCase()
                .includes(
                  value
                )
            ) {

              element
                .classList
                .add(
                  "searchHit"
                );

            }

          }
        );

    }
  );


// ========================================
// BATTLE
// ========================================

let fighting =
  false;


$("fight")
  .onclick =
  () => {

    if (
      fighting
    ) {

      return;

    }


    fighting =
      true;


    const player =
      stats();


    const enemyMax =
      Math.floor(
        180 *
        Math.pow(
          1.28,
          game.stage -
          1
        )
      );


    let hp =
      enemyMax;


    let playerHp =
      player.hp;


    $("maxhp")
      .textContent =
      enemyMax;


    $("hp")
      .textContent =
      hp;


    $("hpbar")
      .style.width =
      "100%";


    const battle =
      setInterval(
        () => {

          const damage =
            Math.floor(
              player.attack *
              (
                1 +
                treeBonus(
                  "magic"
                ) *
                .3
              )
            );


          hp -=
            damage;


          battleLog(
            `⚔️ ${damage}ダメージ！`
          );


          playEffect();


          $("hp")
            .textContent =
            Math.max(
              0,
              hp
            );


          $("hpbar")
            .style.width =
            Math.max(
              0,
              hp /
              enemyMax *
              100
            ) +
            "%";


          if (
            hp <= 0
          ) {

            clearInterval(
              battle
            );


            winBattle();

            fighting =
              false;

            return;

          }


          const enemyDamage =
            Math.max(
              3,
              15 +
              game.stage *
              8 -
              player.defense *
              .3
            );


          playerHp -=
            enemyDamage;


          if (
            playerHp <= 0
          ) {

            clearInterval(
              battle
            );


            battleLog(
              "💀 敗北した..."
            );


            fighting =
              false;

          }

        },
        600
      );

  };


function winBattle() {

  const reward =
    Math.floor(
      (
        40 +
        game.stage *
        16
      ) *
      (
        1 +
        treeBonus(
          "idle"
        ) *
        .4
      )
    );


  game.gold +=
    reward;


  game.exp +=
    50 +
    game.stage *
    10;


  game.crystal +=
    15;


  game.stage++;


  checkLevel();


  battleLog(
    `🏆 勝利！ +${reward}G`
  );


  saveGame();

  render();

}


// ========================================
// EFFECT
// ========================================

function playEffect() {

  const effect =
    $("battleEffect");


  effect.textContent =
    Math.random() >
    .5
      ?
      "⚔️"
      :
      "🔥";


  effect.classList
    .remove(
      "active"
    );


  void effect.offsetWidth;


  effect.classList
    .add(
      "active"
    );

}


// ========================================
// LEVEL
// ========================================

function checkLevel() {

  while (
    game.exp >=
    game.level *
    100
  ) {

    game.exp -=
      game.level *
      100;


    game.level++;

  }

}


// ========================================
// UPGRADES
// ========================================

$("train")
  .onclick =
  () => {

    const cost =
      50 +
      game.attackLevel *
      40;


    if (
      game.gold <
      cost
    ) {

      toast(
        "ゴールド不足"
      );

      return;

    }


    game.gold -=
      cost;


    game.attackLevel++;


    saveGame();

    render();

  };


$("armor")
  .onclick =
  () => {

    const cost =
      50 +
      game.defenseLevel *
      40;


    if (
      game.gold <
      cost
    ) {

      toast(
        "ゴールド不足"
      );

      return;

    }


    game.gold -=
      cost;


    game.defenseLevel++;


    saveGame();

    render();

  };


// ========================================
// IDLE
// ========================================

$("claim")
  .onclick =
  () => {

    game.gold +=
      game.bank;


    game.bank =
      0;


    saveGame();

    render();

  };


function idleRate() {

  return (
    1 +
    game.stage *
    .2
  ) *
  (
    1 +
    treeBonus(
      "idle"
    )
  );

}


// ========================================
// GACHA
// ========================================

function pull(
  count,
  price
) {

  if (
    game.crystal <
    price
  ) {

    toast(
      "クリスタル不足"
    );

    return;

  }


  game.crystal -=
    price;


  const output =
    [];


  for (
    let i = 0;
    i < count;
    i++
  ) {

    const value =
      Math.random();


    let rarity =
      "R";


    if (
      value <
      .05
    ) {

      rarity =
        "SSR";

    }

    else if (
      value <
      .28
    ) {

      rarity =
        "SR";

    }


    if (
      count === 10 &&
      i === 9 &&
      rarity === "R"
    ) {

      rarity =
        "SR";

    }


    const names = [

      "星剣",

      "月杖",

      "天弓",

      "星鎧",

      "輪廻石",

      "秘奥義書"

    ];


    const item = {

      name:
        names[
          Math.floor(
            Math.random() *
            names.length
          )
        ],

      rarity

    };


    game.inventory.push(
      item
    );


    output.push(
      item
    );

  }


  $("results")
    .innerHTML =
    output.map(
      item =>
      `
        <div
          class="card ${item.rarity}"
        >

          <b>
            ${item.rarity}
          </b>

          <br>

          ${item.name}

        </div>
      `
    ).join("");


  saveGame();

  render();

}


$("pull1")
  .onclick =
  () =>
    pull(
      1,
      100
    );


$("pull10")
  .onclick =
  () =>
    pull(
      10,
      900
    );


// ========================================
// REBIRTH
// ========================================

$("doRebirth")
  .onclick =
  () => {

    if (
      game.stage <
      10
    ) {

      toast(
        "Stage 10で解放"
      );

      return;

    }


    const gain =
      Math.floor(
        game.stage /
        5
      ) +
      Math.floor(
        treeBonus(
          "rebirth"
        ) *
        10
      );


    if (
      !confirm(
        `転生して🌟${gain}を獲得しますか？`
      )
    ) {

      return;

    }


    game.soul +=
      gain;


    game.rebirths++;


    game.level =
      1;


    game.exp =
      0;


    game.gold =
      120;


    game.stage =
      1;


    game.attackLevel =
      0;


    game.defenseLevel =
      0;


    saveGame();

    render();

    renderTree();


    toast(
      "🌠 転生した！"
    );

  };


// ========================================
// NAVIGATION
// ========================================

function openPage(
  page
) {

  document
    .querySelectorAll(
      ".page"
    )
    .forEach(
      element => {

        element.classList
          .remove(
            "active"
          );

      }
    );


  $(page)
    .classList
    .add(
      "active"
    );


  document
    .querySelectorAll(
      ".bottomNav button"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.page ===
          page
        );

      }
    );


  if (
    page ===
    "tree"
  ) {

    renderTree();


    setTimeout(
      centerTree,
      0
    );

  }


  window.scrollTo(
    0,
    0
  );

}


// ========================================
// RENDER
// ========================================

function render() {

  const s =
    stats();


  $("lv").textContent =
    game.level;


  $("gold").textContent =
    Math.floor(
      game.gold
    );


  $("crystal").textContent =
    game.crystal;


  $("gachaCrystal")
    .textContent =
    game.crystal;


  $("soul").textContent =
    game.soul;


  $("treeSoul")
    .textContent =
    game.soul;


  $("stage").textContent =
    game.stage;


  $("power").textContent =
    s.power;


  $("playerHp")
    .textContent =
    s.hp;


  $("atk")
    .textContent =
    s.attack;


  $("def")
    .textContent =
    s.defense;


  $("xp")
    .textContent =
    game.exp;


  $("xpneed")
    .textContent =
    game.level *
    100;


  $("xpbar")
    .style.width =
    Math.min(
      100,
      game.exp /
      (
        game.level *
        100
      ) *
      100
    ) +
    "%";


  $("trainCost")
    .textContent =
    50 +
    game.attackLevel *
    40;


  $("armorCost")
    .textContent =
    50 +
    game.defenseLevel *
    40;


  $("offlineGold")
    .textContent =
    Math.floor(
      game.bank
    );


  $("rebirths")
    .textContent =
    game.rebirths;


  $("perm")
    .textContent =
    (
      1 +
      game.rebirths *
      .12
    ).toFixed(2) +
    "x";


  $("gainSoul")
    .textContent =
    Math.floor(
      game.stage /
      5
    );


  $("inventory")
    .innerHTML =
    game.inventory
      .slice(-20)
      .reverse()
      .map(
        item =>
        `
          <div
            class="card ${item.rarity}"
          >

            ${item.rarity}

            <br>

            ${item.name}

          </div>
        `
      )
      .join("");

}


// ========================================
// LOG
// ========================================

function battleLog(
  text
) {

  $("log")
    .textContent =
    text;

}


// ========================================
// TOAST
// ========================================

function toast(
  text
) {

  const target =
    $("toast");


  target.textContent =
    text;


  target.classList.add(
    "show"
  );


  setTimeout(
    () => {

      target.classList.remove(
        "show"
      );

    },
    1700
  );

}


// ========================================
// OFFLINE REWARD
// ========================================

const elapsed =
  Math.min(
    8 *
    60 *
    60,

    Math.max(
      0,
      (
        Date.now() -
        game.lastSave
      ) /
      1000
    )
  );


game.bank +=
  Math.floor(
    elapsed *
    idleRate()
  );


setInterval(
  () => {

    game.bank +=
      Math.max(
        1,
        Math.floor(
          idleRate()
        )
      );


    $("offlineGold")
      .textContent =
      Math.floor(
        game.bank
      );

  },
  1000
);


// ========================================
// START
// ========================================

saveGame();

render();

renderTree();
