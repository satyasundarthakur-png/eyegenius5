import * as THREE from "three";
import { useMemo } from "react";
import { EYEBALL_RADIUS, COLORS } from "../../constants";

/**
 * Seeded pseudo-random number generator (mulberry32).
 * Ensures deterministic texture generation across renders.
 */
function createRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface VesselSegment {
  x: number;
  y: number;
  radius: number;
  generation: number;
  angle: number;
  opacity: number;
  isVenous: boolean;
}

/**
 * Generate a procedural blood vessel texture for the sclera surface.
 * Uses recursive branching algorithm for anatomically plausible vascular networks.
 *
 * Vessels are densest near the limbus (upper portion of texture) and sparser
 * toward the posterior (lower portion). Major trunks branch into capillaries
 * with decreasing thickness and opacity.
 */
function createVesselTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) return new THREE.CanvasTexture(canvas);
  const ctx: CanvasRenderingContext2D = rawCtx;

  const rng = createRng(42);

  /** Build an rgba() color string without template literal type issues. */
  const rgba = (r: number, g: number, b: number, a: number) =>
    "rgba(" + r.toFixed(0) + ", " + g.toFixed(0) + ", " + b.toFixed(0) + ", " + a.toFixed(3) + ")";

  // Base: bright natural sclera white with faint warm undertones toward posterior
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, "#fbfaf6");
  gradient.addColorStop(0.3, "#f7f5ef");
  gradient.addColorStop(0.7, "#f2eee5");
  gradient.addColorStop(1, "#ebe4d6");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Add subtle noise to the base for organic feel
  for (let i = 0; i < 8000; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const alpha = rng() * 0.03;
    const shade = 180 + rng() * 40;
    ctx.fillStyle = rgba(shade, shade - 20, shade - 30, alpha);
    ctx.fillRect(x, y, 1 + rng() * 2, 1 + rng() * 2);
  }

  // Limbus region: v ≈ 0.18-0.25 on the sphere maps to y ≈ 0.18*size to 0.25*size
  // Vessels are densest here and grow toward posterior (increasing y)
  const LIMBUS_Y = size * 0.2;
  const CORNEA_LIMIT = size * 0.12; // vessels don't enter cornea
  const POSTERIOR_LIMIT = size * 0.85;

  /**
   * Recursively draw a vessel segment and its branches.
   */
  function drawVessel(seg: VesselSegment, depth: number) {
    if (depth > 6 || seg.radius < 0.3) return;
    if (seg.y < CORNEA_LIMIT || seg.y > POSTERIOR_LIMIT) return;

    // Determine segment length based on generation
    const segLength = (15 + rng() * 25) * (1 - depth * 0.1);
    const steps = Math.ceil(segLength / 2);

    // Color: venous (darker, bluer) for thicker vessels, arterial (brighter) for thinner
    const baseR = seg.isVenous ? 160 : 195;
    const baseG = seg.isVenous ? 50 : 70;
    const baseB = seg.isVenous ? 60 : 75;

    // Opacity decreases with generation
    const baseOpacity = seg.opacity * (1 - depth * 0.15);

    // Draw the segment as a series of points with slight wander
    ctx.beginPath();
    ctx.moveTo(seg.x, seg.y);

    let cx = seg.x;
    let cy = seg.y;
    let currentAngle = seg.angle;
    let currentRadius = seg.radius;
    const branchPoints: VesselSegment[] = [];

    for (let i = 0; i < steps; i++) {
      // Slight random angular wander
      currentAngle += (rng() - 0.5) * 0.3;
      // General tendency to grow toward posterior (downward)
      currentAngle += (Math.PI / 2 - currentAngle) * 0.02;

      const stepLen = 2;
      cx += Math.cos(currentAngle) * stepLen;
      cy += Math.sin(currentAngle) * stepLen;

      // Wrap horizontally for seamless tiling
      if (cx < 0) cx += size;
      if (cx >= size) cx -= size;

      // Taper radius along segment
      currentRadius = seg.radius * (1 - (i / steps) * 0.3);

      ctx.lineTo(cx, cy);

      // Decide whether to branch at this point
      if (i > steps * 0.3 && i < steps * 0.8 && rng() < 0.08 && depth < 5) {
        const branchAngle = currentAngle + (rng() > 0.5 ? 1 : -1) * (0.4 + rng() * 0.8);
        branchPoints.push({
          x: cx,
          y: cy,
          radius: currentRadius * (0.5 + rng() * 0.2),
          generation: depth + 1,
          angle: branchAngle,
          opacity: baseOpacity * 0.8,
          isVenous: rng() > 0.4,
        });
      }
    }

    // Draw with varying width (thicker at start, thinner at end)
    ctx.strokeStyle = rgba(baseR, baseG, baseB, baseOpacity);
    ctx.lineWidth = Math.max(0.5, seg.radius * 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Draw a second pass with slightly lighter color for depth illusion
    if (seg.radius > 1) {
      ctx.strokeStyle = rgba(baseR + 30, baseG + 20, baseB + 20, baseOpacity * 0.4);
      ctx.lineWidth = Math.max(0.3, seg.radius * 0.8);
      ctx.stroke();
    }

    // Recurse into branches
    for (const branch of branchPoints) {
      drawVessel(branch, depth + 1);
    }
  }

  // Seed major trunks along the limbus region
  const trunkCount = 5 + Math.floor(rng() * 3);
  for (let i = 0; i < trunkCount; i++) {
    const x = (i / trunkCount) * size + (rng() - 0.5) * size * 0.15;
    const y = LIMBUS_Y + (rng() - 0.5) * size * 0.06;
    const angle = Math.PI / 2 + (rng() - 0.5) * 0.6; // mostly downward
    const isVenous = rng() > 0.5;

    drawVessel(
      {
        x: ((x % size) + size) % size,
        y,
        radius: 2.0 + rng() * 1.5,
        generation: 0,
        angle,
        opacity: 0.35 + rng() * 0.15,
        isVenous,
      },
      0,
    );
  }

  // Add secondary smaller trunks between the main ones
  for (let i = 0; i < 8; i++) {
    const x = rng() * size;
    const y = LIMBUS_Y + size * 0.05 + rng() * size * 0.15;
    const angle = Math.PI / 2 + (rng() - 0.5) * 1.0;

    drawVessel(
      {
        x,
        y,
        radius: 1.0 + rng() * 0.8,
        generation: 0,
        angle,
        opacity: 0.2 + rng() * 0.1,
        isVenous: rng() > 0.5,
      },
      0,
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function Sclera() {
  const { geometry, vesselMap } = useMemo(() => {
    const geo = new THREE.SphereGeometry(EYEBALL_RADIUS, 64, 64);
    const tex = createVesselTexture();
    return { geometry: geo, vesselMap: tex };
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color="#f8f5ee"
        roughness={0.6}
        metalness={0.0}
        clearcoat={0.2}
        clearcoatRoughness={0.5}
        transmission={0.03}
        thickness={2.0}
        attenuationColor={new THREE.Color("#fff3d8")}
        attenuationDistance={7.0}
        side={THREE.FrontSide}
        map={vesselMap}
        envMapIntensity={0.45}
      />
    </mesh>
  );
}

export function EyeInterior() {
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(EYEBALL_RADIUS - 0.5, 48, 48);
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color={COLORS.interior}
        roughness={0.9}
        metalness={0.0}
        side={THREE.BackSide}
        envMapIntensity={0.2}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Retina texture — macula highlight + vascular tree silhouette
// ---------------------------------------------------------------------------
function createRetinaTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) return new THREE.CanvasTexture(canvas);
  const ctx: CanvasRenderingContext2D = rawCtx;
  const rng = createRng(77);
  const cx = size * 0.5,
    cy = size * 0.5;

  // Base: deep red-orange fundal background (seen through dilated pupil under coaxial light)
  const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
  base.addColorStop(0, "#c83818");
  base.addColorStop(0.35, "#b83010");
  base.addColorStop(0.7, "#9a2808");
  base.addColorStop(1, "#701808");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Macula — darker, slightly brownish region temporal to the disc
  // In a real fundus the macula appears darker than the surrounding retina
  const mX = cx + size * 0.22,
    mY = cy;
  const macular = ctx.createRadialGradient(mX, mY, 0, mX, mY, size * 0.14);
  macular.addColorStop(0, "#501008");
  macular.addColorStop(0.5, "#8a2010");
  macular.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = macular;
  ctx.fillRect(0, 0, size, size);

  // Foveal reflex — tiny bright highlight at the centre of the macula
  const fovea = ctx.createRadialGradient(mX, mY, 0, mX, mY, size * 0.022);
  fovea.addColorStop(0, "rgba(255,200,160,0.75)");
  fovea.addColorStop(1, "rgba(255,200,160,0)");
  ctx.fillStyle = fovea;
  ctx.fillRect(0, 0, size, size);

  // Optic disc — pale yellowish oval nasal to centre
  const dX = cx - size * 0.18,
    dY = cy;
  const disc = ctx.createRadialGradient(dX, dY, 0, dX, dY, size * 0.065);
  disc.addColorStop(0, "#e8c890");
  disc.addColorStop(0.5, "#d4a060");
  disc.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = disc;
  ctx.fillRect(0, 0, size, size);

  // Vascular tree — major arcades radiating from the disc
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  function vessel(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
    branches: number,
    depth: number,
  ) {
    if (depth < 0 || width < 0.4) return;
    ctx.strokeStyle = `rgba(${60 + depth * 8}, 10, 5, ${0.55 - depth * 0.06})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const mx = (x1 + x2) / 2 + (rng() - 0.5) * size * 0.06;
    const my = (y1 + y2) / 2 + (rng() - 0.5) * size * 0.06;
    ctx.quadraticCurveTo(mx, my, x2, y2);
    ctx.stroke();
    if (branches > 0) {
      const offset = size * (0.06 + rng() * 0.08);
      vessel(
        x2,
        y2,
        x2 + (rng() - 0.5) * offset * 2,
        y2 - offset,
        width * 0.68,
        branches - 1,
        depth - 1,
      );
      vessel(
        x2,
        y2,
        x2 + (rng() - 0.5) * offset * 2,
        y2 + offset,
        width * 0.62,
        branches - 1,
        depth - 1,
      );
    }
  }

  // Superior arcade — sweeps up and temporal from disc
  vessel(dX, dY, cx, cy - size * 0.28, 3.5, 3, 4);
  vessel(dX, dY, cx + size * 0.1, cy - size * 0.22, 3.0, 3, 4);
  // Inferior arcade — sweeps down and temporal
  vessel(dX, dY, cx, cy + size * 0.28, 3.5, 3, 4);
  vessel(dX, dY, cx + size * 0.1, cy + size * 0.22, 3.0, 3, 4);
  // Nasal vessels — shorter, more radial
  vessel(dX, dY, dX - size * 0.2, dY - size * 0.12, 2.2, 2, 3);
  vessel(dX, dY, dX - size * 0.2, dY + size * 0.12, 2.2, 2, 3);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Retina — semi-transparent inner layer with macula, fovea, optic disc,
 * and vascular arcade silhouette. Rendered on BackSide so it forms the
 * warm red-orange background visible through the dilated pupil as the
 * fundal/red-reflex glow that surgeons use to judge capsule visibility.
 */
export function Retina() {
  const RETINA_RADIUS = EYEBALL_RADIUS - 0.3;
  const geometry = useMemo(() => new THREE.SphereGeometry(RETINA_RADIUS, 64, 64), []);
  const texture = useMemo(() => createRetinaTexture(), []);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.82}
        roughness={0.9}
        metalness={0}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
