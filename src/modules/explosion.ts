import { gameOverSequence } from "./manager";
import { sweetcornPatches } from "./sweetcorn";
import {
  eggExplosionSound,
  eggExplosionSource,
  gameOverSource,
  gameOverSound
} from "./audio";

// Player data
const camera = Camera.instance;

/// --- Egg Frying Explosion ---
let explosionShape = new GLTFShape("models/fryingExplosion.glb");

// Explosion array
const explosions: Entity[] = [];

// Explosion Points
const explosionPointA = new Vector3(5.5, 1.5, 26.5);
const explosionPointB = new Vector3(16, 1.5, 26.5);
const explosionPointC = new Vector3(26.5, 1.5, 26.5);
const explosionPointD = new Vector3(5.5, 1.5, 16);
const explosionPointE = new Vector3(26.5, 1.5, 16);
const explosionPointF = new Vector3(5.5, 1.5, 5.5);
const explosionPointG = new Vector3(16, 1.5, 5.5);
const explosionPointH = new Vector3(26.5, 1.5, 5.5);
const explosionPoints: Vector3[] = [
  explosionPointA,
  explosionPointB,
  explosionPointC,
  explosionPointD,
  explosionPointE,
  explosionPointF,
  explosionPointG,
  explosionPointH
];

// Initialise explosion effects at each patch
export function initialiseExplosions() {
  for (let i = 0; i < explosionPoints.length; i++) {
    const explosion = new Entity();
    explosion.addComponent(explosionShape);
    explosion.addComponent(
      new Transform({
        position: explosionPoints[i],
        scale: new Vector3(0.0001, 0.0001, 0.0001),
        rotation: Quaternion.Euler(0, Math.random() * 360, 0) // Give each explosion a random rotation
      })
    );
    let animator = new Animator();
    explosion.addComponent(animator);
    const clipExplosion = new AnimationState("fryingExplosion");
    animator.addClip(clipExplosion);
    clipExplosion.looping = false;
    clipExplosion.shouldReset = true;
    engine.addEntity(explosion);
    explosions.push(explosion);
  }
}

// Explosion on every patch to signal game over
function fullExplosionSequence() {
  for (let i = 0; i < explosions.length; i++) {
    let transform = explosions[i].getComponent(Transform);
    transform.scale.setAll(0.25);
    if (!explosions[i].hasComponent(FryingExplosionTimeOut)) {
      explosions[i].addComponentOrReplace(new FryingExplosionTimeOut(1.15));
    }
    let clip = explosions[i].getComponent(Animator).getClip("fryingExplosion");
    clip.play();
  }
  // Play sounds at player's position
  eggExplosionSound.getComponent(Transform).position = camera.position;
  eggExplosionSource.playOnce();
  if (!gameOverSource.playing) {
    gameOverSound.getComponent(Transform).position = camera.position;
    gameOverSource.playOnce();
  }

  gameOverSequence();
}

/// --- Egg Frying Explosion ---
// Trigger the frying egg explosion effect at specified patch i.e. where the egg lands
export function triggerExplosionAt(patch: number) {
  let fryingExplosionAnimation = explosions[patch]
    .getComponent(Animator)
    .getClip("fryingExplosion");
  let transform = explosions[patch].getComponent(Transform);
  transform.scale.setAll(0.25);

  if (fryingExplosionAnimation.playing == true) {
    fryingExplosionAnimation.stop();
  }
  let sweetcorn = sweetcornPatches[patch].pop();
  sweetcorn.getComponent(Transform).scale.setAll(0.01);
  sweetcornPatches[patch].unshift(sweetcorn);
  sweetcornsRemaining(sweetcornPatches[patch]);

  explosions[patch].addComponentOrReplace(new FryingExplosionTimeOut(1.15));
  fryingExplosionAnimation.play();

  eggExplosionSound.getComponent(Transform).position = sweetcorn.getComponent(
    Transform
  ).position; // Play explosion sound where the sweetcorn is
  eggExplosionSource.playOnce();
}

// Check the number of sweetcorns remaining
function sweetcornsRemaining(sweetcornPatches: Entity[]) {
  let numberOfSweetcorns = 3;
  for (let sweetcorn of sweetcornPatches) {
    if (sweetcorn.getComponent(Transform).scale.x == 0.01) {
      numberOfSweetcorns--;
    }
  }

  // Trigger the full explosion sequence
  if (numberOfSweetcorns == 0) {
    fullExplosionSequence();
  }
}

@Component("fryingExplosiontimeOut")
export class FryingExplosionTimeOut {
  timeLeft: number;
  constructor(time: number) {
    this.timeLeft = time;
  }
}

export const fryingExplosionTimeOutGroup = engine.getComponentGroup(
  FryingExplosionTimeOut
);

// To sync up with the egg frying explosion animation
export class FryingExplosionTimeOutSystem {
  update(dt: number) {
    for (let explosions of fryingExplosionTimeOutGroup.entities) {
      let fryingExplosionTimeOut = explosions.getComponentOrNull(
        FryingExplosionTimeOut
      );
      let fryingExplosionAnimation = explosions
        .getComponent(Animator)
        .getClip("fryingExplosion");
      if (fryingExplosionTimeOut) {
        if (fryingExplosionTimeOut.timeLeft > 0) {
          fryingExplosionTimeOut.timeLeft -= dt;
        } else {
          explosions.removeComponent(FryingExplosionTimeOut);
          fryingExplosionAnimation.stop();
          explosions.getComponent(Transform).scale.setAll(0.001); // Scaled back down to hide
        }
      }
    }
  }
}
