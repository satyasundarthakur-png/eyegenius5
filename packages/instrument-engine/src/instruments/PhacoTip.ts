import { Instrument } from '../Instrument';
import type { InstrumentConfig, TipGeometryDescriptor } from '../types/instrument';

/**
 * Phacoemulsification Tip
 * Ultrasound handpiece tip for lens fragmentation and aspiration.
 * Can be RCM or freehand depending on technique.
 */
export class PhacoTip extends Instrument {
  constructor() {
    const config: InstrumentConfig = {
      type: 'phaco_tip',
      name: 'Phaco Tip',
      usesRCM: true, // still benefits from RCM in many techniques
      maxInsertionDepth: 7,
      maxTiltAngle: Math.PI / 3.5,
      tipLength: 4.5,
      color: '#d4af37', // gold-ish for phaco tip
    };
    super(config);
  }

  getDisplayName(): string {
    return 'Phacoemulsification Tip';
  }

  getTipGeometry(): TipGeometryDescriptor {
    return { type: 'phaco', diameter: 0.9, length: 4.5, bevel: 30 };
  }
}
