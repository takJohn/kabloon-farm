import { gameManager } from "manager"; // BUG: Need to import random file before the other modules can be imported...
import { sweetcornSource } from "./audio";

/// --- Sweetcorns ---
const sweetcornShape = new GLTFShape("models/sweetcorn.glb");

// Sweetcorn patches
// NOTE: The patches are labeled starting from the back and from left to right
//#region
const sweetcornPatchA: Entity[] = [];
const sweetcornPatchB: Entity[] = [];
const sweetcornPatchC: Entity[] = [];
const sweetcornPatchD: Entity[] = [];
const sweetcornPatchE: Entity[] = [];
const sweetcornPatchF: Entity[] = [];
const sweetcornPatchG: Entity[] = [];
const sweetcornPatchH: Entity[] = [];
export const sweetcornPatches: Entity[][] = [
  sweetcornPatchA,
  sweetcornPatchB,
  sweetcornPatchC,
  sweetcornPatchD,
  sweetcornPatchE,
  sweetcornPatchF,
  sweetcornPatchG,
  sweetcornPatchH
];

// Patch A points
const sweetcornPoint1A = new Vector3(4.72, 0.346, 27.456);
const sweetcornPoint2A = new Vector3(6.686, 0.348, 26.489);
const sweetcornPoint3A = new Vector3(4.658, 0.328, 25.528);
const sweetcornPointsA: Vector3[] = [
  sweetcornPoint1A,
  sweetcornPoint2A,
  sweetcornPoint3A
];

// Patch B points
const sweetcornPoint1B = new Vector3(14.874, 0.346, 27.555);
const sweetcornPoint2B = new Vector3(17.088, 0.348, 27.409);
const sweetcornPoint3B = new Vector3(15.712, 0.328, 25.528);
const sweetcornPointsB: Vector3[] = [
  sweetcornPoint1B,
  sweetcornPoint2B,
  sweetcornPoint3B
];

// Patch C points
const sweetcornPoint1C = new Vector3(25.691, 0.346, 27.565);
const sweetcornPoint2C = new Vector3(27.43, 0.348, 26.787);
const sweetcornPoint3C = new Vector3(25.559, 0.328, 25.559);
const sweetcornPointsC: Vector3[] = [
  sweetcornPoint1C,
  sweetcornPoint2C,
  sweetcornPoint3C
];

// Patch D points
const sweetcornPoint1D = new Vector3(4.72, 0.346, 17.05);
const sweetcornPoint2D = new Vector3(4.658, 0.328, 14.88);
const sweetcornPoint3D = new Vector3(6.686, 0.348, 16);
const sweetcornPointsD: Vector3[] = [
  sweetcornPoint1D,
  sweetcornPoint2D,
  sweetcornPoint3D
];

// Patch E points
const sweetcornPoint1E = new Vector3(27.367, 0.346, 17.056);
const sweetcornPoint2E = new Vector3(25.557, 0.348, 16.194);
const sweetcornPoint3E = new Vector3(27.402, 0.328, 15.019);
const sweetcornPointsE: Vector3[] = [
  sweetcornPoint1E,
  sweetcornPoint2E,
  sweetcornPoint3E
];

// Patch F points
const sweetcornPoint1F = new Vector3(6.328, 0.346, 4.404);
const sweetcornPoint2F = new Vector3(6.315, 0.328, 6.637);
const sweetcornPoint3F = new Vector3(4.465, 0.348, 5.598);
const sweetcornPointsF: Vector3[] = [
  sweetcornPoint1F,
  sweetcornPoint2F,
  sweetcornPoint3F
];

// Patch G points
const sweetcornPoint1G = new Vector3(15.877, 0.328, 6.716);
const sweetcornPoint2G = new Vector3(17.024, 0.346, 5.182);
const sweetcornPoint3G = new Vector3(15.105, 0.343, 4.734);
const sweetcornPointsG: Vector3[] = [
  sweetcornPoint1G,
  sweetcornPoint2G,
  sweetcornPoint3G
];

// Patch H points
const sweetcornPoint1H = new Vector3(27.666, 0.346, 5.932);
const sweetcornPoint2H = new Vector3(25.557, 0.348, 6.365);
const sweetcornPoint3H = new Vector3(26.107, 0.328, 4.383);
const sweetcornPointsH: Vector3[] = [
  sweetcornPoint1H,
  sweetcornPoint2H,
  sweetcornPoint3H
];

const sweetcornPoints: Vector3[][] = [
  sweetcornPointsA,
  sweetcornPointsB,
  sweetcornPointsC,
  sweetcornPointsD,
  sweetcornPointsE,
  sweetcornPointsF,
  sweetcornPointsG,
  sweetcornPointsH
];
//#endregion

// Initialise sweetcorn patches
export function loadPatches() {
  for (let i = 0; i < sweetcornPatches.length; i++) {
    for (let j = 0; j < sweetcornPoints[i].length; j++) {
      const sweetcorn = new Entity();
      sweetcorn.addComponent(sweetcornShape);
      sweetcorn.addComponent(
        new Transform({
          position: sweetcornPoints[i][j],
          rotation: Quaternion.Euler(0, Math.random() * 360, 0) // Give each sweetcorn a random rotation
        })
      );
      engine.addEntity(sweetcorn);
      sweetcornPatches[i].push(sweetcorn);
    }
  }
}

@Component("regrowFlag")
export class RegrowFlag {}

export const regrowGroup = engine.getComponentGroup(RegrowFlag);

// System for regrowing the sweetcorn patches
export class RegrowSystem {
  update(dt: number) {
    for (let sweetcorn of regrowGroup.entities) {
      if (!sweetcornSource.playing) {
        sweetcornSource.playOnce();
      }
      let sweetcornTransform = sweetcorn.getComponent(Transform);
      sweetcornTransform.rotate(Vector3.Down(), dt * 60); // Slowly rotate the sweetcorns as they grow

      // Scale the sweetcorns back to their original size
      if (sweetcornTransform.scale.x < 1) {
        let regrowSpeed = dt / 2;
        sweetcornTransform.scale.x += regrowSpeed;
        sweetcornTransform.scale.y += regrowSpeed;
        sweetcornTransform.scale.z += regrowSpeed;
      } else {
        sweetcorn.removeComponent(RegrowFlag);
        sweetcornSource.playing = false;
      }
    }
  }
}

// Reset the patches by regrowing the sweetcorns
export function resetSweetcornPatches() {
  for (let i = 0; i < sweetcornPatches.length; i++) {
    for (let j = 0; j < sweetcornPoints[i].length; j++) {
      let sweetcorn = sweetcornPatches[i][j];
      sweetcorn.addComponent(new RegrowFlag());
      log("Regrowing the sweetcorns...");
    }
  }
}

// Ran after the game over sequence and before a new game starts
export function destroySweetcornPatches() {
  for (let i = 0; i < sweetcornPatches.length; i++) {
    for (let j = 0; j < sweetcornPoints[i].length; j++) {
      sweetcornPatches[i][j].getComponent(Transform).scale.setAll(0.01);
    }
  }
}
