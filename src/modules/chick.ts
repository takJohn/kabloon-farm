import {
  eggPopOutMagentaSound,
  eggPopOutMagentaSource,
  eggPopOutCyanSound,
  eggPopOutCyanSource,
  eggPopOutOrangeSound,
  eggPopOutOrangeSource
} from "./audio";
import { PauseOnTarget, BalloonData } from "./balloon";
import { eggGroup, EggData } from "./egg";

/// --- Chick ---
// Component flag
@Component("chickFlag")
export class ChickFlag {}

export const chicksGroup = engine.getComponentGroup(ChickFlag);

// A different chick animation is played once a balloon is hovering above its target
export class EggDropSequenceSystem {
  update() {
    for (let chick of chicksGroup.entities) {
      for (let egg of eggGroup.entities) {
        let grabEggAnimation = chick.getComponent(Animator).getClip("grabEgg");
        let lookAroundAnimation = chick
          .getComponent(Animator)
          .getClip("lookAround");
        let eggPopOutAnimation = egg
          .getComponent(Animator)
          .getClip("eggPopOut");
        let eggRowID = egg.getComponent(EggData).rowID;
        let balloonRowID = chick.getParent().getComponent(BalloonData).rowID;

        // Checks if the balloon has paused over the target
        if (chick.getParent().hasComponent(PauseOnTarget)) {
          // Run the egg pop out animation for the paused balloon
          if (balloonRowID == eggRowID) {
            eggPopOutAnimation.play();
            playEggPopOutAudio(egg);
          }
          lookAroundAnimation.stop();
          grabEggAnimation.reset(); // Reset animation before playing
          grabEggAnimation.play();
        } else {
          // Stop the egg pop out animation for the paused balloon
          if (balloonRowID == eggRowID) {
            eggPopOutAnimation.stop();
            stopEggPopOutAudio(eggRowID);
          }
          grabEggAnimation.stop();
          lookAroundAnimation.reset(); // Reset animation before playing
          lookAroundAnimation.play();
        }
      }
    }
  }
}

// Play egg pop out audio for the corresponding egg and at its position
function playEggPopOutAudio(egg: IEntity) {
  let eggTransform = egg.getComponent(Transform);

  let eggRowID = egg.getComponent(EggData).rowID;
  switch (eggRowID) {
    case 1: {
      if (!eggPopOutMagentaSource.playing) {
        eggPopOutMagentaSound.getComponent(Transform).position =
          eggTransform.position;
        eggPopOutMagentaSource.playOnce();
      }
      break;
    }
    case 2: {
      if (!eggPopOutCyanSource.playing) {
        eggPopOutCyanSound.getComponent(Transform).position =
          eggTransform.position;
        eggPopOutCyanSource.playOnce();
      }
      break;
    }
    case 3: {
      if (!eggPopOutOrangeSource.playing) {
        eggPopOutOrangeSound.getComponent(Transform).position =
          eggTransform.position;
        eggPopOutOrangeSource.playOnce();
      }
      break;
    }
  }
}

// Reset egg pop out audio for the corresponding egg
function stopEggPopOutAudio(rowID: number) {
  switch (rowID) {
    case 1: {
      eggPopOutMagentaSource.playing = false;
      break;
    }
    case 2: {
      eggPopOutCyanSource.playing = false;
      break;
    }
    case 3: {
      eggPopOutOrangeSource.playing = false;
      break;
    }
  }
}

// Play the chick's celebration animation once the game is over
export function runChickCelebrationAnimation() {
  for (let chick of chicksGroup.entities) {
    let grabEggAnimation = chick.getComponent(Animator).getClip("grabEgg");
    let lookAroundAnimation = chick
      .getComponent(Animator)
      .getClip("lookAround");

    let celebrationAnimation = chick
      .getComponent(Animator)
      .getClip("celebration");
    grabEggAnimation.stop();
    lookAroundAnimation.stop();
    celebrationAnimation.reset(); // Reset animation before playing
    celebrationAnimation.play();
  }
}

// Reset chicks animations and return back to its lookAround animations
export function resetChicks() {
  for (let chick of chicksGroup.entities) {
    let grabEggAnimation = chick.getComponent(Animator).getClip("grabEgg");
    let lookAroundAnimation = chick
      .getComponent(Animator)
      .getClip("lookAround");
    let celebrationAnimation = chick
      .getComponent(Animator)
      .getClip("celebration");

    grabEggAnimation.stop();
    celebrationAnimation.stop();
    lookAroundAnimation.play();
  }
}
