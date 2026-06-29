import type { AnatomicalLayer } from '../../types/anatomy';

export class ScleraLayer implements Partial<AnatomicalLayer> {
  readonly id = 'sclera';
  readonly name = 'Sclera';
  readonly thickness = 0.8;
  readonly elasticity = 1200;
  readonly opacity = 1.0;
  readonly cuttable = false;
}
