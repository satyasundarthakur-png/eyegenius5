import { Instrument } from '../Instrument';
import type { InstrumentConfig, TipGeometryDescriptor } from '../types/instrument';

/**
 * Irrigation / Aspiration (I/A) Handpiece
 * Used for cortex removal and polishing.
 */
export class IrrigationAspiration extends Instrument {
  constructor() {
    const config: InstrumentConfig = {
      type: 'irrigation_aspiration',
      name: 'I/A Handpiece',
      usesRCM: true,
      maxInsertionDepth: 8,
      maxTiltAngle: Math.PI / 3,
      tipLength: 5.0,
      color: '#b8c4ce',
    };
    super(config);
  }

  getDisplayName(): string {
    return 'Irrigation/Aspiration Handpiece';
  }

  getTipGeometry(): TipGeometryDescriptor {
    return { type: 'ia', diameter: 0.7, length: 5.0 };
  }
}
