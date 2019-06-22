import {
  balloonGroup,
  PauseOnTarget,
  BalloonData,
  TargetData
} from "./balloon";
import { triggerExplosionAt } from "./explosion";
import {
  eggFallingMagentaSound,
  eggFallingMagentaSource,
  eggFallingCyanSound,
  eggFallingCyanSource,
  eggFallingOrangeSound,
  eggFallingOrangeSource
} from "./audio";

/// --- Egg ---
@Component("eggData")
export class EggData {
  destroyed: boolean = false; // Needed to prevent destroying an egg twice e.g. when it has already landed on its target
  speed: number;
  speedReset: number;
  rowID: number; // Identifies the row the egg is in, starting from the front
  constructor(id: number, baseSpeed: number) {
    this.rowID = id;
    this.speed = this.speedReset = baseSpeed;
  }
}

export const eggGroup = engine.getComponentGroup(EggData);

export const EXPLOSION_TIME_OUT_SYNC = 0.4;

// NOTE: there's an issue with parenting and unparenting objects and this is my workaround
export class TrackBalloonPositionSystem {
  update(dt: number) {
    for (let balloon of balloonGroup.entities) {
      for (let egg of eggGroup.entities) {
        let balloonTransform = balloon.getComponent(Transform);
        let eggTransform = egg.getComponent(Transform);
        let balloonData = balloon.getComponent(BalloonData);
        let eggData = egg.getComponent(EggData);
        let eggExplodingAnimation = egg
          .getComponent(Animator)
          .getClip("exploding");
        let eggPopOutAnimation = egg
          .getComponent(Animator)
          .getClip("eggPopOut");
        // Track the balloon's position if it has yet to lock on target
        if (balloonData.rowID == eggData.rowID) {
          if (!balloon.hasComponent(PauseOnTarget)) {
            egg.getComponent(Transform).scale.setAll(0.01); // Scaled down to hide egg
            trackBalloonPosition(eggTransform, balloonTransform);
          } else {
            if (egg.hasComponent(ReadyEggTimeOut)) {
              egg.getComponent(Transform).scale.setAll(1); // Scaled up to show egg
              trackBalloonPosition(eggTransform, balloonTransform);
            } else {
              eggPopOutAnimation.stop(); // To prevent blending of animations

              // Make egg fall based on its speed
              if (!egg.hasComponent(EggExplosionTimeOut)) {
                let increment = Vector3.Down().scale(dt * eggData.speed);
                eggTransform.translate(increment);
                playEggFallingAudio(egg);
              }

              // Egg hitting the vegetable patch
              if (
                eggTransform.position.y < 1 &&
                !egg.hasComponent(EggExplosionTimeOut)
              ) {
                eggData.destroyed = true;
                eggExplodingAnimation.reset();
                eggExplodingAnimation.play();
                egg.addComponentOrReplace(
                  new EggExplosionTimeOut(EXPLOSION_TIME_OUT_SYNC)
                );
                balloon.getComponent(
                  PauseOnTarget
                ).timeLeft = EXPLOSION_TIME_OUT_SYNC;

                // Calculate where to trigger the egg frying explosion effect
                let explosionPosition = calculateExplosionPosition(
                  balloonData.rowID,
                  balloon.getComponent(TargetData).origin
                );
                triggerExplosionAt(explosionPosition);
                log("KABOOM");
              }
            }
          }
        }
      }
    }
  }
}

// Play egg falling audio for the corresponding egg and its position
function playEggFallingAudio(egg: IEntity) {
  let eggTransform = egg.getComponent(Transform);
  let eggRowID = egg.getComponent(EggData).rowID;
  switch (eggRowID) {
    case 1: {
      if (!eggFallingMagentaSource.playing) {
        eggFallingMagentaSound.getComponent(Transform).position =
          eggTransform.position;
        eggFallingMagentaSource.playOnce();
      }
      break;
    }
    case 2: {
      if (!eggFallingCyanSource.playing) {
        eggFallingCyanSound.getComponent(Transform).position =
          eggTransform.position;
        eggFallingCyanSource.playOnce();
      }
      break;
    }
    case 3: {
      if (!eggFallingOrangeSource.playing) {
        eggFallingOrangeSound.getComponent(Transform).position =
          eggTransform.position;
        eggFallingOrangeSource.playOnce();
      }
      break;
    }
  }
}

// Reset egg pop falling audio for the corresponding egg
function stopEggFallingAudio(rowID: number) {
  switch (rowID) {
    case 1: {
      eggFallingMagentaSource.playing = false;
      break;
    }
    case 2: {
      eggFallingCyanSource.playing = false;
      break;
    }
    case 3: {
      eggFallingOrangeSource.playing = false;
      break;
    }
  }
}

// Returns the explosion position based on its rowID and the balloon's current target position
function calculateExplosionPosition(rowID: number, targetOrigin: number) {
  let target: number = 0;

  switch (rowID) {
    case 1: {
      target = 0 + targetOrigin;
      break;
    }
    case 2: {
      target = 3 + targetOrigin;
      break;
    }
    case 3: {
      target = 5 + targetOrigin;
      break;
    }
  }
  return target;
}

// Offsets the egg's position
const EGG_OFFSET_Y = 2.35;
const EGG_OFFSET_Z = 1.65;

// Have the egg track the position of the balloon
function trackBalloonPosition(
  eggTransform: Transform,
  balloonTransform: Transform
) {
  eggTransform.position.x = balloonTransform.position.x;
  eggTransform.position.y = balloonTransform.position.y + EGG_OFFSET_Y;
  eggTransform.position.z = balloonTransform.position.z - EGG_OFFSET_Z;
}

@Component("ReadyEggTimeOut")
export class ReadyEggTimeOut {
  timeLeft: number;
  constructor(time: number) {
    this.timeLeft = time;
  }
}
export const readyEggTimeOutGroup = engine.getComponentGroup(ReadyEggTimeOut);

// To sync up with the chick's grab egg animation
export class ReadyEggTimeOutSystem {
  update(dt: number) {
    for (let egg of readyEggTimeOutGroup.entities) {
      let eggReadyTimeOut = egg.getComponentOrNull(ReadyEggTimeOut);
      if (eggReadyTimeOut) {
        if (eggReadyTimeOut.timeLeft > 0) {
          eggReadyTimeOut.timeLeft -= dt;
        } else {
          egg.removeComponent(ReadyEggTimeOut);
        }
      }
    }
  }
}

@Component("eggExplosionTimeOut")
export class EggExplosionTimeOut {
  timeLeft: number;
  constructor(time: number) {
    this.timeLeft = time;
  }
}

export const explosionTimeOutGroup = engine.getComponentGroup(
  EggExplosionTimeOut
);

// To sync up with the egg's explosion animation
export class EggExplosionTimeOutSystem {
  update(dt: number) {
    for (let egg of explosionTimeOutGroup.entities) {
      let eggExplosionTimeOut = egg.getComponentOrNull(EggExplosionTimeOut);
      let eggData = egg.getComponent(EggData);
      let eggExplodingAnimation = egg
        .getComponent(Animator)
        .getClip("exploding");
      if (eggExplosionTimeOut) {
        if (eggExplosionTimeOut.timeLeft > 0) {
          eggExplosionTimeOut.timeLeft -= dt;
        } else {
          // Reset egg
          eggData.destroyed = false;
          egg.removeComponent(EggExplosionTimeOut);
          egg.getComponent(Transform).scale.setAll(0.001);
          eggExplodingAnimation.stop();
          eggExplodingAnimation.reset();
          stopEggFallingAudio(eggData.rowID);
          eggFallingMagentaSource.playing = false;
        }
      }
    }
  }
}

// Make sure all eggs are destroyed during game over sequence
export function destroyAllEggs() {
  for (let egg of eggGroup.entities) {
    egg.getComponent(EggData).destroyed = false;
    egg.addComponentOrReplace(new EggExplosionTimeOut(EXPLOSION_TIME_OUT_SYNC));
  }
}

// Increase egg's speed after difficulty level increases
export function increaseEggsSpeed() {
  for (let egg of eggGroup.entities) {
    let eggData = egg.getComponent(EggData);
    eggData.speed = eggData.speed * 1.1; // Increase speed of each egg by 10 percent
    log("Egg Speed: ", eggData.speed);
  }
}

// Reset egg's position and speed
export function resetEggs() {
  for (let egg of eggGroup.entities) {
    let eggTransform = egg.getComponent(Transform);
    let eggData = egg.getComponent(EggData);
    eggTransform.position = new Vector3(0, 3, -2); // Set egg's position relative to its parent
    eggData.speed = eggData.speedReset;
  }
}

// Hide the egg in between games
export function hideEggs() {
  for (let egg of eggGroup.entities) {
    let eggTransform = egg.getComponent(Transform);
    eggTransform.position = new Vector3(16, 10, 16); // Set eggs to a hidden position
  }
}
