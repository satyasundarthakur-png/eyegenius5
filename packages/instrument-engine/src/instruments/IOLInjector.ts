import { Instrument } from '../Instrument';
import type { InstrumentConfig, TipGeometryDescriptor } from '../types/instrument';

/**
 * IOL Injector
 * Delivers a folded intraocular lens through the main incision into the
 * capsular bag. Wider barrel than the other instruments; shallow, slow,
 * deliberate insertion is rewarded by the curriculum engine.
 */
export class IOLInjector extends Instrument {
  constructor() {
    const config: InstrumentConfig = {
      type: 'iol_injector',
      name: 'IOL Injector',
      usesRCM: true,
      maxInsertionDepth: 4,
      maxTiltAngle: Math.PI / 5,
      tipLength: 6,
      color: '#4a90d9', // cartridge blue
    };
    super(config);
  }

  getDisplayName(): string {
    return 'IOL Injector';
  }

  getTipGeometry(): TipGeometryDescriptor {
    return { type: 'injector', barrelDiameter: 1.4, length: 6 };
  }
}
