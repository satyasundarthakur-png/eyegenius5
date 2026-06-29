/**
 * @openeyesim/microscope-engine
 * Virtual Operating Microscope for ophthalmic microsurgery simulation.
 *
 * Models key optical and illumination properties of a modern ophthalmic microscope
 * (e.g., Zeiss OPMI, Leica M844 style) used in cataract and vitreoretinal surgery.
 */

export interface MicroscopeState {
  // Optical parameters
  zoom: number;              // 1.0 = 1x (survey view), 6.0–25.0 typical surgical range
  focus: number;             // 0–1 normalized focus plane (0 = anterior cornea, 1 = posterior lens/vitreous)
  magnification: number;     // Derived effective magnification
  workingDistance: number;   // mm from objective to surgical plane

  // Illumination
  redReflexIntensity: number;   // 0–2 (critical for cataract visualization)
  coaxialIntensity: number;     // Main on-axis light (creates red reflex)
  obliqueIntensity: number;     // Side/oblique illumination for surface detail & shadows
  illuminationAngle: number;    // degrees for oblique light

  // Optics quality
  depthOfField: number;         // 0–1 (higher = shallower DOF, more "microscope-like")
  chromaticAberration: number;  // subtle color fringing (0 = off)

  enabled: boolean;
}

export const DEFAULT_MICROSCOPE_STATE: MicroscopeState = {
  zoom: 8.0,
  focus: 0.65,               // focused on lens plane by default (good for cataract view)
  magnification: 8.0,
  workingDistance: 180,

  redReflexIntensity: 1.2,
  coaxialIntensity: 1.3,
  obliqueIntensity: 1.0,
  illuminationAngle: 35,

  depthOfField: 0.75,
  chromaticAberration: 0.15,

  enabled: true,
};

export class Microscope {
  private state: MicroscopeState;

  constructor(initial?: Partial<MicroscopeState>) {
    this.state = { ...DEFAULT_MICROSCOPE_STATE, ...initial };
  }

  getState(): MicroscopeState {
    return { ...this.state };
  }

  setZoom(zoom: number) {
    this.state.zoom = Math.max(1, Math.min(25, zoom));
    this.state.magnification = this.state.zoom;
  }

  setFocus(focus: number) {
    this.state.focus = Math.max(0, Math.min(1, focus));
  }

  setRedReflexIntensity(intensity: number) {
    this.state.redReflexIntensity = Math.max(0, Math.min(3, intensity));
  }

  setCoaxialIntensity(intensity: number) {
    this.state.coaxialIntensity = Math.max(0, Math.min(4, intensity));
  }

  setObliqueIntensity(intensity: number) {
    this.state.obliqueIntensity = Math.max(0, Math.min(2, intensity));
  }

  setDepthOfField(dof: number) {
    this.state.depthOfField = Math.max(0.1, Math.min(1, dof));
  }

  setEnabled(enabled: boolean) {
    this.state.enabled = enabled;
  }

  /** Returns recommended focusDistance (in world units) for DepthOfField effect */
  getFocusDistance(): number {
    // Map normalized focus (0=cornea, 1=posterior) to world Z
    // Eye is roughly centered at origin, cornea at ~z=12, lens at ~z=4.5
    const corneaZ = 12;
    const posteriorZ = 2;
    return corneaZ - (corneaZ - posteriorZ) * this.state.focus;
  }

  /** Returns recommended focalLength / bokeh scale for DOF */
  getFocalLength(): number {
    // Higher zoom = shallower DOF feel
    return 15 + (this.state.zoom - 1) * 1.5;
  }

  /** Returns light intensity multipliers for the scene */
  getLightIntensities() {
    return {
      coaxial: this.state.coaxialIntensity * (this.state.enabled ? 1 : 0.3),
      oblique: this.state.obliqueIntensity * (this.state.enabled ? 1 : 0.5),
      redReflex: this.state.redReflexIntensity * (this.state.enabled ? 1 : 0),
      ambient: this.state.enabled ? 0.12 : 0.25,
    };
  }

  /** Position for coaxial (on-axis) light — usually very close to camera */
  getCoaxialLightPosition(): [number, number, number] {
    return [0, 0, 45]; // far along +z, aligned with view
  }

  reset() {
    this.state = { ...DEFAULT_MICROSCOPE_STATE };
  }
}

// Singleton for easy access during Step 3
export const microscope = new Microscope();
