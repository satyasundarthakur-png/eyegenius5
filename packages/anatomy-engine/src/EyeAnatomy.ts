import type { EyeAnatomyState, LayerId, AnatomicalLayer, Vec3 } from '../types/anatomy';
import * as THREE from 'three';

/**
 * OpenEyeSim AI — Layered Ophthalmic Anatomy Engine (Step 2)
 *
 * This class is the authoritative model for the eye's anatomical structure.
 * It provides:
 * - Layer definitions with realistic ophthalmic parameters (thickness, elasticity, cuttability)
 * - Geometry factories for high-fidelity Three.js meshes
 * - Hit-testing foundation for instruments & physics (Step 5+)
 * - Deformation state ready for biomechanics integration
 *
 * In Step 2 we focus on data model + renderable geometries for cornea, sclera, iris, lens (capsule + nucleus).
 * Existing simple sphere rendering in src/components/eyeball/* continues to work in parallel.
 */

export type LayerMaterialParams = Record<string, number | string | boolean>;

export interface LayerRenderData {
  layer: AnatomicalLayer;
  geometry: THREE.BufferGeometry;
  materialParams: LayerMaterialParams;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export class EyeAnatomy {
  private state: EyeAnatomyState;
  private layerMap: Map<LayerId, AnatomicalLayer>;

  constructor(eyeballRadius = 12) {
    const layers = this.createDefaultLayers(eyeballRadius);
    this.layerMap = new Map(layers.map(l => [l.id as LayerId, l]));

    this.state = {
      layers,
      deformations: {},
      incisions: [],
      eyeballRadius,
    };
  }

  private createDefaultLayers(radius: number): AnatomicalLayer[] {
    return [
      {
        id: 'sclera',
        name: 'Sclera',
        thickness: 0.8,
        elasticity: 1200, // kPa — stiff outer shell
        opacity: 1.0,
        cuttable: false,
        color: '#f4e9d8',
        radius,
      },
      {
        id: 'cornea',
        name: 'Cornea',
        thickness: 0.55,
        elasticity: 450,
        opacity: 0.25,
        cuttable: true,
        color: '#d4f0ff',
        radius: 8.0,           // smaller protruding cap
        zOffset: 6.0,          // protrusion along +z
      },
      {
        id: 'limbus',
        name: 'Limbus (Corneal-Scleral Junction)',
        thickness: 1.2,
        elasticity: 800,
        opacity: 0.9,
        cuttable: true,
        color: '#c8b89e',
        radius,
      },
      {
        id: 'iris',
        name: 'Iris',
        thickness: 0.4,
        elasticity: 60,
        opacity: 0.95,
        cuttable: true,
        color: '#4a3f2f',      // brown base; can be parameterized later
        radius: 6.5,
        pupilRadius: 2.2,      // dynamic in future steps
      },
      {
        id: 'anterior-chamber',
        name: 'Anterior Chamber (Aqueous Humor)',
        thickness: 3.2,
        elasticity: 0.1,       // fluid-like
        opacity: 0.05,
        cuttable: false,
        color: '#e0f7ff',
        radius: 7.5,
      },
      {
        id: 'lens-capsule',
        name: 'Lens Capsule',
        thickness: 0.02,
        elasticity: 350,
        opacity: 0.6,
        cuttable: true,
        color: '#f0f8ff',
        radius: 5.0,
      },
      {
        id: 'cortex',
        name: 'Lens Cortex',
        thickness: 1.8,
        elasticity: 80,
        opacity: 0.7,
        cuttable: true,
        color: '#f8f0e8',
        radius: 4.8,
      },
      {
        id: 'nucleus',
        name: 'Lens Nucleus',
        thickness: 3.5,
        elasticity: 120,
        opacity: 0.85,
        cuttable: true,
        color: '#e8d8c0',
        radius: 3.2,
      },
      {
        id: 'zonules',
        name: 'Zonular Fibers',
        thickness: 0.1,
        elasticity: 200,
        opacity: 0.4,
        cuttable: true,
        color: '#d0c8b8',
        radius: 5.5,
      },
      {
        id: 'vitreous',
        name: 'Vitreous Humor',
        thickness: 16.0,
        elasticity: 0.05,
        opacity: 0.08,
        cuttable: false,
        color: '#f0f4ff',
        radius: radius * 0.92,
      },
      {
        id: 'retina',
        name: 'Retina',
        thickness: 0.25,
        elasticity: 40,
        opacity: 0.6,
        cuttable: false,
        color: '#c04040',
        radius: radius * 0.95,
      },
    ];
  }

  getState(): EyeAnatomyState {
    return this.state;
  }

  getLayer(id: LayerId): AnatomicalLayer | undefined {
    return this.layerMap.get(id);
  }

  getAllLayers(): AnatomicalLayer[] {
    return this.state.layers;
  }

  /**
   * Generate render-ready data for a specific layer.
   * Used by React components in Step 2+.
   */
  getLayerRenderData(id: LayerId): LayerRenderData | null {
    const layer = this.getLayer(id);
    if (!layer) return null;

    let geometry: THREE.BufferGeometry;
    const materialParams: LayerMaterialParams = {
      color: layer.color ?? '#ffffff',
      transparent: layer.opacity < 0.95,
      opacity: layer.opacity,
      side: THREE.DoubleSide,
    };

    switch (id) {
      case 'sclera':
        geometry = new THREE.SphereGeometry(layer.radius, 64, 64);
        materialParams.roughness = 0.3;
        materialParams.metalness = 0.05;
        materialParams.clearcoat = 0.5;
        break;

      case 'cornea':
        geometry = new THREE.SphereGeometry(layer.radius || 8, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.65);
        materialParams.transparent = true;
        materialParams.transmission = 0.85;
        materialParams.thickness = 0.8;
        materialParams.roughness = 0.1;
        materialParams.metalness = 0.0;
        materialParams.clearcoat = 0.9;
        materialParams.clearcoatRoughness = 0.05;
        break;

      case 'iris':
        // Torus-like iris with pupil hole (simplified as ring)
        geometry = new THREE.RingGeometry(
          layer.pupilRadius ?? 2.0,
          layer.radius || 6.0,
          64
        );
        materialParams.side = THREE.DoubleSide;
        materialParams.roughness = 0.6;
        break;

      case 'lens-capsule':
      case 'cortex':
      case 'nucleus': {
        // Biconvex lens approximation using scaled sphere
        const r = layer.radius || 4.5;
        geometry = new THREE.SphereGeometry(r, 32, 32);
        geometry.scale(1, 1, 0.65); // flatten for biconvex shape
        materialParams.transparent = true;
        materialParams.roughness = 0.15;
        materialParams.metalness = 0.1;
        materialParams.clearcoat = 0.8;
        break;
      }

      case 'retina':
        geometry = new THREE.SphereGeometry(layer.radius || 11.4, 48, 48);
        materialParams.side = THREE.BackSide;
        materialParams.roughness = 0.8;
        break;

      default:
        geometry = new THREE.SphereGeometry(layer.radius || this.state.eyeballRadius, 32, 32);
    }

    return {
      layer,
      geometry,
      materialParams,
    };
  }

  /**
   * Ray-layer intersection against the layer's spherical approximation.
   * Each anatomical layer is modeled as (at minimum) a sphere of a given radius
   * centered at the eye origin; this is sufficient for hit-testing instruments
   * and needles against any layer (sclera, cornea, lens capsule, etc.) and is
   * consumed by physics-engine for collision/penetration detection.
   */
  intersectLayer(rayOrigin: Vec3, rayDirection: Vec3, layerId: LayerId): { point: Vec3; normal: Vec3; distance: number } | null {
    const layer = this.layerMap.get(layerId);
    if (!layer) return null;
    const radius = layer.radius ?? this.state.eyeballRadius;

    const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const length = (v: Vec3): number => Math.sqrt(dot(v, v));
    const norm = length(rayDirection);
    if (norm < 1e-9) return null;
    const dir: Vec3 = [rayDirection[0] / norm, rayDirection[1] / norm, rayDirection[2] / norm];

    // Sphere is centered at the eye origin (0,0,0) in local anatomy space.
    const a = dot(dir, dir);
    const b = 2 * dot(rayOrigin, dir);
    const c = dot(rayOrigin, rayOrigin) - radius * radius;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return null;

    const sqrtDisc = Math.sqrt(discriminant);
    const t1 = (-b - sqrtDisc) / (2 * a);
    const t2 = (-b + sqrtDisc) / (2 * a);
    const t = t1 > 1e-6 ? t1 : t2 > 1e-6 ? t2 : null;
    if (t === null) return null;

    const point: Vec3 = [
      rayOrigin[0] + t * dir[0],
      rayOrigin[1] + t * dir[1],
      rayOrigin[2] + t * dir[2],
    ];
    const normal: Vec3 = [point[0] / radius, point[1] / radius, point[2] / radius];

    return { point, normal, distance: t };
  }

  applyDeformation(layerId: LayerId, point: Vec3, force: Vec3, intensity = 1.0): void {
    // Deformation state will be consumed by physics-engine (Step 5) and TissueDeformation component.
    if (!(layerId in this.state.deformations)) {
      this.state.deformations[layerId] = [];
    }
    this.state.deformations[layerId].push([
      point[0] + force[0] * intensity * 0.1,
      point[1] + force[1] * intensity * 0.1,
      point[2] + force[2] * intensity * 0.1,
    ]);
  }

  addIncision(position: Vec3, depth: number, layerId: LayerId): void {
    this.state.incisions.push({ position, depth, layerId });
  }

  reset(): void {
    this.state.deformations = {};
    this.state.incisions = [];
  }
}

// Singleton instance for easy consumption in React components during Step 2
export const eyeAnatomy = new EyeAnatomy(12);
