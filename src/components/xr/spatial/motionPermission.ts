/**
 * iOS 13+ requires DeviceOrientation / DeviceMotion permission to be requested
 * synchronously inside a user gesture. Kept dependency-free so it can be called from the
 * main bundle before the (lazy-loaded) three.js spatial world is downloaded.
 */
type PermissionCapable = {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export function requestMotionPermission(): Promise<boolean> {
  const DO = (typeof DeviceOrientationEvent !== 'undefined'
    ? DeviceOrientationEvent
    : undefined) as unknown as PermissionCapable | undefined;
  const DM = (typeof DeviceMotionEvent !== 'undefined'
    ? DeviceMotionEvent
    : undefined) as unknown as PermissionCapable | undefined;

  const tasks: Promise<unknown>[] = [];
  if (DO && typeof DO.requestPermission === 'function') tasks.push(DO.requestPermission());
  if (DM && typeof DM.requestPermission === 'function') tasks.push(DM.requestPermission().catch(() => 'denied'));
  if (tasks.length === 0) return Promise.resolve(typeof DeviceOrientationEvent !== 'undefined');
  return Promise.all(tasks)
    .then((results) => results[0] === 'granted')
    .catch(() => false);
}
