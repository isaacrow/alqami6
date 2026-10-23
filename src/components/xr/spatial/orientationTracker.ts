import * as THREE from 'three';

/**
 * World-locked head pose for iPhone Safari (and any phone browser) WITHOUT WebXR.
 *
 * iOS Safari has no `immersive-ar`, but it does expose the fused (gyro + accelerometer +
 * magnetometer) attitude through `deviceorientation`. We convert that attitude into a full
 * quaternion (no Euler clamping, no gimbal lock) using the W3C DeviceOrientation spec
 * convention (Z-X'-Y'' intrinsic), compensate for the current screen rotation, and expose
 * it as a three.js camera orientation. Every window / object is then placed in a fixed
 * world frame, so it stays where you left it while you turn the phone — like visionOS.
 *
 * This is rotational (3DoF) tracking; positional tracking needs ARKit, which Safari does not
 * expose to the web.
 */

const DEG = Math.PI / 180;
const Z_AXIS = new THREE.Vector3(0, 0, 1);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
// Device frame -> camera frame: the phone camera looks out of the back of the device (-Z of
// the screen frame), so rotate -90° around X.
const SCREEN_TO_CAMERA = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

export { requestMotionPermission } from './motionPermission';

export function getScreenAngle(): number {
  const angle =
    (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.angle === 'number'
      ? screen.orientation.angle
      : (window as unknown as { orientation?: number }).orientation) ?? 0;
  return Number(angle) || 0;
}

export class OrientationTracker {
  /** Raw device attitude in the world frame (Y up, -Z = initial forward after recenter). */
  private readonly sensor = new THREE.Quaternion();
  /** Smoothed attitude actually used for rendering. */
  private readonly smoothed = new THREE.Quaternion();
  /** Manual yaw from finger dragging / recentering (radians). */
  private yawOffset = 0;
  /** Extra pitch for desktop mouse look (radians), only used when no sensor data. */
  private manualPitch = 0;
  private readonly euler = new THREE.Euler();
  private readonly tmpQ = new THREE.Quaternion();
  private readonly yawQ = new THREE.Quaternion();
  private readonly fwd = new THREE.Vector3();
  private lastSample = 0;
  private lastFrame = 0;
  private angularVelocity = new THREE.Vector3(); // rad/s from devicemotion (device frame)
  private listening = false;
  private sampleCount = 0;

  hasSensor = false;
  /** Latency compensation in ms (predicts forward using the gyroscope rate). */
  predictionMs = 12;
  /** True geographic compass heading from iOS Safari webkitCompassHeading (0-360 deg) */
  compassHeading = 0;
  private readonly filteredSensor = new THREE.Quaternion();

  private readonly onOrientation = (e: DeviceOrientationEvent) => {
    if (typeof (e as any).webkitCompassHeading === 'number') {
      this.compassHeading = (e as any).webkitCompassHeading;
    }
    if (e.alpha == null || e.beta == null || e.gamma == null) return;
    const alpha = e.alpha * DEG;
    const beta = e.beta * DEG;
    const gamma = e.gamma * DEG;
    const orient = getScreenAngle() * DEG;

    // W3C: R = Rz(alpha) * Rx(beta) * Ry(gamma). three.js YXZ ordering of
    // (beta, alpha, -gamma) is the well known equivalent mapping into a Y-up world.
    this.euler.set(beta, alpha, -gamma, 'YXZ');
    this.tmpQ.setFromEuler(this.euler);
    this.tmpQ.multiply(SCREEN_TO_CAMERA);
    this.tmpQ.multiply(new THREE.Quaternion().setFromAxisAngle(Z_AXIS, -orient));

    // Guard against the 0/360 hemisphere flip so slerp always takes the short path.
    if (this.sensor.dot(this.tmpQ) < 0) {
      this.tmpQ.set(-this.tmpQ.x, -this.tmpQ.y, -this.tmpQ.z, -this.tmpQ.w);
    }
    
    // Low-pass filter raw gyro/magnetometer noise to remove mobile trembling/jitter
    if (!this.hasSensor) {
      this.sensor.copy(this.tmpQ);
      this.smoothed.copy(this.tmpQ);
      this.hasSensor = true;
      this.recenter();
    } else {
      // 0.85 filter weight eliminates high-frequency sensor noise without lag
      this.sensor.slerp(this.tmpQ, 0.85);
    }
    this.lastSample = performance.now();
    this.sampleCount += 1;
  };

  private readonly onMotion = (e: DeviceMotionEvent) => {
    const r = e.rotationRate;
    if (!r || r.alpha == null || r.beta == null || r.gamma == null) return;
    // rotationRate: alpha = around Z, beta = around X, gamma = around Y (deg/s, device frame)
    this.angularVelocity.set(r.beta * DEG, r.gamma * DEG, r.alpha * DEG);
  };

  start() {
    if (this.listening) return;
    this.listening = true;
    window.addEventListener('deviceorientation', this.onOrientation, true);
    window.addEventListener('devicemotion', this.onMotion, true);
  }

  stop() {
    if (!this.listening) return;
    this.listening = false;
    window.removeEventListener('deviceorientation', this.onOrientation, true);
    window.removeEventListener('devicemotion', this.onMotion, true);
  }

  /** True when the sensor stream is alive (iOS stops it when permission is missing). */
  get sensorAlive() {
    return this.hasSensor && performance.now() - this.lastSample < 1000;
  }

  get samples() {
    return this.sampleCount;
  }

  /** Heading (yaw, radians) of the raw sensor forward vector. */
  private sensorHeading(): number {
    this.fwd.set(0, 0, -1).applyQuaternion(this.hasSensor ? this.smoothed : this.tmpQ.identity());
    return Math.atan2(-this.fwd.x, -this.fwd.z);
  }

  /** Make whatever direction the phone points at right now the world's "front". */
  recenter() {
    this.yawOffset = -this.sensorHeading();
    this.manualPitch = 0;
  }

  /** Finger / mouse look. dx,dy in radians. */
  addLook(dYaw: number, dPitch: number) {
    this.yawOffset += dYaw;
    if (!this.hasSensor) {
      this.manualPitch = Math.max(-1.2, Math.min(1.2, this.manualPitch + dPitch));
    }
  }

  /**
   * Writes the current camera orientation into `out`.
   * Uses a frame-rate independent critically-damped filter plus gyro based prediction, so it
   * feels "locked" without the jitter of raw samples.
   */
  getCameraQuaternion(out: THREE.Quaternion, now = performance.now()): THREE.Quaternion {
    const dt = this.lastFrame ? Math.min(0.1, (now - this.lastFrame) / 1000) : 0.016;
    this.lastFrame = now;

    if (this.hasSensor) {
      // Predict ahead using the gyro rate (device frame) to hide sensor->photon latency.
      const target = this.tmpQ.copy(this.sensor);
      const lead = Math.min(0.05, this.predictionMs / 1000 + (now - this.lastSample) / 1000);
      const w = this.angularVelocity;
      const speed = w.length();
      if (speed > 0.02 && lead > 0) {
        const axis = new THREE.Vector3(w.x, w.y, w.z).normalize();
        // rotationRate is in the device (screen) frame; screen->camera is a fixed basis change
        axis.applyQuaternion(SCREEN_TO_CAMERA.clone().invert());
        const orient = getScreenAngle() * DEG;
        axis.applyAxisAngle(Z_AXIS, orient);
        target.multiply(new THREE.Quaternion().setFromAxisAngle(axis, speed * lead));
      }
      // Adaptive critically-damped smoothing: robust against tremors when still, instant when turning
      const tau = speed > 1.2 ? 0.008 : speed > 0.3 ? 0.018 : 0.038;
      const k = 1 - Math.exp(-dt / tau);
      if (this.smoothed.dot(target) < 0) target.set(-target.x, -target.y, -target.z, -target.w);
      this.smoothed.slerp(target, k);
      this.yawQ.setFromAxisAngle(Y_AXIS, this.yawOffset);
      return out.copy(this.yawQ).multiply(this.smoothed);
    }

    // Desktop / no-sensor fallback: mouse/finger look.
    this.euler.set(this.manualPitch, this.yawOffset, 0, 'YXZ');
    return out.setFromEuler(this.euler);
  }
}
