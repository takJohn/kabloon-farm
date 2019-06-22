/// --- Windmill ---
/// NOTE: the blade spins faster as the difficulty of the game increases

// BladeRotate flag
@Component("windmillBladeData")
export class WindmillBladeData {
  speed: number = 10;
  speedReset: number = 10;
}

export let WindmillBladeRotateGroup = engine.getComponentGroup(
  WindmillBladeData
);

// Rotates the blade of the windmill
export class WindmillBladeRotateSystem {
  blade: Entity;
  constructor(bladeEntity) {
    this.blade = bladeEntity;
  }

  update(dt: number) {
    const bladeTransform = this.blade.getComponent(Transform);
    const bladeSpeed = this.blade.getComponent(WindmillBladeData).speed;
    bladeTransform.rotate(Vector3.Forward(), dt * -bladeSpeed);
  }
}

// Increases the blade's speed after difficulty level increases
export function increaseWindmillBladeSpeed() {
  for (let blade of WindmillBladeRotateGroup.entities) {
    let bladeSpeed = blade.getComponent(WindmillBladeData).speed;
    bladeSpeed = bladeSpeed * 2; // Double the windmill speed
    log("Windmill Blade Speed: ", bladeSpeed);
  }
}

// Reset windmill blade's speed
export function resetWindmillBlade() {
  for (let blade of WindmillBladeRotateGroup.entities) {
    let bladeData = blade.getComponent(WindmillBladeData);
    bladeData.speed = bladeData.speedReset;
  }
}
