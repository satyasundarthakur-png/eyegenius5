export interface MicroscopeState {
  zoom: number;
  focus: number;
  magnification: number;
  workingDistance: number;

  redReflexIntensity: number;
  coaxialIntensity: number;
  obliqueIntensity: number;
  illuminationAngle: number;

  depthOfField: number;
  chromaticAberration: number;

  enabled: boolean;
}
