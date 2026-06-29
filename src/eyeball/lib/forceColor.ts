import * as THREE from 'three';

/**
 * Maps a force value (0-1) to a color gradient from silver to deep red.
 *
 * - 0.0: silver (no force, free space)
 * - 0.3: light pink (light contact)
 * - 0.6: orange-red (moderate force)
 * - 1.0: deep red (high force / max insertion + tilt)
 */
export function forceToColor(force: number): THREE.Color {
  const r = Math.min(1, 0.75 + force * 0.25);
  const g = Math.max(0, 0.75 - force * 0.75);
  const b = Math.max(0, 0.75 - force * 0.65);
  return new THREE.Color(r, g, b);
}
