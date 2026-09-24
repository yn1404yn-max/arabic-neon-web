/**
 * Animation Engine for Neon & RetroLED
 * High-performance 60fps animation driver based on Web Animations API & RAF
 * Implements:
 * 1. RTL Marquee Scroll (smooth transform / continuous loop)
 * 2. Realistic Electrical Flicker (voltage drop / arc ignition)
 * 3. Typewriter Reveal (RTL-aware clip for zero layout reflow)
 * 4. Sine Breathing / Pulse (luxurious luminous pulsing)
 * 5. Steady Glow
 */

export class AnimationController {
  constructor(onUpdate) {
    this.onUpdate = onUpdate;
    this.mode = 'flicker'; // 'steady' | 'flicker' | 'scroll' | 'typewriter' | 'pulse'
    this.speed = 1.0;
    this.isPlaying = true;
    this.rafId = null;
    this.startTime = performance.now();
    this.lastTime = performance.now();

    // State tracking
    this.scrollX = 0;
    this.flickerFactor = 1.0;
    this.clipPercent = 1.0;
    this.pulseFactor = 1.0;

    this.loop = this.loop.bind(this);
  }

  start() {
    this.isPlaying = true;
    this.lastTime = performance.now();
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.scrollX = 0;
    this.clipPercent = 1.0;
    this.flickerFactor = 1.0;
    this.startTime = performance.now();
  }

  setSpeed(speed) {
    this.speed = Math.max(0.1, Math.min(5.0, speed));
  }

  loop(currentTime) {
    if (!this.isPlaying) return;

    const delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const elapsed = (currentTime - this.startTime) / 1000;

    // Calculate animation state based on mode
    switch (this.mode) {
      case 'scroll': {
        // Continuous RTL scroll
        const scrollSpeedPx = 90 * this.speed;
        this.scrollX -= scrollSpeedPx * delta;
        this.flickerFactor = 1.0;
        this.clipPercent = 1.0;
        break;
      }

      case 'flicker': {
        // Realistic Neon electrical arc flicker
        this.scrollX = 0;
        this.clipPercent = 1.0;
        const noise = Math.sin(elapsed * this.speed * 8) * Math.cos(elapsed * this.speed * 13);
        const rand = Math.random();

        // 3% probability of dramatic micro-dip (voltage drop)
        if (rand < 0.035 * this.speed) {
          this.flickerFactor = rand < 0.01 ? 0.1 : 0.45;
        } else {
          // Ambient organic hum
          this.flickerFactor = 0.9 + 0.1 * noise;
        }
        break;
      }

      case 'typewriter': {
        this.scrollX = 0;
        this.flickerFactor = 1.0;
        // Loop typewriter every 4 seconds adjusted by speed
        const cycle = (elapsed * this.speed * 0.4) % 1.0;
        if (cycle < 0.8) {
          // Reveal phase (RTL)
          this.clipPercent = cycle / 0.8;
        } else {
          // Hold full reveal phase
          this.clipPercent = 1.0;
        }
        break;
      }

      case 'pulse': {
        this.scrollX = 0;
        this.clipPercent = 1.0;
        // Smooth sine wave breathing between 0.65 and 1.25
        const wave = (Math.sin(elapsed * this.speed * 3.0) + 1) / 2;
        this.flickerFactor = 0.7 + 0.35 * wave;
        this.pulseFactor = 0.98 + 0.04 * wave;
        break;
      }

      case 'steady':
      default: {
        this.scrollX = 0;
        this.clipPercent = 1.0;
        this.flickerFactor = 1.0;
        this.pulseFactor = 1.0;
        break;
      }
    }

    if (this.onUpdate) {
      this.onUpdate({
        mode: this.mode,
        scrollX: this.scrollX,
        flickerFactor: this.flickerFactor,
        clipPercent: this.clipPercent,
        pulseFactor: this.pulseFactor,
        elapsed
      });
    }

    this.rafId = requestAnimationFrame(this.loop);
  }
}
