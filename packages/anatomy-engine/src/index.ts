/**
 * @openeyesim/anatomy-engine
 * Layered ophthalmic anatomy model for microsurgery simulation.
 * Provides geometrically accurate, physically plausible eye layers
 * with support for deformation, cutting, and hit-testing.
 */

export * from '../types/anatomy';
export * from './EyeAnatomy';

// Re-export key layer classes as they are implemented in later steps
export { CorneaLayer } from './layers/CorneaLayer';
export { ScleraLayer } from './layers/ScleraLayer';
export { IrisLayer } from './layers/IrisLayer';
export { LensCapsuleLayer } from './layers/LensCapsuleLayer';
export { NucleusLayer } from './layers/NucleusLayer';
// ... additional layers (zonules, vitreous, retina, etc.) added incrementally
