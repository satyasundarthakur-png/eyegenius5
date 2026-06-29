import { Instrument } from '../Instrument';
import type { InstrumentConfig, TipGeometryDescriptor } from '../types/instrument';

/**
 * Vitrector
 * Pneumatic cutter/aspirator probe used for pars plana vitrectomy (PPV) —
 * removes vitreous gel and prepares for membrane peeling, laser, or
 * fluid-air exchange. Deeper working range than anterior-segment tools
 * since it enters through the pars plana, not the limbal incision.
 */
export class Vitrector extends Instrument {
  constructor() {
    const config: InstrumentConfig = {
      type: 'vitrector',
      name: 'Vitrector',
      usesRCM: true,
      maxInsertionDepth: 11,
      maxTiltAngle: Math.PI / 3,
      tipLength: 5,
      color: '#5dade2', // steel blue
    };
    super(config);
  }

  getDisplayName(): string {
    return 'Vitrector';
  }

  getTipGeometry(): TipGeometryDescriptor {
    return { type: 'vitrector', diameter: 0.6, length: 5, portLength: 1.2 };
  }
}
