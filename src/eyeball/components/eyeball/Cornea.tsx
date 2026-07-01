import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EYEBALL_RADIUS, COLORS } from "../../constants";
import { useSimulationStore } from "../../stores/simulationStore";
import { microscope } from "../../../../packages/microscope-engine/src/Microscope";

/**
 * Seeded PRNG for deterministic iris texture.
 */
function createIrisRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a procedural iris texture with radial fibers, crypts, and color gradient.
 *
 * Canvas layout (RingGeometry UV mapping):
 * - x-axis (u): angular direction around the iris (0 to 2π)
 * - y-axis (v): radial direction, inner pupil edge (top) to outer limbus edge (bottom)
 */
function createIrisTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 384;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) return new THREE.CanvasTexture(canvas);
  const ctx: CanvasRenderingContext2D = rawCtx;

  const rng = createIrisRng(123);

  const rgba = (r: number, g: number, b: number, a: number) =>
    "rgba(" + r.toFixed(0) + ", " + g.toFixed(0) + ", " + b.toFixed(0) + ", " + a.toFixed(3) + ")";

  // ── Base color: warm hazel-blue, with sectoral heterochromia patches ──────
  // Real irises are rarely a flat single hue — even predominantly blue eyes
  // commonly show warm amber/brown sectoral flecks radiating from the
  // collarette, especially near the pupil. v=0 (top) = pupil edge, v=1
  // (bottom) = limbus edge.
  for (let y = 0; y < height; y++) {
    const t = y / height;
    const r = 34 + t * 70;
    const g = 64 + t * 100;
    const b = 118 + t * 92;
    ctx.fillStyle = rgba(r, g, b, 1);
    ctx.fillRect(0, y, width, 1);
  }

  // Sectoral amber/brown heterochromia flecks — 3–5 wedge-shaped warm patches
  // radiating from near the pupil margin outward, common in real (even blue)
  // irises and one of the biggest cues that breaks the "flat CG disc" look.
  const sectorCount = 3 + Math.floor(rng() * 3);
  for (let s = 0; s < sectorCount; s++) {
    const angleU = rng() * width;
    const sectorWidth = width * (0.05 + rng() * 0.08);
    const grad = ctx.createLinearGradient(0, 0, 0, height * 0.7);
    grad.addColorStop(0, rgba(150, 100, 50, 0.0));
    grad.addColorStop(0.25, rgba(160, 110, 55, 0.35 + rng() * 0.2));
    grad.addColorStop(0.6, rgba(140, 95, 50, 0.12));
    grad.addColorStop(1, rgba(140, 95, 50, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(angleU, height * 0.18, sectorWidth, height * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Pupillary ruff — dark pigment frill right at the pupil margin ─────────
  const ruffGrad = ctx.createLinearGradient(0, 0, 0, height * 0.06);
  ruffGrad.addColorStop(0, rgba(10, 12, 22, 0.85));
  ruffGrad.addColorStop(1, rgba(10, 12, 22, 0));
  ctx.fillStyle = ruffGrad;
  ctx.fillRect(0, 0, width, height * 0.06);

  // ── Radial fibers (fine collagen trabeculae) ──────────────────────────────
  const fiberCount = 260;
  for (let i = 0; i < fiberCount; i++) {
    const x = (i / fiberCount) * width + (rng() - 0.5) * 4;
    const fiberWidth = 0.6 + rng() * 2.2;
    const fiberLength = height * (0.45 + rng() * 0.5);
    const startY = height * 0.05 + rng() * height * 0.08;

    const brightness = 0.6 + rng() * 0.7;
    const fr = (45 + rng() * 55) * brightness;
    const fg = (85 + rng() * 65) * brightness;
    const fb = (145 + rng() * 65) * brightness;
    const fAlpha = 0.12 + rng() * 0.28;

    ctx.beginPath();
    ctx.moveTo(x, startY);
    let cx = x;
    for (let step = 0; step < fiberLength; step += 3) {
      cx += (rng() - 0.5) * 1.1;
      ctx.lineTo(cx, startY + step);
    }
    ctx.strokeStyle = rgba(fr, fg, fb, fAlpha);
    ctx.lineWidth = fiberWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  // ── Collarette — a jagged/wavy ridge ~35–45% out from the pupil, NOT a
  // smooth gradient band. Drawn as a wandering zigzag line with per-angle
  // noise, which is what actually reads as "collarette" rather than a stripe. ──
  const collaretteBaseY = height * 0.4;
  const collaretteAmplitude = height * 0.045;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 4) {
    const wobble = (Math.sin(x * 0.045) + Math.sin(x * 0.11 + 3) * 0.5) * collaretteAmplitude;
    const y = collaretteBaseY + wobble + (rng() - 0.5) * 3;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = rgba(110, 150, 200, 0.28);
  ctx.lineWidth = 5;
  ctx.stroke();
  // Brighter highlight just outside the jagged line (ciliary-zone side)
  ctx.beginPath();
  for (let x = 0; x <= width; x += 4) {
    const wobble = (Math.sin(x * 0.045) + Math.sin(x * 0.11 + 3) * 0.5) * collaretteAmplitude;
    const y = collaretteBaseY + wobble + height * 0.025;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = rgba(150, 185, 225, 0.18);
  ctx.lineWidth = 8;
  ctx.stroke();

  // ── Contraction furrows — faint concentric arcs in the outer (ciliary) zone ──
  const furrowCount = 5;
  for (let i = 0; i < furrowCount; i++) {
    const y = height * (0.55 + (i / furrowCount) * 0.4) + (rng() - 0.5) * 6;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 6) {
      const wobble = Math.sin(x * 0.02 + i) * 3 + (rng() - 0.5) * 2;
      if (x === 0) ctx.moveTo(x, y + wobble);
      else ctx.lineTo(x, y + wobble);
    }
    ctx.strokeStyle = rgba(20, 35, 65, 0.08 + rng() * 0.06);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ── Crypts — irregular dark patches, denser in the ciliary zone ──────────
  const cryptCount = 70;
  for (let i = 0; i < cryptCount; i++) {
    const cx = rng() * width;
    const cy = height * 0.18 + rng() * height * 0.7;
    const cr = 1.5 + rng() * 6;

    const cryptGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    cryptGrad.addColorStop(0, rgba(12, 20, 42, 0.45));
    cryptGrad.addColorStop(0.6, rgba(18, 30, 58, 0.2));
    cryptGrad.addColorStop(1, rgba(28, 45, 85, 0));
    ctx.fillStyle = cryptGrad;
    ctx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
  }

  // ── Fine stippled noise across the whole surface (breaks up flatness) ────
  for (let i = 0; i < 600; i++) {
    const x = rng() * width;
    const y = height * 0.05 + rng() * height * 0.9;
    const len = 2 + rng() * 7;
    ctx.strokeStyle = rgba(30 + rng() * 50, 60 + rng() * 50, 120 + rng() * 50, 0.06 + rng() * 0.1);
    ctx.lineWidth = 0.4 + rng() * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rng() - 0.5) * 2, y + len);
    ctx.stroke();
  }

  // ── Soften the whole surface with a light blur pass ───────────────────────
  // At extreme close zoom (full-screen macro view, as used in surgical
  // close-ups) the crisp radial fiber lines drawn above can read as harsh
  // banded "venetian blind" streaks rather than organic tissue texture.
  // Compositing through a blurred offscreen pass keeps the underlying detail
  // (collarette, crypts, heterochromia) while smoothing fiber edges.
  const blurCanvas = document.createElement("canvas");
  blurCanvas.width = width;
  blurCanvas.height = height;
  const blurCtx = blurCanvas.getContext("2d");
  if (blurCtx) {
    blurCtx.filter = "blur(1.4px)";
    blurCtx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.filter = "none";
    ctx.drawImage(blurCanvas, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Cornea: transparent spherical cap covering the front of the eyeball.
 *
 * The cornea dome is modeled as a spherical cap (r=5mm, 60° arc)
 * centered at z = eyeball_radius - 5 = 7mm. Its front pole touches
 * the eyeball surface at z=12mm and protrudes ~2mm forward.
 *
 * Rendered BEFORE the iris so the iris shows through the transparent dome.
 */
const CORNEA_RADIUS_CURVATURE = 5;
const CORNEA_CENTER_Z = EYEBALL_RADIUS - CORNEA_RADIUS_CURVATURE;
const CORNEA_CAP_ANGLE = Math.PI / 3; // 60°

// Pre-computed limbus values
const LIMBUS_Z = CORNEA_CENTER_Z + CORNEA_RADIUS_CURVATURE * Math.cos(CORNEA_CAP_ANGLE);
const CORNEA_EDGE_RADIUS = CORNEA_RADIUS_CURVATURE * Math.sin(CORNEA_CAP_ANGLE);
const EYEBALL_WIDTH_AT_LIMBUS = Math.sqrt(EYEBALL_RADIUS * EYEBALL_RADIUS - LIMBUS_Z * LIMBUS_Z);
export const LIMBUS_RADIUS = (CORNEA_EDGE_RADIUS + EYEBALL_WIDTH_AT_LIMBUS) / 2;

export function Cornea() {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(
      CORNEA_RADIUS_CURVATURE,
      64,
      32,
      0,
      Math.PI * 2,
      0,
      CORNEA_CAP_ANGLE,
    );
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, 0, CORNEA_CENTER_Z]}>
      <meshPhysicalMaterial
        color="#f8fcff"
        transparent
        opacity={0.18}
        roughness={0.008}
        metalness={0.0}
        clearcoat={1.0}
        clearcoatRoughness={0.008}
        transmission={0.97}
        thickness={3.5}
        attenuationColor={new THREE.Color("#f0f8ff")}
        attenuationDistance={15.0}
        side={THREE.DoubleSide}
        ior={1.376}
        envMapIntensity={2.0}
      />
    </mesh>
  );
}

/**
 * CorneaCatchlight — the bright specular reflection of the coaxial microscope
 * light on the corneal surface (a "Purkinje image"). Every real macro/surgical
 * eye photo shows this; without it, a perfectly diffuse, shadowless cornea is
 * one of the strongest cues that breaks the "real eye" illusion and makes the
 * globe read as a flat painted ball instead of a wet, curved, reflective surface.
 *
 * Modeled as a small soft radial-gradient sprite positioned on the corneal
 * surface using the actual spherical-cap geometry (offset superior-nasally,
 * the conventional position for an overhead coaxial light source).
 */
function createCatchlightTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  grad.addColorStop(0.35, "rgba(255, 255, 255, 0.55)");
  grad.addColorStop(0.7, "rgba(255, 255, 255, 0.12)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function CorneaCatchlight() {
  const texture = useMemo(() => createCatchlightTexture(), []);

  // Superior-nasal offset from the corneal apex — the conventional position
  // for an overhead coaxial microscope light's reflection.
  const offsetX = -1.6;
  const offsetY = 1.9;
  const r = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
  const z =
    CORNEA_CENTER_Z +
    Math.sqrt(Math.max(0, CORNEA_RADIUS_CURVATURE * CORNEA_RADIUS_CURVATURE - r * r)) +
    0.05; // tiny epsilon forward so it never z-fights the cornea surface

  return (
    <mesh position={[offsetX, offsetY, z]}>
      <planeGeometry args={[2.6, 2.6]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/**
 * Iris: the colored ring at the front of the eye, just behind the cornea surface.
 * Positioned at z = 11.5 (inside the eyeball), facing +Z.
 *
 * The pupil (inner circle) dynamically scales based on needle insertion depth,
 * simulating a surgical response (deeper insertion → larger pupil).
 */
/**
 * Iris — coloured ring + dilated pupil.
 *
 * Key fix: the iris ring inner radius and the pupil disc radius are driven
 * from the SAME computed value each frame, so there is never a dark gap
 * ring or overlap between them regardless of dilation state. Previously
 * the iris ringGeometry had a fixed inner hole (35% of outer) while the
 * pupil disc scaled independently — at full mydriasis (88% of outer)
 * the disc was 2.1× its base size but the iris hole stayed at 35%, leaving
 * a visually prominent dark annular mismatch.
 *
 * Solution: iris ring = BufferGeometry rebuilt each frame to match the
 * current pupil radius. Pupil disc geometry is also sized from the same
 * computed radius. Both are pixel-perfect aligned at every dilation state.
 *
 * Dilation starts at 1 (fully mydriatic) — the eye is already draped and
 * prepped, so there is no animation from small.
 */
export function Iris() {
  const IRIS_OUTER_RADIUS = EYEBALL_RADIUS * 0.38;
  // Surgical mydriasis: pupil ~7-8 mm on a 24 mm (12 mm radius) globe
  // = 7.5/12 = 0.625 of the eyeball radius, which is 0.625/0.38 ≈ 0.86 of iris outer.
  // Use 0.86 so the iris ring is a narrow coloured annulus, not a thick band.
  const PUPIL_RADIUS = IRIS_OUTER_RADIUS * 0.86;
  const IRIS_Z = EYEBALL_RADIUS - 0.5;

  const irisRingRef = useRef<THREE.Mesh>(null);
  const pupilMeshRef = useRef<THREE.Mesh>(null);
  const pupilMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const irisTexture = useMemo(() => createIrisTexture(), []);

  // Pre-build geometries sized to the final dilated state — no animation needed.
  const irisRingGeometry = useMemo(
    () => new THREE.RingGeometry(PUPIL_RADIUS, IRIS_OUTER_RADIUS, 128),
    [],
  );
  const pupilGeometry = useMemo(() => new THREE.CircleGeometry(PUPIL_RADIUS, 96), []);

  useFrame(() => {
    if (!pupilMatRef.current) return;
    // Red-reflex glow through the transparent pupil, driven by microscope coaxial
    const rrIntensity = microscope.getLightIntensities().redReflex;
    const glow = Math.max(0, rrIntensity - 0.15) * 0.6;
    pupilMatRef.current.emissiveIntensity = glow;
    pupilMatRef.current.opacity = Math.max(0.45, 0.9 - glow * 0.55);
    pupilMatRef.current.needsUpdate = true;
  });

  return (
    <>
      {/* Iris ring — narrow coloured annulus between pupil edge and limbus */}
      <mesh ref={irisRingRef} geometry={irisRingGeometry} position={[0, 0, IRIS_Z]}>
        <meshPhysicalMaterial
          map={irisTexture}
          emissive={COLORS.iris}
          emissiveIntensity={0.02}
          side={THREE.DoubleSide}
          roughness={0.4}
          metalness={0.03}
          transmission={0.1}
          thickness={0.6}
          attenuationColor={new THREE.Color("#3a70b0")}
          attenuationDistance={2.0}
          clearcoat={0.25}
          clearcoatRoughness={0.25}
          envMapIntensity={0.5}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Pupil disc — dark, semi-transparent to show red-reflex fundal glow.
          Sized to PUPIL_RADIUS, exactly matching the iris ring inner hole. */}
      <mesh ref={pupilMeshRef} geometry={pupilGeometry} position={[0, 0, IRIS_Z - 0.02]}>
        <meshPhysicalMaterial
          ref={pupilMatRef}
          color="#04040e"
          emissive={new THREE.Color("#bb1f00")}
          emissiveIntensity={0}
          transparent
          opacity={0.9}
          roughness={0.8}
          metalness={0.0}
          transmission={0.14}
          thickness={1.2}
          clearcoat={0.5}
          clearcoatRoughness={0.15}
          side={THREE.DoubleSide}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/**
 * Limbus: the ring where the clear cornea meets the white sclera.
 */
/**
 * Limbus: the transition zone between the clear cornea and the white sclera.
 * Uses a wider, softer torus to create a gradual blend rather than a hard edge.
 */
export function LimbusRing() {
  const geometry = useMemo(() => {
    const geo = new THREE.TorusGeometry(LIMBUS_RADIUS, 0.35, 24, 64);
    geo.translate(0, 0, LIMBUS_Z);
    return geo;
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color={COLORS.limbus}
        emissive={COLORS.limbus}
        emissiveIntensity={0.08}
        transparent
        opacity={0.6}
        roughness={0.25}
        metalness={0.05}
        clearcoat={0.5}
        clearcoatRoughness={0.15}
        transmission={0.2}
        thickness={1.0}
        attenuationColor={new THREE.Color("#c0d8ee")}
        attenuationDistance={4.0}
        envMapIntensity={0.8}
        depthWrite={false}
      />
    </mesh>
  );
}

export { LIMBUS_Z };

/**
 * CapsulorhexisGuide — pulsing CCC target ring.
 * Visible ONLY when procedure=cataract, procedureStarted=true,
 * currentCurriculumStep='capsulorhexis'. Zero cost when hidden.
 */
const RHEXIS_RADIUS = EYEBALL_RADIUS * 0.205; // ≈ 5.5 mm

export function CapsulorhexisGuide() {
  const currentStep = useSimulationStore((s) => s.currentCurriculumStep);
  const procedureStarted = useSimulationStore((s) => s.procedureStarted);
  const selectedProc = useSimulationStore((s) => s.selectedProcedure);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const visible =
    selectedProc === "cataract" && procedureStarted && currentStep === "capsulorhexis";

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    if (!visible) {
      matRef.current.opacity = 0;
      return;
    }
    matRef.current.opacity = 0.38 + Math.sin(clock.elapsedTime * 2.8) * 0.12;
  });

  const geometry = useMemo(() => new THREE.TorusGeometry(RHEXIS_RADIUS, 0.08, 12, 96), []);

  return (
    <mesh geometry={geometry} position={[0, 0, 5.5]}>
      <meshBasicMaterial
        ref={matRef}
        color="#ffe8a0"
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * AqueousHumour — subtle animated shimmer in the anterior chamber.
 *
 * The anterior chamber (between cornea and iris) is filled with a clear
 * fluid (aqueous humour). Under the surgical microscope this reads as a
 * faint liquid "depth" behind the corneal dome, distinct from the iris
 * surface sitting further back. Modelled as a very thin, animated disc
 * just inside the corneal cap with a slow ripple effect on emissive
 * intensity — enough to break the "flat painted circle" look of the
 * cornea/iris stack without drawing attention to itself.
 */
export function AqueousHumour() {
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = clock.elapsedTime;
    // Very slow, low-amplitude shimmer — liquid depth cue, not a spotlight
    matRef.current.emissiveIntensity =
      0.018 + Math.sin(t * 0.4) * 0.008 + Math.sin(t * 0.7 + 1.2) * 0.005;
  });

  const geo = useMemo(() => new THREE.CircleGeometry(LIMBUS_RADIUS * 0.95, 80), []);

  return (
    <mesh geometry={geo} position={[0, 0, EYEBALL_RADIUS - 2.8]}>
      <meshPhysicalMaterial
        ref={matRef}
        color="#b8d8f0"
        emissive={new THREE.Color("#88b8e0")}
        emissiveIntensity={0.018}
        transparent
        opacity={0.08}
        roughness={0.0}
        metalness={0}
        transmission={0.92}
        thickness={2.0}
        clearcoat={1.0}
        clearcoatRoughness={0.0}
        depthWrite={false}
      />
    </mesh>
  );
}
