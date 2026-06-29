import type { AnatomicalLayer } from '../../types/anatomy';

export class LensCapsuleLayer implements Partial<AnatomicalLayer> {
  readonly id = 'lens-capsule';
  readonly name = 'Lens Capsule';
  readonly thickness = 0.02;
  readonly elasticity = 350;
  readonly opacity = 0.6;
  readonly cuttable = true;
}
