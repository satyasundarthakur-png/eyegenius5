import * as THREE from 'three';
import { useMemo } from 'react';
import { EYEBALL_RADIUS } from '../../constants';
import { LIMBUS_RADIUS } from './Cornea';
import { useSimulationStore } from '../../stores/simulationStore';

/**
 * SurgicalField — periocular skin + lid speculum + fenestrated drape.
 *
 * Without this, the simulator renders only the bare globe (sclera/cornea/iris)
 * floating in space, which reads as "an artificial ball" rather than a draped
 * surgical eye. This component adds the three layers a real microscope view
 * always shows around the operative field, working outward from the limbus:
 *
 *   1. PeriocularSkin — a ring of skin immediately around the palpebral
 *      fissure, including lid-margin lash stubble (top/bottom) and a pink
 *      canthal/caruncle patch (one side) — the strip of anatomy that's
 *      always visible between the conjunctiva and the drape aperture.
 *   2. LidSpeculum — an open-wire eyelid speculum (Barraquer-style) holding
 *      the lids apart, rendered as two curved metallic wire blades.
 *   3. SurgicalDrape — the sterile fenestrated drape covering the rest of
 *      the face/field, with an adhesive aperture border and iodine-prep tint
 *      near the opening, fabric-textured further out.
 *
 * All three share the same seeded-canvas-texture technique already used for
 * the sclera vessel map and iris fibers (see Sclera.tsx / Cornea.tsx).
 */

// ---------------------------------------------------------------------------
// Shared seeded RNG (same mulberry32 implementation used elsewhere in /eyeball)
// ---------------------------------------------------------------------------
function createRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// PeriocularSkin
// ---------------------------------------------------------------------------

const SKIN_INNER_RADIUS = LIMBUS_RADIUS + 1.2; // small conjunctival/scleral margin beyond limbus
const SKIN_OUTER_RADIUS = SKIN_INNER_RADIUS + 5.5;
const SKIN_Z = EYEBALL_RADIUS * 0.62; // recedes from the limbus toward the equator, following the orbit's curve

function createSkinTexture(mirror: boolean): THREE.CanvasTexture {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const rawCtx = canvas.getContext('2d');
  if (!rawCtx) return new THREE.CanvasTexture(canvas);
  const ctx: CanvasRenderingContext2D = rawCtx;

  const rng = createRng(7);

  // Base skin tone gradient: pinkish lid-margin mucosa (top, v=0 / inner) → warm tan skin (bottom, v=1 / outer)
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#d98a78');   // mucocutaneous junction / lid margin
  grad.addColorStop(0.18, '#e0a890');
  grad.addColorStop(0.5, '#e3b89c');
  grad.addColorStop(1, '#dcae93');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle skin texture noise
  for (let i = 0; i < 3000; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = 0.5 + rng() * 1.2;
    ctx.fillStyle = `rgba(${120 + rng() * 40 | 0}, ${70 + rng() * 30 | 0}, ${60 + rng() * 30 | 0}, ${0.04 + rng() * 0.06})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lash stubble — concentrated in two angular bands: "top" lid (u≈0.22–0.34, i.e. ~80–120°)
  // and "bottom" lid (u≈0.72–0.84, i.e. ~260–300°) along the inner (mucosal) edge.
  function drawLashBand(uStart: number, uEnd: number) {
    const xStart = uStart * w;
    const xEnd = uEnd * w;
    const count = 26;
    for (let i = 0; i < count; i++) {
      const x = xStart + ((xEnd - xStart) * i) / count + (rng() - 0.5) * 4;
      const y = 6 + rng() * 8;
      const len = 5 + rng() * 4;
      ctx.strokeStyle = `rgba(35, 22, 18, ${0.5 + rng() * 0.3})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rng() - 0.5) * 2, y + len);
      ctx.stroke();
    }
  }
  drawLashBand(0.20, 0.36);
  drawLashBand(0.70, 0.86);

  // Medial canthus / caruncle patch — anatomically nasal-side. For OD (right eye)
  // the nasal side is at angle≈180° (u≈0.5) when viewed from the surgeon's side;
  // for OS (left eye) it mirrors to u≈0.0. `mirror` flips which edge it's drawn on.
  const canthusU = mirror ? 0.5 : 0.0;
  const canthusX = canthusU * w;
  const canthusGrad = ctx.createRadialGradient(canthusX, 40, 2, canthusX, 40, 30);
  canthusGrad.addColorStop(0, 'rgba(232, 130, 120, 0.55)');
  canthusGrad.addColorStop(1, 'rgba(232, 130, 120, 0)');
  ctx.fillStyle = canthusGrad;
  ctx.fillRect(Math.max(0, canthusX - 30), 0, 60, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function PeriocularSkin() {
  const eyeSide = useSimulationStore((s) => s.eyeSide);
  const texture = useMemo(() => createSkinTexture(eyeSide === 'OS'), [eyeSide]);
  return (
    <mesh position={[0, 0, SKIN_Z]}>
      <ringGeometry args={[SKIN_INNER_RADIUS, SKIN_OUTER_RADIUS, 96]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.75}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// LidSpeculum — open-wire eyelid speculum (two curved blades)
// ---------------------------------------------------------------------------

const SPECULUM_RADIUS = SKIN_INNER_RADIUS + 1.8;
const SPECULUM_Z = EYEBALL_RADIUS * 0.78; // held slightly forward of the skin, toward the surgeon
const SPECULUM_ARC = 2.05; // ~117°, a wide lid-margin sweep
const SPECULUM_TUBE = 0.22;

function SpeculumBlade({ top }: { top: boolean }) {
  const geometry = useMemo(() => {
    const geo = new THREE.TorusGeometry(SPECULUM_RADIUS, SPECULUM_TUBE, 8, 48, SPECULUM_ARC);
    geo.translate(0, 0, SPECULUM_Z);
    return geo;
  }, []);

  // Center the arc on "up" (+Y, top lid) or "down" (-Y, bottom lid).
  const centerAngle = top ? Math.PI / 2 : -Math.PI / 2;
  const rotationZ = centerAngle - SPECULUM_ARC / 2;

  // Small foot discs at each end of the blade, representing where the wire
  // tucks under the lid margin into the fornix. These are positioned in the
  // blade's own rotated local space, so local angle 0 and SPECULUM_ARC give
  // the two endpoints directly (no need to re-add rotationZ here).
  const footLocal = (localAngle: number): [number, number, number] => [
    Math.cos(localAngle) * SPECULUM_RADIUS,
    Math.sin(localAngle) * SPECULUM_RADIUS,
    SPECULUM_Z,
  ];

  return (
    <group rotation={[0, 0, rotationZ]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#d4d8dc" metalness={0.9} roughness={0.22} />
      </mesh>
      {[0, SPECULUM_ARC].map((localAngle, i) => (
        <mesh key={i} position={footLocal(localAngle)}>
          <sphereGeometry args={[SPECULUM_TUBE * 1.3, 10, 10]} />
          <meshStandardMaterial color="#c8ccd0" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

export function LidSpeculum() {
  return (
    <>
      <SpeculumBlade top />
      <SpeculumBlade top={false} />
    </>
  );
}

// ---------------------------------------------------------------------------
// SurgicalDrape — sterile fenestrated drape covering the surrounding field
// ---------------------------------------------------------------------------

const DRAPE_INNER_RADIUS = SKIN_OUTER_RADIUS;
const DRAPE_OUTER_RADIUS = 95;
const DRAPE_Z = EYEBALL_RADIUS * 0.30;

function createDrapeTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const rawCtx = canvas.getContext('2d');
  if (!rawCtx) return new THREE.CanvasTexture(canvas);
  const ctx: CanvasRenderingContext2D = rawCtx;

  const rng = createRng(19);

  // Radial bands (v: 0 = inner edge near skin, 1 = outer edge):
  //  0.00–0.06  adhesive aperture border (off-white)
  //  0.06–0.16  iodine/povidone prep tint (amber-brown, fading out)
  //  0.16–1.00  sterile fabric (blue-teal) with woven texture
  const adhesiveEnd = 0.06 * h;
  const iodineEnd = 0.18 * h;

  ctx.fillStyle = '#e8e2d4';
  ctx.fillRect(0, 0, w, adhesiveEnd);

  const iodineGrad = ctx.createLinearGradient(0, adhesiveEnd, 0, iodineEnd);
  iodineGrad.addColorStop(0, '#c98a45');
  iodineGrad.addColorStop(1, '#8a6a4a');
  ctx.fillStyle = iodineGrad;
  ctx.fillRect(0, adhesiveEnd, w, iodineEnd - adhesiveEnd);

  const fabricGrad = ctx.createLinearGradient(0, iodineEnd, 0, h);
  fabricGrad.addColorStop(0, '#1f5f66');
  fabricGrad.addColorStop(0.5, '#184a52');
  fabricGrad.addColorStop(1, '#123840');
  ctx.fillStyle = fabricGrad;
  ctx.fillRect(0, iodineEnd, w, h - iodineEnd);

  // Woven fabric cross-hatch texture
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, iodineEnd);
    ctx.lineTo(x + 40, h);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  for (let y = iodineEnd; y < h; y += 5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + 2);
    ctx.stroke();
  }

  // Occasional subtle fold shadows
  for (let i = 0; i < 14; i++) {
    const x = rng() * w;
    const width = 20 + rng() * 60;
    const grad2 = ctx.createLinearGradient(x, 0, x + width, 0);
    grad2.addColorStop(0, 'rgba(0,0,0,0)');
    grad2.addColorStop(0.5, `rgba(0,0,0,${0.08 + rng() * 0.08})`);
    grad2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(x, iodineEnd, width, h - iodineEnd);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function SurgicalDrape() {
  const texture = useMemo(() => createDrapeTexture(), []);
  return (
    <mesh position={[0, 0, DRAPE_Z]}>
      <ringGeometry args={[DRAPE_INNER_RADIUS, DRAPE_OUTER_RADIUS, 96]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.9}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Convenience wrapper mounting all three layers in correct back-to-front order. */
export function SurgicalField() {
  return (
    <>
      <SurgicalDrape />
      <PeriocularSkin />
      <LidSpeculum />
    </>
  );
}
