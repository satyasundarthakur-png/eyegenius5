import * as THREE from "three";
import { useMemo } from "react";
import { EYEBALL_RADIUS } from "../../constants";
import { LIMBUS_RADIUS } from "./Cornea";
import { useSimulationStore } from "../../stores/simulationStore";

/**
 * SurgicalField — periocular anatomy and sterile drape for a draped
 * cataract surgical eye. No speculum/retractor rendered — the lids
 * are simply retracted out of frame as in a typical top-down microscope
 * view (the operative field as the surgeon sees it, not the patient's face).
 *
 * Layers, working outward from the limbus:
 *
 *  1. LimbalConjunctiva — the pink-red vascular ring at the corneoscleral
 *     junction. This is the most important missing anatomy in the old render:
 *     without it the cornea-to-sclera boundary reads as a hard painted edge.
 *     In life it's a soft, slightly congested, pinkish translucent tissue.
 *
 *  2. EpiscleroConjunctiva — the thin bulbar conjunctiva over the visible
 *     anterior sclera, with a few episcleral vessels running toward the limbus.
 *
 *  3. PeriocularSkin — a narrow skin ring at the fissure margin, with subtle
 *     skin texture and lash roots, transitioning smoothly to the drape.
 *
 *  4. SurgicalDrape — sterile fenestrated fabric. Teal-blue woven surface
 *     with iodine-prep amber tint at the adhesive aperture border.
 */

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32 — same implementation used across /eyeball)
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
// LimbalConjunctiva — pink-red vascular ring at the corneoscleral junction
// ---------------------------------------------------------------------------
const LIMBAL_INNER = LIMBUS_RADIUS - 0.5; // just inside the limbus
const LIMBAL_OUTER = LIMBUS_RADIUS + 2.2; // extends slightly onto sclera
const LIMBAL_Z = EYEBALL_RADIUS * 0.78;

function createLimbalTexture(): THREE.CanvasTexture {
  const w = 1024,
    h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) return new THREE.CanvasTexture(canvas);
  const ctx: CanvasRenderingContext2D = rawCtx;
  const rng = createRng(3);

  // Base: pink-red medially (inner edge, v=0) fading to pale pink (outer, v=1)
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#d07070"); // congested limbal arcade — red-pink
  grad.addColorStop(0.25, "#c86868");
  grad.addColorStop(0.55, "#d89090"); // dilated episcleral vessels
  grad.addColorStop(0.8, "#e8b8a8"); // pale conjunctiva
  grad.addColorStop(1, "#f0c8b0"); // blends to sclera
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Radial episcleral vessels running toward the limbus
  for (let i = 0; i < 28; i++) {
    const x = rng() * w;
    const vLen = h * (0.35 + rng() * 0.5);
    const startY = rng() * h * 0.15;
    ctx.strokeStyle = `rgba(160, 50, 55, ${0.25 + rng() * 0.3})`;
    ctx.lineWidth = 0.8 + rng() * 1.4;
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.quadraticCurveTo(
      x + (rng() - 0.5) * 8,
      startY + vLen * 0.5,
      x + (rng() - 0.5) * 5,
      startY + vLen,
    );
    ctx.stroke();
  }

  // Fine capillary loops at inner edge (limbal arcade)
  for (let i = 0; i < 40; i++) {
    const x = rng() * w;
    const y = rng() * h * 0.22;
    ctx.fillStyle = `rgba(180, 60, 55, ${0.18 + rng() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 1.5 + rng() * 2, 0.8 + rng(), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function LimbalConjunctiva() {
  const texture = useMemo(() => createLimbalTexture(), []);
  return (
    <mesh position={[0, 0, LIMBAL_Z]}>
      <ringGeometry args={[LIMBAL_INNER, LIMBAL_OUTER, 128]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.7}
        metalness={0}
        transparent
        opacity={0.88}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// EpiscleroConjunctiva — thin bulbar conjunctiva over visible anterior sclera
// ---------------------------------------------------------------------------
const EPICONJ_INNER = LIMBAL_OUTER;
const EPICONJ_OUTER = EPICONJ_INNER + 3.5;
const EPICONJ_Z = EYEBALL_RADIUS * 0.52;

function createEpiConjTexture(): THREE.CanvasTexture {
  const w = 1024,
    h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) return new THREE.CanvasTexture(canvas);
  const ctx: CanvasRenderingContext2D = rawCtx;
  const rng = createRng(17);

  // Base: very pale, slightly bluish-white — thin transparent tissue over sclera
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#e8d0c8"); // slight pink near limbus
  grad.addColorStop(0.4, "#f0e8e0");
  grad.addColorStop(1, "#f5f0ec");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Sparse episcleral vessel trunks
  for (let i = 0; i < 12; i++) {
    const x = rng() * w;
    const alpha = 0.12 + rng() * 0.18;
    ctx.strokeStyle = `rgba(185, 70, 65, ${alpha})`;
    ctx.lineWidth = 1.2 + rng() * 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x + (rng() - 0.5) * 15, h * 0.5, x + (rng() - 0.5) * 10, h);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function EpiscleroConjunctiva() {
  const texture = useMemo(() => createEpiConjTexture(), []);
  return (
    <mesh position={[0, 0, EPICONJ_Z]}>
      <ringGeometry args={[EPICONJ_INNER, EPICONJ_OUTER, 128]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.65}
        metalness={0}
        transparent
        opacity={0.72}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// PeriocularSkin — narrow skin ring at the palpebral fissure margin
// ---------------------------------------------------------------------------
const SKIN_INNER_RADIUS = EPICONJ_OUTER;
const SKIN_OUTER_RADIUS = SKIN_INNER_RADIUS + 4.0;
const SKIN_Z = EYEBALL_RADIUS * 0.38;

function createSkinTexture(mirror: boolean): THREE.CanvasTexture {
  const w = 1024,
    h = 192;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) return new THREE.CanvasTexture(canvas);
  const ctx: CanvasRenderingContext2D = rawCtx;
  const rng = createRng(7);

  // Skin tone: mucocutaneous lid margin (inner) → warm tan (outer)
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#c88070"); // mucocutaneous junction / lid margin
  grad.addColorStop(0.2, "#d8988a");
  grad.addColorStop(0.55, "#dfa890");
  grad.addColorStop(1, "#d8a888");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Skin texture noise
  for (let i = 0; i < 2500; i++) {
    const x = rng() * w,
      y = rng() * h;
    const r2 = 0.5 + rng() * 1.1;
    ctx.fillStyle = `rgba(${(110 + rng() * 40) | 0},${(65 + rng() * 30) | 0},${(55 + rng() * 30) | 0},${0.03 + rng() * 0.05})`;
    ctx.beginPath();
    ctx.arc(x, y, r2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine skin pore texture
  for (let i = 0; i < 400; i++) {
    const x = rng() * w,
      y = h * 0.2 + rng() * h * 0.75;
    ctx.fillStyle = `rgba(100,50,40,${0.03 + rng() * 0.04})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.8 + rng() * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Medial canthus — pinkish caruncle, side depends on OD/OS
  const cX = mirror ? w * 0.5 : w * 0.01;
  const cGrad = ctx.createRadialGradient(cX, 30, 2, cX, 30, 35);
  cGrad.addColorStop(0, "rgba(218,118,108,0.5)");
  cGrad.addColorStop(1, "rgba(218,118,108,0)");
  ctx.fillStyle = cGrad;
  ctx.fillRect(Math.max(0, cX - 35), 0, 70, h);

  // Lash stubs — inner edge only (v ≈ 0–0.15), in two angular bands (upper + lower lid)
  function drawLashes(uStart: number, uEnd: number) {
    const xs = uStart * w,
      xe = uEnd * w;
    for (let i = 0; i < 22; i++) {
      const x = xs + ((xe - xs) * i) / 22 + (rng() - 0.5) * 3;
      const y = 4 + rng() * 8;
      const len = 5 + rng() * 5;
      ctx.strokeStyle = `rgba(30,18,14,${0.45 + rng() * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rng() - 0.5) * 2, y + len);
      ctx.stroke();
    }
  }
  drawLashes(0.2, 0.36);
  drawLashes(0.7, 0.86);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function PeriocularSkin() {
  const eyeSide = useSimulationStore((s) => s.eyeSide);
  const texture = useMemo(() => createSkinTexture(eyeSide === "OS"), [eyeSide]);
  return (
    <mesh position={[0, 0, SKIN_Z]}>
      <ringGeometry args={[SKIN_INNER_RADIUS, SKIN_OUTER_RADIUS, 96]} />
      <meshStandardMaterial map={texture} roughness={0.82} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// SurgicalDrape — sterile fenestrated drape over the rest of the field
// ---------------------------------------------------------------------------
const DRAPE_INNER = SKIN_OUTER_RADIUS;
const DRAPE_OUTER = 95;
const DRAPE_Z = EYEBALL_RADIUS * 0.22;

function createDrapeTexture(): THREE.CanvasTexture {
  const w = 1024,
    h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) return new THREE.CanvasTexture(canvas);
  const ctx: CanvasRenderingContext2D = rawCtx;
  const rng = createRng(19);

  const adhesiveH = h * 0.05;
  const iodineH = h * 0.16;

  // Adhesive aperture border — off-white
  ctx.fillStyle = "#e8e2d4";
  ctx.fillRect(0, 0, w, adhesiveH);

  // Iodine prep tint
  const iGrad = ctx.createLinearGradient(0, adhesiveH, 0, iodineH);
  iGrad.addColorStop(0, "#c08040");
  iGrad.addColorStop(1, "#856040");
  ctx.fillStyle = iGrad;
  ctx.fillRect(0, adhesiveH, w, iodineH - adhesiveH);

  // Fabric base — surgical teal
  const fGrad = ctx.createLinearGradient(0, iodineH, 0, h);
  fGrad.addColorStop(0, "#1a5560");
  fGrad.addColorStop(0.5, "#154850");
  fGrad.addColorStop(1, "#103840");
  ctx.fillStyle = fGrad;
  ctx.fillRect(0, iodineH, w, h - iodineH);

  // Woven cross-hatch
  ctx.strokeStyle = "rgba(0,0,0,0.07)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 7) {
    ctx.beginPath();
    ctx.moveTo(x, iodineH);
    ctx.lineTo(x + 45, h);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.035)";
  for (let y = iodineH; y < h; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + 2);
    ctx.stroke();
  }

  // Fold shadows
  for (let i = 0; i < 10; i++) {
    const x = rng() * w;
    const fw = 25 + rng() * 70;
    const sg = ctx.createLinearGradient(x, 0, x + fw, 0);
    sg.addColorStop(0, "rgba(0,0,0,0)");
    sg.addColorStop(0.5, `rgba(0,0,0,${0.06 + rng() * 0.07})`);
    sg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(x, iodineH, fw, h - iodineH);
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
      <ringGeometry args={[DRAPE_INNER, DRAPE_OUTER, 96]} />
      <meshStandardMaterial map={texture} roughness={0.92} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

/**
 * SurgicalField — mounts all periocular layers in correct back-to-front order.
 * No speculum/retractor rendered: the operative view is the top-down
 * microscope perspective where lids are retracted out of frame.
 */
export function SurgicalField() {
  return (
    <>
      <SurgicalDrape />
      <PeriocularSkin />
      <EpiscleroConjunctiva />
      <LimbalConjunctiva />
    </>
  );
}
