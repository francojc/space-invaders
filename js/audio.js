class AudioManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.3;
    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.createSounds();
    } catch (e) {
      console.warn('Web Audio API not supported, sounds disabled');
      this.enabled = false;
    }
  }

  createSounds() {
    this.createShootSound();
    this.createHitSound();
    this.createExplosionSound();
    this.createPowerUpSound();
    this.createGameOverSound();
    this.createVictorySound();
  }

  createShootSound() {
    this.sounds.shoot = () => this.createTone(800, 0.1, 'square');
  }

  createHitSound() {
    this.sounds.hit = () => this.createTone(400, 0.2, 'sawtooth');
  }

  createExplosionSound() {
    this.sounds.explosion = () => {
      this.createNoiseSound(0.3);
    };
  }

  createPowerUpSound() {
    this.sounds.powerUp = () => {
      this.createMelody([523, 659, 784, 1047], 0.1);
    };
  }

  createGameOverSound() {
    this.sounds.gameOver = () => {
      this.createMelody([523, 494, 466, 440], 0.4);
    };
  }

  createVictorySound() {
    this.sounds.victory = () => {
      this.createMelody([523, 659, 784, 1047, 1319], 0.2);
    };
  }

  createTone(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }

  createNoiseSound(duration) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const bufferSize = this.audioContext.sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      gainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      source.start(this.audioContext.currentTime);
    } catch (e) {
      console.warn('Noise sound playback failed:', e);
    }
  }

  createMelody(frequencies, noteDuration) {
    if (!this.enabled || !this.audioContext) return;

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.createTone(freq, noteDuration, 'square');
      }, index * noteDuration * 1000);
    });
  }

  playSound(soundName) {
    if (!this.enabled || !this.sounds[soundName]) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        this.sounds[soundName]();
      });
    } else {
      this.sounds[soundName]();
    }
  }

  setVolume(volume) {
    this.volume = Utils.clamp(volume, 0, 1);
  }

  toggleAudio() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

const audioManager = new AudioManager();