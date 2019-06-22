/// --- Fire Particle System (Modified from MANA-Burning-Altar scene) ---
/// link: https://github.com/decentraland-scenes/MANA-Burning-Altar
@Component("particle")
export class Particle {
  life = Math.random();
  seed = Math.random() - Math.random();
  constructor(public origin: Vector3) {}
}

let fireHeight = 0;

// NOTE: only modified a few values so that the particles appear to be emitting from the burners
export class ParticleSystem {
  group = engine.getComponentGroup(Particle);
  update(dt: number) {
    if (true) {
      fireHeight = fireHeight + (2 - fireHeight) / 10;
      particleShape.visible = true;
      for (const entity of this.group.entities) {
        const particle = entity.getComponent(Particle);
        const transform = entity.getComponent(Transform);
        particle.life += dt;
        particle.life %= 1;
        transform.position = new Vector3(
          particle.origin.x +
            Math.sin((particle.life + particle.seed) * 5) *
              (1 - particle.life / 1.5) *
              0.2,
          particle.origin.y + particle.life * fireHeight,
          particle.origin.z +
            Math.cos((particle.life + particle.seed) * 5) *
              (1 - particle.life / 1.5) *
              0.2
        );
        const scale = 0.2 - particle.life / 5;
        transform.scale = new Vector3(scale, scale, scale);
        const rotation = particle.life * 360 + particle.seed * 360;
        transform.rotation = Quaternion.Euler(rotation, rotation, rotation);
      }
    }
  }
}

export const particleShape = new GLTFShape("models/fireParticle.glb");
