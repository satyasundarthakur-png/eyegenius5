import { Instrument } from '../Instrument';
import type { InstrumentConfig, TipGeometryDescriptor } from '../types/instrument';

/**
 * Keratome (incision knife)
 * Used for creating the main corneal incision.
 * RCM-constrained like the original needle.
 */
export class Keratome extends Instrument {
  constructor() {
    const config: InstrumentConfig = {
      type: 'keratome',
      name: 'Keratome',
      usesRCM: true,
      maxInsertionDepth: 8,
      maxTiltAngle: Math.PI / 3,
      tipLength: 3.5,
      color: '#c0c0c0',
    };
    super(config);
  }

  getDisplayName(): string {
    return 'Keratome (Incision Knife)';
  }

  getTipGeometry(): TipGeometryDescriptor {
    // In a full implementation this would return a custom Blade geometry
    return { type: 'blade', width: 2.2, length: 3.5 };
  }
}
