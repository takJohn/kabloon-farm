import { resetGun } from "./gun";
import { TargeAcquiredSequenceSystem } from "./balloon";
import {
  EggDropSequenceSystem,
  runChickCelebrationAnimation,
  resetChicks
} from "./chick";
import {
  ReadyEggTimeOutSystem,
  TrackBalloonPositionSystem,
  EggExplosionTimeOutSystem,
  destroyAllEggs,
  resetEggs,
  hideEggs
} from "egg";
import { destroySweetcornPatches, resetSweetcornPatches } from "sweetcorn";
import { FryingExplosionTimeOutSystem } from "explosion";
import { resetScore } from "score";
import { resetWindmillBlade } from "windmill";
import { gameOverSource } from "audio";

export let gameManager = new Entity();

/// --- Start and End Game ---
@Component("countdown")
export class Countdown {
  timeLeft: number = 4;
}

// Countdown before the game begins
export class CountdownSystem {
  manager: Entity;
  constructor(managerEntity) {
    this.manager = managerEntity;
  }
  update(dt: number) {
    let countdown = this.manager.getComponentOrNull(Countdown);
    if (countdown) {
      if (countdown.timeLeft > 0) {
        countdown.timeLeft -= dt;
      } else {
        log("Start Game");
        this.manager.removeComponent(Countdown);
        startGame();
      }
    }
  }
}

// Main game systems
// NOTE: the order that these system are ran is important
// and they are the only systems not added outside of game.ts
let targeAcquiredSequenceSystem;
let fryingExplosionTimeOutSystem;
let eggDropSequenceSystem;
let trackBalloonPositionSystem;
let readyEggTimeOutSystem;
let eggExplosionTimeOutSystem;

// Start the game
function startGame() {
  log("Game has started!!");

  // Reset game back to its start state
  resetScore();
  resetEggs();
  resetWindmillBlade();

  // Reset game over sound
  gameOverSource.playing = false;

  // Add running game systems
  targeAcquiredSequenceSystem = engine.addSystem(
    new TargeAcquiredSequenceSystem()
  );

  fryingExplosionTimeOutSystem = engine.addSystem(
    new FryingExplosionTimeOutSystem()
  );
  eggDropSequenceSystem = engine.addSystem(new EggDropSequenceSystem());
  trackBalloonPositionSystem = engine.addSystem(
    new TrackBalloonPositionSystem()
  );
  readyEggTimeOutSystem = engine.addSystem(new ReadyEggTimeOutSystem());
  eggExplosionTimeOutSystem = engine.addSystem(new EggExplosionTimeOutSystem());
}

@Component("gameOverTimeOut")
export class GameOverTimeOut {
  timeLeft: number = 4; // 4 secs before the game resets
}

// System for running the game over sequence
export class GameOverSystem {
  manager: Entity;
  constructor(managerEntity) {
    this.manager = managerEntity;
  }
  update(dt: number) {
    let gameOverTimeOut = this.manager.getComponentOrNull(GameOverTimeOut);
    if (gameOverTimeOut) {
      // Game over sequence
      runChickCelebrationAnimation();
      destroySweetcornPatches(); // Destroy all the sweetcorns to make it clear to the user that the game has finished
      // destroyAllEggs(); // Moved to explosions.ts to run only once

      // Remove systems to keep more eggs from falling
      engine.removeSystem(eggDropSequenceSystem);
      engine.removeSystem(readyEggTimeOutSystem);

      // Reinitialise the game after sequence finished playing
      if (gameOverTimeOut.timeLeft > 0) {
        gameOverTimeOut.timeLeft -= dt;
      } else {
        this.manager.removeComponent(GameOverTimeOut);
        endGame();
      }
    }
  }
}

// End the game
export function endGame() {
  log("Game has ended!!");

  // Reset game objects
  hideEggs();
  resetChicks();
  resetGun();
  resetSweetcornPatches();

  // Remove the rest of the game systems
  engine.removeSystem(trackBalloonPositionSystem);
  engine.removeSystem(targeAcquiredSequenceSystem);
  engine.removeSystem(fryingExplosionTimeOutSystem);
  engine.removeSystem(eggExplosionTimeOutSystem);
}

// Run game over sequence
export function gameOverSequence() {
  if (!gameManager.hasComponent(GameOverTimeOut)) {
    gameManager.addComponent(new GameOverTimeOut());
    destroyAllEggs(); // Destroy all the eggs so that they reset back to default state
  }
}
