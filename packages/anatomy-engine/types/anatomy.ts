export type Vec3 = [number, number, number]; // local copy for package independence (mirrors src/types)

export interface AnatomicalLayer {
  id: string;
  name: string;
  /** Thickness in mm (average) */
  thickness: number;
  /** Young's modulus approximation for elasticity (kPa) */
  elasticity: number;
  /** Visibility / opacity for rendering */
  opacity: number;
  /** Whether this layer can be cut / torn */
  cuttable: boolean;

  /** Optional rendering & geometric hints (used by EyeAnatomy.getLayerRenderData) */
  color?: string;
  radius?: number;
  zOffset?: number;
  pupilRadius?: number;
}

export interface EyeLayerMesh {
  layer: AnatomicalLayer;
  /** Three.js compatible geometry data or ref */
  geometryRef?: unknown;
  /** Material parameters */
  materialParams: Record<string, unknown>;
}

export interface EyeAnatomyState {
  layers: AnatomicalLayer[];
  /** Deformation state per layer (for physics integration) */
  deformations: Record<string, Vec3[]>;
  /** Active surgical site / incision locations */
  incisions: Array<{ position: Vec3; depth: number; layerId: string }>;
  eyeballRadius: number;
}

export type LayerId =
  | 'cornea'
  | 'sclera'
  | 'limbus'
  | 'iris'
  | 'anterior-chamber'
  | 'lens-capsule'
  | 'cortex'
  | 'nucleus'
  | 'zonules'
  | 'vitreous'
  | 'retina';
