import { increaseEggsSpeed } from "./egg";
import { increaseWindmillBladeSpeed } from "./windmill";

/// NOTE: issues with loading modules when this was within the manager.ts
/// NOTE: the game gets more difficult once a certain score threshold is exceeded
/// --- Score System ---
let totalScore = 0;
let targetScore = 250; // Score threshold before difficulty level increases

// Initiate event manager
export const scoreEvents = new EventManager();

// Define an event type
@EventConstructor()
export class ScoreUpdateEvent {
  constructor(public score: number) {}
}

// Add a listener for score updates
scoreEvents.addListener(ScoreUpdateEvent, null, ({ score }) => {
  totalScore += score;
  log("Total Score: " + totalScore);

  // Increase difficulty level once target has been reached
  if (totalScore >= targetScore) {
    log("LEVEL UP!");
    increaseEggsSpeed();
    increaseWindmillBladeSpeed();
    targetScore = targetScore * 2; // Double the score threshold after each level increase
    log("New Target Score: " + targetScore);
  }
});

// Score pop up
@Component("scorePopUpFlag")
export class ScorePopUpFlag {}
export const scorePopUpFlagGroup = engine.getComponentGroup(ScorePopUpFlag);

// Reset scores and score threshold level back to their original values
export function resetScore() {
  totalScore = 0;
  targetScore = 250;
}
