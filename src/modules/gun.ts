import { gameManager, Countdown } from "./manager";

import {
  ammoPickupSource,
  shootSound,
  clipEmptySound,
  gunPickupSound,
  gunPickupSource,
  airRaidSource
} from "./audio";

// Player data
const camera = Camera.instance;

/// --- Ammo ---
@Component("ammoData")
export class AmmoData {
  cooldownReset: number;
  cooldownTimer: number;
  constructor(time: number) {
    this.cooldownTimer = this.cooldownReset = time;
  }
}

// System for picking up gun and ammo
export class PickupSystem {
  ammoPack: Entity;
  gun: Entity;
  constructor(ammoPackEntity, gunEntity) {
    this.ammoPack = ammoPackEntity;
    this.gun = gunEntity;
  }

  update(dt: number) {
    let ammoTransform = this.ammoPack.getComponent(Transform);
    let ammoCooldown = this.ammoPack.getComponent(AmmoData);
    let gunTransform = this.gun.getComponent(Transform);
    let gunData = this.gun.getComponent(GunData);

    // Let the player collect the ammo when they're within a 1.5m range of the ammo pack
    if (gunData.playerHasGun) {
      if (
        camera.position.x >= ammoTransform.position.x - 1.5 &&
        camera.position.x <= ammoTransform.position.x + 1.5 &&
        camera.position.z >= ammoTransform.position.z - 1.5 &&
        camera.position.z <= ammoTransform.position.z + 1.5
      ) {
        // Only allow the player to pick up the ammo when they're not fuly stocked
        if (gunData.ammoLeft == 6) {
          log("Ammo Full!!");
          return;
        }

        // Sets off the ammo respawn pattern
        if (ammoCooldown.cooldownTimer < 0) {
          log("Ammo Pickedup!!");
          ammoPickupSource.playOnce();
          ammoTransform.scale.setAll(0.01); // Scaled to down to hide
          ammoCooldown.cooldownTimer = ammoCooldown.cooldownReset;
          gunData.ammoLeft = 6;
        }
      }
    }
    // Respawn ammo pack
    if (ammoCooldown.cooldownTimer > 0) {
      ammoCooldown.cooldownTimer -= dt;
    } else {
      ammoTransform.scale.setAll(1.0); // Scaled up to show
    }

    // Let the player collect the ammo when they're within range of the gun
    // NOTE: the gun transform is actually at the centre of the room
    if (!gunData.playerHasGun) {
      if (
        camera.position.x >= gunTransform.position.x + 1.0 &&
        camera.position.x <= gunTransform.position.x + 3.75 &&
        camera.position.z >= gunTransform.position.z - 1.5 &&
        camera.position.z <= gunTransform.position.z + 1.5
      ) {
        log("Locked and Loaded!!");
        gunPickupSource.playOnce();
        this.gun.getComponent(GLTFShape).visible = false;
        gunData.cooldownTimer = 1.5; // 1.5s cooldown delay whilst arming the player
        gunData.playerHasGun = true;
        gunData.ammoLeft = 6; // Start with full ammo
        airRaidSource.playOnce();
        gameManager.addComponent(new Countdown());
      }
    }
  }
}

/// --- Gun ---
@Component("gunData")
export class GunData {
  playerHasGun: boolean = false;
  cooldownReset: number;
  cooldownTimer: number;
  ammoLeft: number = 6;
  constructor(time: number) {
    this.cooldownTimer = this.cooldownReset = time; // Sets the cooldown period between each gun fire
  }
}

// TODO: Guns. Lots of guns.
export const gunGroup = engine.getComponentGroup(GunData);

export class ShootSystem {
  update(dt: number) {
    for (let gun of gunGroup.entities) {
      let gunCooldown = gun.getComponent(GunData);
      let shootSoundTransform = shootSound.getComponent(Transform);
      let clipEmptySoundTransform = clipEmptySound.getComponent(Transform);
      let gunPickupSoundTransform = gunPickupSound.getComponent(Transform);

      // All gun sounds are played at the position the player is standing in
      shootSoundTransform.position = camera.position;
      clipEmptySoundTransform.position = camera.position;
      gunPickupSoundTransform.position = camera.position;

      // Sets off the gun fire cooldown
      if (gunCooldown.cooldownTimer > 0) {
        gunCooldown.cooldownTimer -= dt;
      }
    }
  }
}

// Reset the gun's visibility and remove gun from player
export function resetGun() {
  for (let gun of gunGroup.entities) {
    gun.getComponent(GLTFShape).visible = true;
    gun.getComponent(GunData).playerHasGun = false;
  }
}
