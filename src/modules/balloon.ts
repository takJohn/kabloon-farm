import { ReadyEggTimeOut, eggGroup, EggData } from "./egg";

// Balloon target points
const balloonTargetA = new Vector3(5.5, 8, 28.25);
const balloonTargetB = new Vector3(16, 8, 28.25);
const balloonTargetC = new Vector3(26.5, 8, 28.25);
const balloonPointD = new Vector3(5.5, 8, 17.75);
const balloonPointE = new Vector3(26.5, 8, 17.75);
const balloonPointF = new Vector3(5.5, 8, 7.25);
const balloonPointG = new Vector3(16, 8, 7.25);
const balloonPointH = new Vector3(26.5, 8, 7.25);

// Magenta balloon targets
export const balloonMagentaTargets: Vector3[] = [
  balloonTargetA,
  balloonTargetB,
  balloonTargetC
];

// Cyan balloon targets
export const balloonCyanTargets: Vector3[] = [balloonPointD, balloonPointE];

// Orange balloon targets
export const balloonOrangeTargets: Vector3[] = [
  balloonPointF,
  balloonPointG,
  balloonPointH
];

/// --- Balloon Movement ---
@Component("balloonData")
export class BalloonData {
  speed: number = 1.5;
  minimumHeight: number = 8;
  horizontalDirection: Vector3 = Vector3.Left();
  verticalDirection: Vector3 = Vector3.Up();
  targetHeight: number = 8; // This is updated constantly via the TranslateVerticalSystem
  rowID: number; // Identifies the row the ballon is in, starting from the front
  constructor(id: number) {
    this.rowID = id;
  }
}

export const balloonGroup = engine.getComponentGroup(BalloonData);

const VERTICAL_RANGE = 5; // Max range the ballon is allowed to move up / down

// Vertical balloon movement
export class TranslateVerticalSystem {
  update(dt: number) {
    for (let entity of balloonGroup.entities) {
      let balloonData = entity.getComponent(BalloonData);
      let balloonTransform = entity.getComponent(Transform);

      // Changes the balloon's vertical direction depending if it's reached its max or min height
      if (balloonTransform.position.y < balloonData.minimumHeight) {
        balloonData.verticalDirection = Vector3.Up();
      } else if (
        balloonTransform.position.y >
        balloonData.minimumHeight + VERTICAL_RANGE
      ) {
        balloonData.verticalDirection = Vector3.Down();
      }

      let increment = balloonData.verticalDirection.scale(
        dt * balloonData.speed
      );
      balloonData.targetHeight = balloonTransform.translate(
        increment
      ).position.y;
    }
  }
}

// This component is added once the balloon has locked on and is hovering above target
@Component("pauseOnTarget")
export class PauseOnTarget {
  timeLeft: number;
  constructor(time: number) {
    this.timeLeft = time;
  }
}

export const pausedOnTargetGroup = engine.getComponentGroup(PauseOnTarget);

// Pauses over the target to sync with the chick's egg drop sequence
export class TargeAcquiredSequenceSystem {
  update(dt: number) {
    for (let balloon of pausedOnTargetGroup.entities) {
      let balloonPauseOnTarget = balloon.getComponent(PauseOnTarget);
      if (balloonPauseOnTarget) {
        if (balloonPauseOnTarget.timeLeft > 0) {
          balloonPauseOnTarget.timeLeft -= dt;
        } else {
          balloon.removeComponent(PauseOnTarget);
        }
      }
    }
  }
}

// Stores information for target points
@Component("targetData")
export class TargetData {
  targets: Vector3[];
  origin: number = 0;
  target: number = 1;
  fraction: number = 0;
}

// Horizontal balloon movement
export class TranslateHorizontalSystem {
  update(dt: number) {
    for (let balloon of balloonGroup.entities) {
      if (!balloon.hasComponent(PauseOnTarget)) {
        let balloonTransform = balloon.getComponent(Transform);
        let balloonData = balloon.getComponent(BalloonData);
        let balloonTargetData = balloon.getComponent(TargetData);
        balloonTargetData.fraction += (dt / 6) * balloonData.speed;

        // Lerp between targets
        if (balloonTargetData.fraction < 1) {
          balloonTransform.position = Vector3.Lerp(
            new Vector3(
              balloonTargetData.targets[balloonTargetData.origin].x,
              balloonData.targetHeight,
              balloonTargetData.targets[balloonTargetData.origin].z
            ),
            new Vector3(
              balloonTargetData.targets[balloonTargetData.target].x,
              balloonData.targetHeight,
              balloonTargetData.targets[balloonTargetData.target].z
            ),
            balloonTargetData.fraction
          );
        } else {
          // Update targeting information
          balloonTargetData.origin = balloonTargetData.target;
          balloonTargetData.fraction = 0;

          // Randomly select next target
          let maxRandomNumber = balloonTargetData.targets.length;
          balloonTargetData.target = Math.floor(
            Math.random() * maxRandomNumber
          );
          balloon.addComponent(new PauseOnTarget(20)); // Extra long time out so that it only resets on being destroyed

          // To sync up with the chick's grab egg animation
          for (let egg of eggGroup.entities) {
            if (egg.getComponent(EggData).rowID == balloonData.rowID) {
              egg.addComponent(new ReadyEggTimeOut(0.75));
            }
          }
        }
      }
    }
  }
}
