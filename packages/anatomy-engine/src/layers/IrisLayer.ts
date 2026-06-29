import type { AnatomicalLayer } from '../../types/anatomy';

export class IrisLayer implements Partial<AnatomicalLayer> {
  readonly id = 'iris';
  readonly name = 'Iris';
  readonly thickness = 0.4;
  readonly elasticity = 60;
  readonly opacity = 0.95;
  readonly cuttable = true;
}
