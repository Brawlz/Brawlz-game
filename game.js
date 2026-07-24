const $ = (selector) => document.querySelector(selector);

const elements = {
  arena: $("#arena"),
  startScreen: $("#start-screen"),
  endScreen: $("#end-screen"),
  startButton: $("#start-button"),
  restartButton: $("#restart-button"),
  enemy: $("#enemy"),
  weakSpot: $("#weak-spot"),
  tell: $("#tell"),
  tellLabel: $("#tell-label"),
  message: $("#message"),
  objective: $("#objective"),
  damageFlash: $("#damage-flash"),
  hitFlash: $("#hit-flash"),
  playerHealth: $("#player-health"),
  playerStamina: $("#player-stamina"),
  enemyHealth: $("#enemy-health"),
  injuryMeter: $("#injury-meter"),
  timer: $("#timer"),
  leftFist: $(".left-fist"),
  rightFist: $(".right-fist"),
  leftCharge: $("#left-charge"),
  rightCharge: $("#right-charge"),
  leftChargeWrap: $("#left-charge-wrap"),
  rightChargeWrap: $("#right-charge-wrap"),
  endKicker: $("#end-kicker"),
  endTitle: $("#end-title"),
  endCopy: $("#end-copy"),
  resultTime: $("#result-time"),
  resultAccuracy: $("#result-accuracy"),
  resultWeak: $("#result-weak"),
};

const ATTACKS = [
  {
    id: "left",
    label: "LEFT HOOK",
    windupClass: "windup-left",
    attackClass: "attack-left",
    avoid: "right",
    damage: 14,
    windup: 720,
  },
  {
    id: "right",
    label: "RIGHT CROSS",
    windupClass: "windup-right",
    attackClass: "attack-right",
    avoid: "left",
    damage: 17,
    windup: 650,
  },
  {
    id: "uppercut",
    label: "BODY DIP",
    windupClass: "windup-uppercut",
    attackClass: "attack-uppercut",
    avoid: "duck",
    damage: 22,
    windup: 830,
    exposesWeakSpot: true,
  },
];

const state = {
  running: false,
  playerHealth: 100,
  playerStamina: 100,
  enemyHealth: 100,
  defense: null,
  defenseUntil: 0,
  enemyBusy: false,
  enemyVulnerable: false,
  vulnerableUntil: 0,
  charge: { left: null, right: null },
  elapsed: 0,
  timeRemaining: 90,
  punches: 0,
  hits: 0,
  weakHits: 0,
  enemyAttacks: 0,
  attackTimer: null,
  clockTimer: null,
  staminaTimer: null,
  messageTimer: null,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function setPercent(element, value) {
  element.style.width = `${clamp(value, 0, 100)}%`;
}

function resetAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function setMessage(text) {
  elements.message.textContent = text;
  elements.message.classList.remove("show");
  void elements.message.offsetWidth;
  elements.message.classList.add("show");
}

function updateHud() {
  setPercent(elements.playerHealth, state.playerHealth);
  setPercent(elements.playerStamina, state.playerStamina);
  setPercent(elements.enemyHealth, state.enemyHealth);

  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  elements.timer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  elements.enemy.classList.remove("injured-1", "injured-2", "injured-3");
  if (state.enemyHealth <= 25) {
    elements.enemy.classList.add("injured-3");
    elements.injuryMeter.textContent = "BARELY STANDING";
  } else if (state.enemyHealth <= 50) {
    elements.enemy.classList.add("injured-2");
    elements.injuryMeter.textContent = "BADLY HURT";
  } else if (state.enemyHealth <= 75) {
    elements.enemy.classList.add("injured-1");
    elements.injuryMeter.textContent = "SHAKEN";
  } else {
    elements.injuryMeter.textContent = "COMPOSED";
  }
}

function clearCombatTimers() {
  clearTimeout(state.attackTimer);
  clearInterval(state.clockTimer);
  clearInterval(state.staminaTimer);
}

function resetGame() {
  clearCombatTimers();
  Object.assign(state, {
    running: false,
    playerHealth: 100,
    playerStamina: 100,
    enemyHealth: 100,
    defense: null,
    defenseUntil: 0,
    enemyBusy: false,
    enemyVulnerable: false,
    vulnerableUntil: 0,
    charge: { left: null, right: null },
    elapsed: 0,
    timeRemaining: 90,
    punches: 0,
    hits: 0,
    weakHits: 0,
    enemyAttacks: 0,
  });

  elements.enemy.className = "enemy idle";
  elements.weakSpot.className = "weak-spot";
  elements.tell.classList.remove("visible");
  elements.leftFist.classList.remove("punch", "charging");
  elements.rightFist.classList.remove("punch", "charging");
  elements.leftChargeWrap.classList.remove("active");
  elements.rightChargeWrap.classList.remove("active");
  elements.arena.classList.remove("dodge-left", "dodge-right", "duck", "guard");
  elements.objective.textContent = "Watch his shoulders. Every fighter gives something away.";
  updateHud();
}

function startGame() {
  resetGame();
  state.running = true;
  elements.startScreen.classList.add("hidden");
  elements.endScreen.classList.add("hidden");
  setMessage("ROUND ONE");

  state.clockTimer = setInterval(() => {
    if (!state.running) return;
    state.elapsed += 1;
    state.timeRemaining -= 1;
    updateHud();
    if (state.timeRemaining <= 0) finishFight(false, "TIME");
  }, 1000);

  state.staminaTimer = setInterval(() => {
    if (!state.running) return;
    const charging = state.charge.left || state.charge.right;
    if (!charging && state.playerStamina < 100) {
      state.playerStamina = clamp(state.playerStamina + 1.5, 0, 100);
      updateHud();
    }
  }, 120);

  scheduleEnemyAttack(1300);
}

function scheduleEnemyAttack(delay) {
  clearTimeout(state.attackTimer);
  if (!state.running) return;
  const healthPressure = (100 - state.enemyHealth) * 7;
  const nextDelay = Math.max(650, delay ?? 1600 - healthPressure + Math.random() * 750);
  state.attackTimer = setTimeout(enemyAttack, nextDelay);
}

async function enemyAttack() {
  if (!state.running || state.enemyBusy) return;
  state.enemyBusy = true;
  state.enemyAttacks += 1;

  const attackPool =
    state.enemyHealth > 72 ? ATTACKS.slice(0, 2) : ATTACKS;
  const attack = attackPool[Math.floor(Math.random() * attackPool.length)];
  const speedFactor = 1 - Math.min(0.32, (100 - state.enemyHealth) / 250);
  const windup = attack.windup * speedFactor;

  elements.enemy.classList.remove("idle");
  elements.enemy.classList.add(attack.windupClass);
  elements.tellLabel.textContent = attack.label;
  elements.tell.classList.add("visible");

  if (attack.exposesWeakSpot) {
    state.enemyVulnerable = true;
    state.vulnerableUntil = performance.now() + windup + 680;
    elements.weakSpot.classList.add("revealed");
    elements.objective.textContent = "There — his right ribs open when he dips. Drive your LEFT into it.";
  }

  await sleep(windup);
  if (!state.running) return;

  elements.tell.classList.remove("visible");
  elements.enemy.classList.remove(attack.windupClass);
  resetAnimation(elements.enemy, attack.attackClass);

  const defended =
    performance.now() <= state.defenseUntil &&
    (state.defense === attack.avoid || state.defense === "guard");

  if (defended) {
    const guarded = state.defense === "guard";
    const chipDamage = guarded ? Math.ceil(attack.damage * 0.25) : 0;
    state.playerHealth = clamp(state.playerHealth - chipDamage, 0, 100);
    if (guarded) state.playerStamina = clamp(state.playerStamina - 12, 0, 100);
    setMessage(guarded ? "BLOCKED — BUT IT COSTS YOU" : "CLEAN EVADE");
  } else {
    state.playerHealth = clamp(state.playerHealth - attack.damage, 0, 100);
    resetAnimation(elements.damageFlash, "active");
    setMessage(`${attack.label} CONNECTS`);
  }

  updateHud();
  await sleep(330);
  elements.enemy.classList.remove(attack.attackClass);

  if (state.playerHealth <= 0) {
    finishFight(false, "KNOCKOUT");
    return;
  }

  if (attack.exposesWeakSpot) {
    await sleep(470);
    state.enemyVulnerable = false;
    elements.weakSpot.classList.remove("revealed");
  }

  elements.enemy.classList.add("idle");
  state.enemyBusy = false;
  scheduleEnemyAttack();
}

function defend(type) {
  if (!state.running) return;
  const staminaCost = type === "guard" ? 7 : 9;
  if (state.playerStamina < staminaCost) {
    setMessage("TOO TIRED");
    return;
  }

  state.playerStamina -= staminaCost;
  state.defense = type;
  state.defenseUntil = performance.now() + (type === "guard" ? 480 : 420);
  const className = type === "left" ? "dodge-left" : type === "right" ? "dodge-right" : type;
  resetAnimation(elements.arena, className);
  setTimeout(() => elements.arena.classList.remove(className), 580);
  updateHud();
}

function beginCharge(side) {
  if (!state.running || state.charge[side] || state.playerStamina < 6) return;
  state.charge[side] = performance.now();
  const fist = side === "left" ? elements.leftFist : elements.rightFist;
  const wrap = side === "left" ? elements.leftChargeWrap : elements.rightChargeWrap;
  fist.classList.add("charging");
  wrap.classList.add("active");
  updateCharge(side);
}

function updateCharge(side) {
  if (!state.charge[side] || !state.running) return;
  const elapsed = performance.now() - state.charge[side];
  const charge = clamp(elapsed / 1200, 0, 1);
  const bar = side === "left" ? elements.leftCharge : elements.rightCharge;
  bar.style.width = `${charge * 100}%`;

  state.playerStamina = clamp(state.playerStamina - 0.33, 0, 100);
  updateHud();

  if (state.playerStamina <= 0) {
    releasePunch(side);
    return;
  }

  requestAnimationFrame(() => updateCharge(side));
}

function releasePunch(side) {
  if (!state.running || !state.charge[side]) return;
  const held = performance.now() - state.charge[side];
  state.charge[side] = null;
  const charge = clamp(held / 1200, 0.12, 1);
  const fist = side === "left" ? elements.leftFist : elements.rightFist;
  const bar = side === "left" ? elements.leftCharge : elements.rightCharge;
  const wrap = side === "left" ? elements.leftChargeWrap : elements.rightChargeWrap;

  fist.classList.remove("charging");
  resetAnimation(fist, "punch");
  wrap.classList.remove("active");
  bar.style.width = "0";
  state.punches += 1;

  const staminaCost = 5 + charge * 10;
  state.playerStamina = clamp(state.playerStamina - staminaCost, 0, 100);

  const inRange = !elements.enemy.classList.contains("knockout");
  const blocked = state.enemyBusy && !state.enemyVulnerable && Math.random() < 0.62;
  const weakHit =
    side === "left" &&
    state.enemyVulnerable &&
    performance.now() <= state.vulnerableUntil;

  if (inRange && (!blocked || weakHit)) {
    state.hits += 1;
    let damage = 4 + charge * 9;
    if (weakHit) {
      damage *= 2.35;
      state.weakHits += 1;
      elements.enemy.classList.remove("idle");
      resetAnimation(elements.enemy, "weak-stagger");
      setMessage(`RIB SHOT · ${Math.round(damage)} DAMAGE`);
      elements.objective.textContent = "You found it. Make him dip, then punish the right ribs.";
    } else {
      resetAnimation(elements.enemy, "stagger");
      setMessage(charge > 0.82 ? "HEAVY SHOT" : "CLEAN HIT");
    }
    state.enemyHealth = clamp(state.enemyHealth - damage, 0, 100);
    resetAnimation(elements.hitFlash, "active");
  } else {
    setMessage(blocked ? "HE READ IT" : "MISSED");
  }

  updateHud();
  setTimeout(() => {
    fist.classList.remove("punch");
    elements.enemy.classList.remove("stagger", "weak-stagger");
    if (state.running && !state.enemyBusy) elements.enemy.classList.add("idle");
  }, 640);

  if (state.enemyHealth <= 0) finishFight(true, "KNOCKOUT");
}

async function finishFight(won, reason) {
  if (!state.running) return;
  state.running = false;
  clearCombatTimers();
  elements.tell.classList.remove("visible");
  elements.weakSpot.classList.remove("revealed");

  if (won) {
    elements.enemy.classList.remove(
      "idle",
      "stagger",
      "weak-stagger",
      "windup-left",
      "windup-right",
      "windup-uppercut",
      "attack-left",
      "attack-right",
      "attack-uppercut",
    );
    elements.enemy.classList.add("knockout");
    setMessage("KNOCKOUT");
    await sleep(1650);
  }

  elements.endKicker.textContent = won ? "STAGE 01 COMPLETE" : "THE HOUSE WINS";
  elements.endTitle.textContent = reason;
  elements.endCopy.textContent = won
    ? "Mack hit the floor. The room knows your name now. Somewhere outside, a harder fight is waiting."
    : "Mack found the opening first. Read the tell, move late, and conserve your power.";
  elements.resultTime.textContent = `${String(Math.floor(state.elapsed / 60)).padStart(2, "0")}:${String(state.elapsed % 60).padStart(2, "0")}`;
  elements.resultAccuracy.textContent = `${state.punches ? Math.round((state.hits / state.punches) * 100) : 0}%`;
  elements.resultWeak.textContent = state.weakHits;
  elements.endScreen.classList.remove("hidden");
}

function onKeyDown(event) {
  if (event.repeat && !["KeyJ", "KeyK"].includes(event.code)) return;
  const handled = ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "KeyJ", "KeyK"];
  if (handled.includes(event.code)) event.preventDefault();

  if (event.code === "ArrowLeft") defend("left");
  if (event.code === "ArrowRight") defend("right");
  if (event.code === "ArrowDown") defend("duck");
  if (event.code === "ArrowUp") defend("guard");
  if (event.code === "KeyJ" && !event.repeat) beginCharge("left");
  if (event.code === "KeyK" && !event.repeat) beginCharge("right");
}

function onKeyUp(event) {
  if (event.code === "KeyJ") releasePunch("left");
  if (event.code === "KeyK") releasePunch("right");
}

elements.startButton.addEventListener("click", startGame);
elements.restartButton.addEventListener("click", startGame);
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("blur", () => {
  if (state.charge.left) releasePunch("left");
  if (state.charge.right) releasePunch("right");
});

resetGame();
