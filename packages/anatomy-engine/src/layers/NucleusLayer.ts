import type { AnatomicalLayer } from '../../types/anatomy';

export class NucleusLayer implements Partial<AnatomicalLayer> {
  readonly id = 'nucleus';
  readonly name = 'Lens Nucleus';
  readonly thickness = 3.5;
  readonly elasticity = 120;
  readonly opacity = 0.85;
  readonly cuttable = true;
}
