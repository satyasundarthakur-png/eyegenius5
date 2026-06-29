import { Instrument } from '../Instrument';
import type { InstrumentConfig, TipGeometryDescriptor } from '../types/instrument';

/**
 * Endolaser
 * Intraocular laser probe delivering photocoagulation to the retina —
 * used to seal retinal breaks and treat proliferative disease during
 * vitreoretinal surgery. Glowing tip indicates the firing fiber.
 */
export class Endolaser extends Instrument {
  constructor() {
    const config: InstrumentConfig = {
      type: 'endolaser',
      name: 'Endolaser',
      usesRCM: true,
      maxInsertionDepth: 11,
      maxTiltAngle: Math.PI / 3,
      tipLength: 5.5,
      color: '#f39c12', // amber probe body
    };
    super(config);
  }

  getDisplayName(): string {
    return 'Endolaser Probe';
  }

  getTipGeometry(): TipGeometryDescriptor {
    return { type: 'laser', diameter: 0.5, length: 5.5 };
  }
}
