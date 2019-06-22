/// --- Play@https://export-wbozohsohz.now.sh ---
/// --- Imports ---
//#region
import { loadPatches, RegrowSystem } from "./modules/sweetcorn";

import {
  WindmillBladeData,
  WindmillBladeRotateSystem
} from "./modules/windmill";

import {
  balloonMagentaTargets,
  balloonCyanTargets,
  balloonOrangeTargets,
  BalloonData,
  TargetData,
  PauseOnTarget,
  TranslateHorizontalSystem,
  TranslateVerticalSystem
} from "./modules/balloon";

import { ChickFlag } from "./modules/chick";

import {
  EXPLOSION_TIME_OUT_SYNC,
  EggData,
  EggExplosionTimeOut
} from "./modules/egg";

import { GunData, AmmoData, ShootSystem, PickupSystem } from "./modules/gun";

import {
  gameManager,
  Countdown,
  CountdownSystem,
  GameOverSystem
} from "./modules/manager";

import { ScorePopUpFlag, scoreEvents, ScoreUpdateEvent } from "./modules/score";

import { ParticleSystem, Particle, particleShape } from "./modules/particle";

import { initialiseExplosions } from "./modules/explosion";

import {
  ammoPickupSound,
  shootSound,
  shootSource,
  clipEmptySound,
  clipEmptySource,
  gunPickupSound,
  gunPickupSource,
  eggExplosionSound,
  airRaidSound,
  airRaidSource,
  gameOverSound,
  sweetcornSound,
  eggPopOutMagentaSound,
  eggPopOutCyanSound,
  eggPopOutOrangeSound,
  eggFallingMagentaSound,
  eggFallingCyanSound,
  eggFallingOrangeSound,
  musicSound
} from "./modules/audio";
//#endregion

// Player data
let camera = Camera.instance;

/// --- Score Events ---
const scoreTenEvent = new ScoreUpdateEvent(10); // Score for the orange egg
const scoreThirtyEvent = new ScoreUpdateEvent(30); // Score for the magenta egg
const scoreFiftyEvent = new ScoreUpdateEvent(50); // Score for the cyan egg

/// --- Gun ---
//#region
// Shooting the gun
export let gun = new Entity();
gun.addComponent(new GLTFShape("models/rifle.glb"));
let gunTransform = new Transform({ position: new Vector3(16, 0, 16) });
gun.addComponent(gunTransform);

let gunData = new GunData(0.4); // Set gun cooldown to 0.4s
gun.addComponent(gunData);

// Point and click to grab gun or just walk near it
gun.addComponent(
  new OnClick(e => {
    grabGun();
  })
);

// Calculating distance between two points
function calculateDistance(point1: Vector3, point2: Vector3): number {
  const a = point1.x - point2.x;
  const b = point1.z - point2.z;
  return a * a + b * b;
}

function grabGun() {
  // If player doesn't have a gun and is within 3m from the gun
  let distance = calculateDistance(gunTransform.position, camera.position);

  if (!gunData.playerHasGun && distance < 9) {
    log("Locked and Loaded!!");
    gunPickupSource.playOnce();
    gun.getComponent(GLTFShape).visible = false;
    gunData.cooldownTimer = 1.5; // 1.5s cooldown delay whilst arming the player
    gunData.playerHasGun = true;
    gunData.ammoLeft = 6; // Start with full ammo
    airRaidSource.playOnce();
    gameManager.addComponent(new Countdown());
  }
}

// Shooting the gun
const input = Input.instance;
input.subscribe("BUTTON_DOWN", e => {
  if (gunData.playerHasGun) {
    shoot();
  } else {
    log("Grab the gun...");
  }
});

function shoot() {
  if (gunData.ammoLeft == 0) {
    log("Reload!!");
    clipEmptySource.playOnce();
    return;
  }

  if (gunData.cooldownTimer <= 0) {
    log("Fire!!");
    shootSource.playOnce();
    gunData.ammoLeft -= 1;
    gunData.cooldownTimer = gunData.cooldownReset;
    log("Ammo Left: " + gunData.ammoLeft);
  }
}

// Ammo pack
let ammoPack = new Entity();
ammoPack.addComponent(new GLTFShape("models/ammoPack.glb"));
let ammoPackTransform = new Transform({ position: new Vector3(16, 0.072, 16) });
ammoPack.addComponent(ammoPackTransform);
ammoPack.addComponent(new AmmoData(2.5)); // Set ammo cooldown to 2.5s
//#endregion

/// --- Farm ---
// Farm model
let farm = new Entity();
farm.addComponent(new GLTFShape("models/farm.glb"));
farm.addComponent(new Transform({ position: new Vector3(16, 0, 16) }));

// Blade model
export let blade = new Entity();
blade.addComponent(new GLTFShape("models/blade.glb"));
blade.addComponent(
  new Transform({
    position: new Vector3(16, 13, 11.3),
    rotation: Quaternion.Euler(0, 0, 0)
  })
);
blade.addComponent(new WindmillBladeData());

/// --- Balloons ---
//#region
let balloonBasketShape = new GLTFShape("models/balloonBasket.glb");

// Magenta balloon setup
let balloonMagentaBasket = new Entity();
balloonMagentaBasket.addComponent(balloonBasketShape);
balloonMagentaBasket.addComponent(
  new Transform({ position: new Vector3(16, 20, 28.5) })
);
let balloonMagenta = new Entity();
balloonMagenta.setParent(balloonMagentaBasket);
balloonMagenta.addComponent(new GLTFShape("models/balloonMagenta.gltf"));
balloonMagentaBasket.addComponent(new BalloonData(1)); // Initialising the magenta balloon with an rowID of 1
balloonMagentaBasket.getComponent(BalloonData).speed = 2.0; // Changing the speed of the magenta balloon

// Cyan balloon setup
let balloonCyanBasket = new Entity();
balloonCyanBasket.addComponent(balloonBasketShape);
balloonCyanBasket.addComponent(
  new Transform({ position: new Vector3(16, 20, 16) })
);
let balloonCyan = new Entity();
balloonCyan.setParent(balloonCyanBasket);
balloonCyan.addComponent(new GLTFShape("models/balloonCyan.gltf"));
let balloonCyanData = new BalloonData(2); // Initialising the cyan balloon with an rowID of 2
balloonCyanBasket.addComponent(balloonCyanData);
balloonCyanData.horizontalDirection = Vector3.Right(); // Give the cyan balloon a different travel direction
balloonCyanData.minimumHeight = 17; // Minimum height of 17m to avoid windmill

// Orange balloon setup
let balloonOrangeBasket = new Entity();
balloonOrangeBasket.addComponent(balloonBasketShape);
balloonOrangeBasket.addComponent(
  new Transform({ position: new Vector3(16, 20, 16) })
);
let balloonOrange = new Entity();
balloonOrange.setParent(balloonOrangeBasket);
balloonOrange.addComponent(new GLTFShape("models/balloonOrange.gltf"));
balloonOrangeBasket.addComponent(new BalloonData(3)); // Initialising the orange balloon with an rowID of 3
balloonOrangeBasket.getComponent(BalloonData).speed = 1.0; // Changing the speed of the orange balloon

// Adding targeting information to the balloons
balloonMagentaBasket.addComponent(new TargetData());
balloonMagentaBasket.getComponent(TargetData).targets = balloonMagentaTargets;
balloonCyanBasket.addComponent(new TargetData());
balloonCyanBasket.getComponent(TargetData).targets = balloonCyanTargets;
balloonOrangeBasket.addComponent(new TargetData());
balloonOrangeBasket.getComponent(TargetData).targets = balloonOrangeTargets;
//#endregion

/// --- Chick ---
//#region
let chickShape = new GLTFShape("models/chick.glb");

// Magenta chick setup
let chickMagenta = new Entity();
chickMagenta.setParent(balloonMagentaBasket);
chickMagenta.addComponent(chickShape);
chickMagenta.addComponent(new ChickFlag());

// Magenta chick animation setup
let chickMagentaAnimator = new Animator();
chickMagenta.addComponent(chickMagentaAnimator);

const lookAroundMagentaChick = new AnimationState("lookAround");
lookAroundMagentaChick.speed = 1.3; // Adding variation to each chick's lookAround animation
lookAroundMagentaChick.looping = true;
lookAroundMagentaChick.play();
chickMagentaAnimator.addClip(lookAroundMagentaChick);

const grabEggMagentaChick = new AnimationState("grabEgg");
grabEggMagentaChick.looping = false;
grabEggMagentaChick.shouldReset = true;
chickMagentaAnimator.addClip(grabEggMagentaChick);

// Cyan chick setup
let chickCyan = new Entity();
chickCyan.setParent(balloonCyanBasket);
chickCyan.addComponent(chickShape);
chickCyan.addComponent(new ChickFlag());

// Cyan chick animation setup
let chickCyanAnimator = new Animator();
chickCyan.addComponent(chickCyanAnimator);

const lookAroundCyanChick = new AnimationState("lookAround");
lookAroundCyanChick.speed = 1.1; // Adding variation to each chick's lookAround animation
lookAroundCyanChick.looping = true;
lookAroundCyanChick.play();
chickCyanAnimator.addClip(lookAroundCyanChick);

const grabEggCyanChick = new AnimationState("grabEgg");
grabEggCyanChick.looping = false;
grabEggCyanChick.shouldReset = true;
chickCyanAnimator.addClip(grabEggCyanChick);

// Orange chick setup
let chickOrange = new Entity();
chickOrange.setParent(balloonOrangeBasket);
chickOrange.addComponent(chickShape);
chickOrange.addComponent(new ChickFlag());

// Orange chick animation setup
let chickOrangeAnimator = new Animator();
chickOrange.addComponent(chickOrangeAnimator);

const lookAroundOrangeChick = new AnimationState("lookAround");
lookAroundOrangeChick.speed = 0.9; // Adding variation to each chick's lookAround animation
lookAroundOrangeChick.looping = true;
lookAroundOrangeChick.play();
chickOrangeAnimator.addClip(lookAroundOrangeChick);

const grabEggOrangeChick = new AnimationState("grabEgg");
grabEggOrangeChick.looping = false;
grabEggOrangeChick.shouldReset = true;
chickOrangeAnimator.addClip(grabEggOrangeChick);
//#endregion

///--- Egg ---
//#region
// Magenta egg setup
let eggMagenta = new Entity();
eggMagenta.addComponent(new GLTFShape("models/eggMagenta.glb"));
let eggMagentaTransform = new Transform({
  position: new Vector3(16, 10, 16)
});
eggMagenta.addComponent(eggMagentaTransform);
// Initialising the magenta egg with an rowID of 1 with a base speed of 4
let eggMagentaData = eggMagenta.addComponent(new EggData(1, 4));

// Magenta egg animation setup
let eggMagentaAnimator = new Animator();
eggMagenta.addComponent(eggMagentaAnimator);

const eggMagentaExplodingAnimation = new AnimationState("exploding");
eggMagentaExplodingAnimation.looping = true; // Need to turn looping on to have animation reset...
eggMagentaExplodingAnimation.shouldReset = true;
eggMagentaAnimator.addClip(eggMagentaExplodingAnimation);

const eggMagentaPopOutAnimation = new AnimationState("eggPopOut");
eggMagentaPopOutAnimation.looping = false;
eggMagentaPopOutAnimation.shouldReset = true;
eggMagentaAnimator.addClip(eggMagentaPopOutAnimation);

// Clicking directly on the magenta egg
eggMagenta.addComponent(
  new OnClick(e => {
    if (gunData.ammoLeft != 0) {
      if (
        balloonMagentaBasket.hasComponent(PauseOnTarget) &&
        !eggMagentaData.destroyed
      ) {
        eggShotdown(balloonMagentaBasket, eggMagenta, scoreThirtyEvent);

        // Run score pop up
        scorePlusThirtyPopUpAnimation.reset();
        scorePlusThirtyPopUpAnimation.play();

        // Run exploding animation
        eggMagentaExplodingAnimation.reset();
        eggMagentaExplodingAnimation.play();
      }
    }
  })
);

// Cyan egg setup
let eggCyan = new Entity();
eggCyan.addComponent(new GLTFShape("models/eggCyan.glb"));
let eggCyanTransform = new Transform({
  position: new Vector3(16, 10, 16)
});
eggCyan.addComponent(eggCyanTransform);

// Initialising the cyan egg with an rowID of 2 with a base speed of 5
let eggCyanData = eggCyan.addComponent(new EggData(2, 5));

// Cyan egg animation setup
let eggCyanAnimator = new Animator();
eggCyan.addComponent(eggCyanAnimator);

const eggCyanExplodingAnimation = new AnimationState("exploding");
eggCyanExplodingAnimation.looping = true; // Need to turn looping on to have animation reset...
eggCyanExplodingAnimation.shouldReset = true;
eggCyanAnimator.addClip(eggCyanExplodingAnimation);

const eggCyanPopOutAnimation = new AnimationState("eggPopOut");
eggCyanPopOutAnimation.looping = false;
eggCyanPopOutAnimation.shouldReset = true;
eggCyanAnimator.addClip(eggCyanPopOutAnimation);

// Clicking directly on the cyan egg
eggCyan.addComponent(
  new OnClick(e => {
    if (gunData.ammoLeft != 0) {
      if (
        balloonCyanBasket.hasComponent(PauseOnTarget) &&
        !eggCyanData.destroyed
      ) {
        eggShotdown(balloonCyanBasket, eggCyan, scoreFiftyEvent);

        // Run score pop up
        scorePlusFiftyPopUpAnimation.reset();
        scorePlusFiftyPopUpAnimation.play();

        // Run exploding animation
        eggCyanExplodingAnimation.reset();
        eggCyanExplodingAnimation.play();
      }
    }
  })
);

// Orange egg setup
let eggOrange = new Entity();
eggOrange.addComponent(new GLTFShape("models/eggOrange.glb"));
let eggOrangeTransform = new Transform({
  position: new Vector3(16, 10, 16)
});
eggOrange.addComponent(eggOrangeTransform);

// Initialising the orange egg with an rowID of 3 with a base speed of 2
let eggOrangeData = eggOrange.addComponent(new EggData(3, 2));

// Orange egg animation setup
let eggOrangeAnimator = new Animator();
eggOrange.addComponent(eggOrangeAnimator);

const eggOrangeExplodingAnimation = new AnimationState("exploding");
eggOrangeExplodingAnimation.looping = true; // Need to turn looping on to have animation reset...
eggOrangeExplodingAnimation.shouldReset = true;
eggOrangeAnimator.addClip(eggOrangeExplodingAnimation);

const eggOrangePopOutAnimation = new AnimationState("eggPopOut");
eggOrangePopOutAnimation.looping = false;
eggOrangePopOutAnimation.shouldReset = true;
eggOrangeAnimator.addClip(eggOrangePopOutAnimation);

// Clicking directly on the orange egg
eggOrange.addComponent(
  new OnClick(e => {
    if (gunData.ammoLeft != 0) {
      if (
        balloonOrangeBasket.hasComponent(PauseOnTarget) &&
        !eggOrangeData.destroyed
      ) {
        eggShotdown(balloonOrangeBasket, eggOrange, scoreTenEvent);

        // Run score pop up
        scorePlusTenPopUpAnimation.reset();
        scorePlusTenPopUpAnimation.play();

        // Run exploding animation
        eggOrangeExplodingAnimation.reset();
        eggOrangeExplodingAnimation.play();
      }
    }
  })
);

// When the egg is shot
function eggShotdown(balloon: Entity, egg: Entity, score: ScoreUpdateEvent) {
  egg.getComponent(EggData).destroyed = true;
  scoreEvents.fireEvent(score); // Update score
  egg.addComponentOrReplace(new EggExplosionTimeOut(EXPLOSION_TIME_OUT_SYNC));
  balloon.getComponent(PauseOnTarget).timeLeft = EXPLOSION_TIME_OUT_SYNC;
}
//#endregion

/// --- Scores ---
//#region
// Score plus thirty setup
let scorePlusThirty = new Entity();
scorePlusThirty.addComponent(new GLTFShape("models/scorePlusThirty.gltf"));
scorePlusThirty.addComponent(
  new Transform({ position: new Vector3(0, 0.25, 0) })
);
scorePlusThirty.addComponent(new Billboard());
scorePlusThirty.addComponent(new ScorePopUpFlag());
scorePlusThirty.setParent(eggMagenta);

// Score plus thirty animation setup
let scorePlusThirtyAnimator = new Animator();
scorePlusThirty.addComponent(scorePlusThirtyAnimator);

const scorePlusThirtyPopUpAnimation = new AnimationState("popUp");
scorePlusThirtyPopUpAnimation.looping = false;
scorePlusThirtyPopUpAnimation.shouldReset = true;
scorePlusThirtyAnimator.addClip(scorePlusThirtyPopUpAnimation);

// Score plus fifty setup
let scorePlusFifty = new Entity();
scorePlusFifty.addComponent(new GLTFShape("models/scorePlusFifty.gltf"));
scorePlusFifty.addComponent(
  new Transform({ position: new Vector3(0, 0.25, 0) })
);
scorePlusFifty.addComponent(new Billboard());
scorePlusFifty.addComponent(new ScorePopUpFlag());
scorePlusFifty.setParent(eggCyan);

// Score plus fifty animation setup
let scorePlusFiftyAnimator = new Animator();
scorePlusFifty.addComponent(scorePlusFiftyAnimator);
const scorePlusFiftyPopUpAnimation = new AnimationState("popUp");
scorePlusFiftyPopUpAnimation.looping = false;
scorePlusFiftyPopUpAnimation.shouldReset = true;
scorePlusFiftyAnimator.addClip(scorePlusFiftyPopUpAnimation);

// Score plus ten setup
let scorePlusTen = new Entity();
scorePlusTen.addComponent(new GLTFShape("models/scorePlusTen.gltf"));
scorePlusTen.addComponent(new Transform({ position: new Vector3(0, 0.25, 0) }));
scorePlusTen.addComponent(new Billboard());
scorePlusTen.addComponent(new ScorePopUpFlag());
scorePlusTen.setParent(eggOrange);

// Score plus ten animation setup
let scorePlusTenAnimator = new Animator();
scorePlusTen.addComponent(scorePlusTenAnimator);
const scorePlusTenPopUpAnimation = new AnimationState("popUp");
scorePlusTenPopUpAnimation.looping = false;
scorePlusTenPopUpAnimation.shouldReset = true;
scorePlusTenAnimator.addClip(scorePlusTenPopUpAnimation);
//#endregion

/// --- Engine ---
//#region
// Model entities
engine.addEntity(gameManager);
engine.addEntity(farm);
engine.addEntity(blade);
engine.addEntity(gun);
engine.addEntity(ammoPack);
engine.addEntity(balloonMagentaBasket);
engine.addEntity(balloonCyanBasket);
engine.addEntity(balloonOrangeBasket);
engine.addEntity(eggMagenta);
engine.addEntity(eggCyan);
engine.addEntity(eggOrange);

// Audio entities
engine.addEntity(shootSound);
engine.addEntity(ammoPickupSound);
engine.addEntity(clipEmptySound);
engine.addEntity(gunPickupSound);
engine.addEntity(eggExplosionSound);
engine.addEntity(airRaidSound);
engine.addEntity(gameOverSound);
engine.addEntity(sweetcornSound);
engine.addEntity(eggPopOutMagentaSound);
engine.addEntity(eggPopOutCyanSound);
engine.addEntity(eggPopOutOrangeSound);
engine.addEntity(eggFallingMagentaSound);
engine.addEntity(eggFallingCyanSound);
engine.addEntity(eggFallingOrangeSound);
engine.addEntity(musicSound);

// Systems
engine.addSystem(new ShootSystem());
engine.addSystem(new RegrowSystem());
engine.addSystem(new ParticleSystem());
engine.addSystem(new TranslateVerticalSystem());
engine.addSystem(new TranslateHorizontalSystem());
engine.addSystem(new WindmillBladeRotateSystem(blade));
engine.addSystem(new CountdownSystem(gameManager));
engine.addSystem(new GameOverSystem(gameManager));
engine.addSystem(new PickupSystem(ammoPack, gun));
//#endregion

/// --- Particle Generation (Modified from MANA-Burning-Altar scene) ---
/// link: https://github.com/decentraland-scenes/MANA-Burning-Altar
/// NOTE: parent entities need to be added first before running anything below
//#region
const particles: Entity[] = [];
const offset = new Vector3(0, 5, 0);
const MAX_PARTICLES = 30;

// // Magenta balloon flames
for (let i = 0; i < MAX_PARTICLES; i++) {
  const particle = new Entity();
  particle.setParent(balloonMagentaBasket);
  particle.addComponent(particleShape);
  particle.addComponent(new Particle(offset));
  particle.addComponent(new Transform({ position: offset }));
  // engine.addEntity(particle); // Already added because of parent
  particles.push(particle);
}

// // Cyan balloon flames
for (let i = 0; i < MAX_PARTICLES; i++) {
  const particle = new Entity();
  particle.setParent(balloonCyanBasket);
  particle.addComponent(particleShape);
  particle.addComponent(new Particle(offset));
  particle.addComponent(new Transform({ position: offset }));
  particles.push(particle);
}

// // Orange balloon flames
for (let i = 0; i < MAX_PARTICLES; i++) {
  const particle = new Entity();
  particle.setParent(balloonOrangeBasket);
  particle.addComponent(particleShape);
  particle.addComponent(new Particle(offset));
  particle.addComponent(new Transform({ position: offset }));
  particles.push(particle);
}
//#endregion

// Initialise sweetcorn patches and explosions
loadPatches();
initialiseExplosions();
