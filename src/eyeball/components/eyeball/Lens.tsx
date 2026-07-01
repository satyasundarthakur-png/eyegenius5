import * as THREE from 'three';
import { useMemo } from 'react';
import { eyeAnatomy } from '../../../../packages/anatomy-engine/src/EyeAnatomy';

/**
 * Lens assembly — cataractous surgical eye rendering.
 *
 * Layers (front to back inside the globe):
 *   1. Lens Capsule    — thin, highly reflective outer bag
 *   2. CapsularReflex  — glistening white ring at anterior capsule equator
 *   3. Cortex          — semi-opaque with cortical spoke texture
 *   4. Nucleus         — grade 2-3 nuclear sclerosis: amber-yellow core
 *                        grading to deeper amber-brown at centre, clearly
 *                        visible through the dilated pupil as a "brunescent"
 *                        disc — the clinical appearance that tells the surgeon
 *                        a cataract is present and grades its density.
 *
 * Since this is a cataract training simulator, the lens is intentionally
 * rendered with visible pathology, not a clear young lens. The nuclear
 * colour and density are modelled on LOCS III grade ~2-3 (common surgical
 * indication): yellow-amber nucleus, visible cortical spokes, intact
 * anterior capsule with normal capsular reflex.
 */

// ---------------------------------------------------------------------------
// Seeded PRNG (same mulberry32 used elsewhere in /eyeball)
// ---------------------------------------------------------------------------
function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Nuclear sclerosis texture — amber-yellow core, grading to amber-brown
// ---------------------------------------------------------------------------
function createNucleusTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const rawCtx = canvas.getContext('2d');
  if (!rawCtx) return new THREE.CanvasTexture(canvas);
  const ctx: CanvasRenderingContext2D = rawCtx;
  const r = rng(42);

  // Radial gradient: dark amber-brown centre → warm amber-yellow → pale straw edge
  // Represents LOCS III NC2-NC3 (nuclear colour grading)
  const cx = size / 2, cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
  grad.addColorStop(0,    '#7a4a10'); // dense brunescent core
  grad.addColorStop(0.18, '#9a6018'); // deep amber
  grad.addColorStop(0.42, '#c88830'); // amber
  grad.addColorStop(0.68, '#dea848'); // amber-yellow
  grad.addColorStop(0.85, '#e8c070'); // pale yellow
  grad.addColorStop(1,    '#f0d898'); // straw at periphery
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Fine irregular density variation — lamellar structure of the ageing nucleus
  for (let i = 0; i < 1200; i++) {
    const x = r() * size;
    const y = r() * size;
    const len = 4 + r() * 18;
    const angle = r() * Math.PI;
    const alpha = 0.03 + r() * 0.06;
    const dark = r() > 0.5;
    ctx.strokeStyle = dark
      ? `rgba(60,30,5,${alpha})`
      : `rgba(240,200,120,${alpha})`;
    ctx.lineWidth = 0.6 + r() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Watercleft lines — fine radial bright streaks typical of nuclear sclerosis
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2 + (r() - 0.5) * 0.3;
    const startR = size * 0.05 + r() * size * 0.1;
    const endR   = size * 0.28 + r() * size * 0.15;
    ctx.strokeStyle = `rgba(255,220,140,${0.12 + r() * 0.12})`;
    ctx.lineWidth = 0.8 + r() * 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * startR, cy + Math.sin(angle) * startR);
    ctx.lineTo(cx + Math.cos(angle) * endR,   cy + Math.sin(angle) * endR);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------------------------------------------------------------------------
// Cortical cataract texture — radial spoke opacities
// ---------------------------------------------------------------------------
function createCortexTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const rawCtx = canvas.getContext('2d');
  if (!rawCtx) return new THREE.CanvasTexture(canvas);
  const ctx: CanvasRenderingContext2D = rawCtx;
  const r = rng(99);

  // Base: translucent pale white — normal cortex
  ctx.fillStyle = 'rgba(245, 240, 232, 0.0)';
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2, cy = size / 2;

  // Cortical spokes — radial wedge-shaped opacities typical of cortical cataract
  const spokeCount = 8 + Math.floor(r() * 6);
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2 + r() * 0.4;
    const halfWidth = (0.04 + r() * 0.06) * Math.PI;
    const innerR = size * (0.12 + r() * 0.08);
    const outerR = size * (0.35 + r() * 0.12);
    const opacity = 0.10 + r() * 0.18;

    const spokeGrad = ctx.createLinearGradient(
      cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR,
      cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR
    );
    spokeGrad.addColorStop(0,   `rgba(255,252,245,0)`);
    spokeGrad.addColorStop(0.3, `rgba(255,252,245,${opacity})`);
    spokeGrad.addColorStop(1,   `rgba(255,252,245,0)`);

    ctx.fillStyle = spokeGrad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, angle - halfWidth, angle + halfWidth);
    ctx.closePath();
    ctx.fill();
  }

  // Diffuse central cortical haze
  const hazeGrad = ctx.createRadialGradient(cx, cy, size * 0.08, cx, cy, size * 0.42);
  hazeGrad.addColorStop(0, 'rgba(255,250,240,0.05)');
  hazeGrad.addColorStop(1, 'rgba(255,250,240,0)');
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function Lens() {
  const capsuleData = eyeAnatomy.getLayerRenderData('lens-capsule');
  const cortexData  = eyeAnatomy.getLayerRenderData('cortex');
  const nucleusData = eyeAnatomy.getLayerRenderData('nucleus');

  const nucleusTexture = useMemo(() => createNucleusTexture(), []);
  const cortexTexture  = useMemo(() => createCortexTexture(),  []);

  const capsuleGeometry = useMemo(() => {
    if (capsuleData) return capsuleData.geometry;
    const g = new THREE.SphereGeometry(5.0, 48, 48);
    g.scale(1, 1, 0.6);
    return g;
  }, [capsuleData]);

  const cortexGeometry = useMemo(() => {
    if (cortexData) return cortexData.geometry;
    const g = new THREE.SphereGeometry(4.8, 48, 48);
    g.scale(1, 1, 0.62);
    return g;
  }, [cortexData]);

  const nucleusGeometry = useMemo(() => {
    if (nucleusData) return nucleusData.geometry;
    const g = new THREE.SphereGeometry(3.2, 40, 40);
    g.scale(1, 1, 0.7);
    return g;
  }, [nucleusData]);

  const reflexGeometry = useMemo(() => new THREE.TorusGeometry(4.3, 0.14, 12, 96), []);

  return (
    <group position={[0, 0, 4.5]}>

      {/* ── Lens Capsule ─────────────────────────────────────────────────────
          Very thin, clear, highly-reflective outer bag. The capsule is what
          the surgeon scores with the bent-needle/forceps during capsulorhexis.
          Near-zero roughness + high clearcoat gives it the characteristic
          "wet cellophane" glisten under the microscope.                    */}
      <mesh geometry={capsuleGeometry}>
        <meshPhysicalMaterial
          color="#eef6ff"
          transparent
          opacity={0.55}
          roughness={0.04}
          metalness={0.12}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          transmission={0.6}
          thickness={0.25}
        />
      </mesh>

      {/* ── Capsular Reflex ───────────────────────────────────────────────────
          The glistening white ring at the anterior-capsule equator.
          This is the surgical landmark surgeons locate to initiate and
          centre the capsulorhexis. Distinct from the CapsulorhexisGuide
          (warm yellow, pulsing, shown only during the rhexis step).       */}
      <mesh geometry={reflexGeometry} position={[0, 0, 0.9]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.42}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* ── Cortex ───────────────────────────────────────────────────────────
          Semi-transparent layer with radial cortical-spoke texture.
          In a surgical candidate the cortex shows early spoke-like opacities
          (cortical cataract), visible as whitish radial wedges.            */}
      <mesh geometry={cortexGeometry}>
        <meshPhysicalMaterial
          map={cortexTexture}
          color="#f5efe5"
          transparent
          opacity={0.82}
          roughness={0.18}
          metalness={0.04}
          clearcoat={0.55}
          clearcoatRoughness={0.15}
          transmission={0.18}
          thickness={0.8}
        />
      </mesh>

      {/* ── Nucleus ──────────────────────────────────────────────────────────
          Grade 2-3 nuclear sclerosis (LOCS III NC2-NC3): the amber-yellow
          to amber-brown disc that dominates the view through the dilated
          pupil. Its presence, colour, and density tell the surgeon which
          phaco energy/technique to use. Without this the lens just looks
          like a clear implant — the single biggest visual lacuna a first-time
          user of the old version would notice.                              */}
      <mesh geometry={nucleusGeometry}>
        <meshPhysicalMaterial
          map={nucleusTexture}
          color="#d4960a"
          transparent
          opacity={0.96}
          roughness={0.28}
          metalness={0.03}
          clearcoat={0.35}
          clearcoatRoughness={0.3}
          emissive={new THREE.Color('#3a1e00')}
          emissiveIntensity={0.08}
        />
      </mesh>

    </group>
  );
}
