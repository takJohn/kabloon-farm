// Music
export const musicSound = new Entity();
musicSound.addComponent(new Transform({ position: new Vector3(16, 5, 16) }));
const musicAudioFile = new AudioClip("sounds/music.mp3");
export const musicSource = new AudioSource(musicAudioFile);
musicSound.addComponent(musicSource);
musicSource.loop = true;
musicSource.playing = true;

// --- Sound Effects ---
// Ammo pickup
export const ammoPickupSound = new Entity();
ammoPickupSound.addComponent(
  new Transform({ position: new Vector3(16, 0, 16) })
);
const ammoPickupAudioFile = new AudioClip("sounds/ammo-pickup.mp3");
export const ammoPickupSource = new AudioSource(ammoPickupAudioFile);
ammoPickupSound.addComponent(ammoPickupSource);
ammoPickupSource.playing = false;

// Shooting
export const shootSound = new Entity();
shootSound.addComponent(new Transform());
const shootAudioFile = new AudioClip("sounds/shot.mp3");
export const shootSource = new AudioSource(shootAudioFile);
shootSound.addComponent(shootSource);
shootSource.playing = false;

// Clip empty
export const clipEmptySound = new Entity();
clipEmptySound.addComponent(new Transform());
const clipEmptyAudioFile = new AudioClip("sounds/clip-empty.mp3");
export const clipEmptySource = new AudioSource(clipEmptyAudioFile);
clipEmptySound.addComponent(clipEmptySource);
clipEmptySource.playing = false;

// Gun pickup
export const gunPickupSound = new Entity();
gunPickupSound.addComponent(new Transform());
const gunPickupAudioFile = new AudioClip("sounds/gun-pickup.mp3");
export const gunPickupSource = new AudioSource(gunPickupAudioFile);
gunPickupSound.addComponent(gunPickupSource);
gunPickupSource.playing = false;

// Air raid
export const airRaidSound = new Entity();
airRaidSound.addComponent(new Transform({ position: new Vector3(16, 5, 16) }));
const airRaidAudioFile = new AudioClip("sounds/air-raid.mp3");
export const airRaidSource = new AudioSource(airRaidAudioFile);
airRaidSound.addComponent(airRaidSource);
airRaidSource.playing = false;

/// --- Egg Pop Out ---
// NOTE: even though the sound is the same for all the chicks, you need a separate audio clip for each chick
// Egg pop out magenta
export const eggPopOutMagentaSound = new Entity();
eggPopOutMagentaSound.addComponent(new Transform());
const eggPopOutMagentaAudioFile = new AudioClip(
  "sounds/egg-pop-out-magenta.mp3"
);
export const eggPopOutMagentaSource = new AudioSource(
  eggPopOutMagentaAudioFile
);
eggPopOutMagentaSound.addComponent(eggPopOutMagentaSource);
eggPopOutMagentaSource.playing = false;

// Egg pop out cyan
export const eggPopOutCyanSound = new Entity();
eggPopOutCyanSound.addComponent(new Transform());
const eggPopOutCyanAudioFile = new AudioClip("sounds/egg-pop-out-cyan.mp3");
export const eggPopOutCyanSource = new AudioSource(eggPopOutCyanAudioFile);
eggPopOutCyanSound.addComponent(eggPopOutCyanSource);
eggPopOutCyanSource.playing = false;

// Egg pop out orange
export const eggPopOutOrangeSound = new Entity();
eggPopOutOrangeSound.addComponent(new Transform());
const eggPopOutOrangeAudioFile = new AudioClip("sounds/egg-pop-out-orange.mp3");
export const eggPopOutOrangeSource = new AudioSource(eggPopOutOrangeAudioFile);
eggPopOutOrangeSound.addComponent(eggPopOutOrangeSource);
eggPopOutOrangeSource.playing = false;

/// --- Egg Falling ---
// NOTE: even though the sound is the same for all the chicks, you need a separate audio clip for each chick
// Egg falling magenta
export const eggFallingMagentaSound = new Entity();
eggFallingMagentaSound.addComponent(new Transform());
const eggFallingMagentaAudioFile = new AudioClip(
  "sounds/egg-falling-magenta.mp3"
);
export const eggFallingMagentaSource = new AudioSource(
  eggFallingMagentaAudioFile
);
eggFallingMagentaSound.addComponent(eggFallingMagentaSource);
eggFallingMagentaSource.playing = false;

// Egg falling cyan
export const eggFallingCyanSound = new Entity();
eggFallingCyanSound.addComponent(new Transform());
const eggFallingCyanAudioFile = new AudioClip("sounds/egg-falling-cyan.mp3");
export const eggFallingCyanSource = new AudioSource(eggFallingCyanAudioFile);
eggFallingCyanSound.addComponent(eggFallingCyanSource);
eggFallingCyanSource.playing = false;

// Egg falling orange
export const eggFallingOrangeSound = new Entity();
eggFallingOrangeSound.addComponent(new Transform());
const eggFallingOrangeAudioFile = new AudioClip(
  "sounds/egg-falling-orange.mp3"
);
export const eggFallingOrangeSource = new AudioSource(
  eggFallingOrangeAudioFile
);
eggFallingOrangeSound.addComponent(eggFallingOrangeSource);
eggFallingOrangeSource.playing = false;

// Frying egg explosion
export const eggExplosionSound = new Entity();
eggExplosionSound.addComponent(new Transform());
const eggExplosionAudioFile = new AudioClip("sounds/egg-explosion.mp3");
export const eggExplosionSource = new AudioSource(eggExplosionAudioFile);
eggExplosionSound.addComponent(eggExplosionSource);
eggExplosionSource.playing = false;

// Game over
export const gameOverSound = new Entity();
gameOverSound.addComponent(new Transform());
const gameOverAudioFile = new AudioClip("sounds/game-over.mp3");
export const gameOverSource = new AudioSource(gameOverAudioFile);
gameOverSound.addComponent(gameOverSource);
gameOverSource.playing = false;

// Grow sweetcorns
export const sweetcornSound = new Entity();
sweetcornSound.addComponent(new Transform());
const sweetcornAudioFile = new AudioClip("sounds/grow.mp3");
export const sweetcornSource = new AudioSource(sweetcornAudioFile);
sweetcornSound.addComponent(sweetcornSource);
sweetcornSource.playing = false;
