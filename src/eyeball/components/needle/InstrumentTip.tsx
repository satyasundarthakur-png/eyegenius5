import { useMemo } from 'react';
import * as THREE from 'three';
import { useCollisionDetection } from '../../hooks/useCollisionDetection';
import { useInsertionForce } from '../../hooks/useInsertionForce';
import { CurvedNeedleTip } from './CurvedNeedleTip';
import { forceToColor } from '../../lib/forceColor';
import type { TipGeometryDescriptor } from '../../../../../packages/instrument-engine/src/types/instrument';

interface InstrumentTipProps {
  position: [number, number, number];
  descriptor: TipGeometryDescriptor | null;
  color: string;
}

/** Thin tapered wedge — keratome / side-port / crescent blade. */
function BladeTip({ width, length }: { width: number; length: number }) {
  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(width / 2, length, 3);
    geo.scale(0.18, 1, 1); // flatten into a thin blade cross-section
    geo.rotateX(Math.PI / 2); // point along +Z
    geo.rotateZ(Math.PI / 6); // slight bevel twist
    return geo;
  }, [width, length]);
  return <primitive object={geometry} attach="geometry" />;
}

/** Two converging prongs with a hinge — capsulorhexis / micro forceps. */
function ForcepsJaws({ jawLength, opening, color }: { jawLength: number; opening: number; color: string }) {
  const jawGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.035, 0.015, jawLength, 8);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, jawLength / 2);
    return geo;
  }, [jawLength]);

  const hingeGeometry = useMemo(() => new THREE.SphereGeometry(0.12, 12, 12), []);
  const halfOpen = opening * 0.05;

  return (
    <group>
      <mesh geometry={hingeGeometry}>
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh geometry={jawGeometry} rotation={[halfOpen, 0, 0]}>
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh geometry={jawGeometry} rotation={[-halfOpen, 0, 0]}>
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />
      </mesh>
    </group>
  );
}

/** Slim tube with a rounded irrigation port — hydrodissection cannula. */
function CannulaTip({ diameter, length, color }: { diameter: number; length: number; color: string }) {
  const tubeGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 12);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, length / 2);
    return geo;
  }, [diameter, length]);
  const tipBallGeometry = useMemo(() => new THREE.SphereGeometry(diameter / 2, 10, 10), [diameter]);

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh geometry={tipBallGeometry} position={[0, 0, length]}>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

/** Straight ultrasound tip with a small beveled point — phaco tip. */
function PhacoTipMesh({ diameter, length, color, tipColor, emissive }: {
  diameter: number; length: number; color: string; tipColor: THREE.Color; emissive: boolean;
}) {
  const shaftGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 14);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, length / 2);
    return geo;
  }, [diameter, length]);
  const bevelGeometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(diameter / 2, diameter * 1.2, 14);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, [diameter]);

  return (
    <group>
      <mesh geometry={shaftGeometry}>
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.08} />
      </mesh>
      <mesh geometry={bevelGeometry} position={[0, 0, length]}>
        <meshStandardMaterial
          color={tipColor}
          metalness={0.95}
          roughness={0.08}
          emissive={emissive ? '#ff3300' : tipColor}
          emissiveIntensity={emissive ? 0.5 : 0.1}
        />
      </mesh>
    </group>
  );
}

/** Thicker dual-bore tube — irrigation/aspiration handpiece. */
function IATip({ diameter, length, color }: { diameter: number; length: number; color: string }) {
  const tubeGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(diameter / 2, diameter / 2.3, length, 16);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, length / 2);
    return geo;
  }, [diameter, length]);
  const portGeometry = useMemo(() => new THREE.SphereGeometry(diameter * 0.22, 8, 8), [diameter]);

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Aspiration port indicator near the tip */}
      <mesh geometry={portGeometry} position={[diameter * 0.3, 0, length * 0.92]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Slim tube with a rectangular side-cutting port — pars plana vitrector. */
function VitrectorTip({ diameter, length, portLength, color }: {
  diameter: number; length: number; portLength: number; color: string;
}) {
  const tubeGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 14);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, length / 2);
    return geo;
  }, [diameter, length]);
  const portGeometry = useMemo(
    () => new THREE.BoxGeometry(diameter * 0.5, diameter * 0.35, portLength),
    [diameter, portLength]
  );
  const capGeometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(diameter / 2, diameter * 0.8, 14);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [diameter]);

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Side cutting port near the tip — the defining visual feature of a vitrector */}
      <mesh geometry={portGeometry} position={[diameter * 0.3, 0, length - portLength / 2 - diameter * 0.4]}>
        <meshStandardMaterial color="#0d0d0d" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh geometry={capGeometry} position={[0, 0, length]}>
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />
      </mesh>
    </group>
  );
}

/** Slim probe with a glowing fiber tip — intraocular endolaser. */
function LaserProbeTip({ diameter, length, color }: { diameter: number; length: number; color: string }) {
  const tubeGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 12);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, length / 2);
    return geo;
  }, [diameter, length]);
  const fiberGeometry = useMemo(() => new THREE.SphereGeometry(diameter / 2.5, 10, 10), [diameter]);

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Glowing fiber tip — indicates the laser-firing point */}
      <mesh geometry={fiberGeometry} position={[0, 0, length]}>
        <meshStandardMaterial color="#ff5533" emissive="#ff2200" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Wide tapered barrel — IOL injector cartridge nozzle. */
function InjectorTip({ barrelDiameter, length, color }: { barrelDiameter: number; length: number; color: string }) {
  const barrelGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(barrelDiameter / 2, barrelDiameter / 3.5, length, 18);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, length / 2);
    return geo;
  }, [barrelDiameter, length]);

  return (
    <mesh geometry={barrelGeometry}>
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} transparent opacity={0.9} />
    </mesh>
  );
}

/**
 * Renders a visually distinct tip for the currently selected instrument.
 * Falls back to the original curved needle tip when no instrument is
 * active (preserves the legacy single-needle RCM trainer visual exactly).
 */
export function InstrumentTip({ position, descriptor, color }: InstrumentTipProps) {
  const { isColliding } = useCollisionDetection();
  const force = useInsertionForce();
  const tipColor = forceToColor(force);

  if (!descriptor) {
    return <CurvedNeedleTip position={position} />;
  }

  let content: React.ReactNode;
  switch (descriptor.type) {
    case 'blade':
      content = (
        <mesh>
          <BladeTip width={descriptor.width} length={descriptor.length} />
          <meshStandardMaterial
            color={tipColor}
            metalness={0.92}
            roughness={0.08}
            emissive={isColliding ? '#ff3300' : tipColor}
            emissiveIntensity={isColliding ? 0.5 : 0.1}
          />
        </mesh>
      );
      break;
    case 'forceps':
      content = <ForcepsJaws jawLength={descriptor.jawLength} opening={descriptor.opening} color={color} />;
      break;
    case 'cannula':
      content = <CannulaTip diameter={descriptor.diameter} length={descriptor.length} color={color} />;
      break;
    case 'phaco':
      content = (
        <PhacoTipMesh
          diameter={descriptor.diameter}
          length={descriptor.length}
          color={color}
          tipColor={tipColor}
          emissive={isColliding}
        />
      );
      break;
    case 'ia':
      content = <IATip diameter={descriptor.diameter} length={descriptor.length} color={color} />;
      break;
    case 'injector':
      content = <InjectorTip barrelDiameter={descriptor.barrelDiameter} length={descriptor.length} color={color} />;
      break;
    case 'vitrector':
      content = (
        <VitrectorTip
          diameter={descriptor.diameter}
          length={descriptor.length}
          portLength={descriptor.portLength}
          color={color}
        />
      );
      break;
    case 'laser':
      content = <LaserProbeTip diameter={descriptor.diameter} length={descriptor.length} color={color} />;
      break;
  }

  return <group position={position}>{content}</group>;
}
