import { describe, test, expect, beforeEach } from 'vitest';
import { cataractCurriculum } from './CataractCurriculum';
import { biomechanics } from '../../physics-engine/src/Biomechanics';
import { fluidics } from '../../fluid-engine/src/Fluidics';

function advanceTo(step: string) {
  cataractCurriculum.reset();
  while (cataractCurriculum.getCurrentStep() !== step && cataractCurriculum.getCurrentStep() !== 'complete') {
    cataractCurriculum.advanceStep();
  }
}

describe('CataractCurriculum — hydrodissection step', () => {
  beforeEach(() => {
    cataractCurriculum.reset();
    fluidics.reset();
    biomechanics.reset();
  });

  test('flags excessive cannula depth as a posterior capsule rupture risk', () => {
    advanceTo('hydrodissection');
    const result = cataractCurriculum.validateCurrentStep('hydrodissection_cannula', 4.5, 0);
    expect(result.isValid).toBe(false);
    expect(result.score).toBeLessThan(60);
    expect(result.feedback.some((f) => f.toLowerCase().includes('deep'))).toBe(true);
  });

  test('validates a gentle fluid wave within the capsule with a stable chamber', () => {
    advanceTo('hydrodissection');
    const result = cataractCurriculum.validateCurrentStep('hydrodissection_cannula', 2, 0);
    expect(result.isValid).toBe(true);
    expect(result.score).toBeGreaterThan(60);
  });

  test('does not validate the wrong instrument for this step', () => {
    advanceTo('hydrodissection');
    const result = cataractCurriculum.validateCurrentStep('phaco_tip', 2, 0);
    expect(result.isValid).toBe(false);
  });
});

describe('CataractCurriculum — iol_insertion step', () => {
  beforeEach(() => {
    cataractCurriculum.reset();
    fluidics.reset();
    biomechanics.reset();
  });

  test('validates controlled, shallow IOL delivery', () => {
    advanceTo('iol_insertion');
    const result = cataractCurriculum.validateCurrentStep('iol_injector', 2, 0);
    expect(result.isValid).toBe(true);
    expect(result.score).toBeGreaterThan(70);
  });

  test('penalizes high capsule stress during lens delivery', () => {
    advanceTo('iol_insertion');
    biomechanics.applyDeformation('lens-capsule', [0, 0, 0], [1, 1, 1], 5);
    biomechanics.applyDeformation('lens-capsule', [0, 0, 0], [1, 1, 1], 5);
    biomechanics.applyDeformation('lens-capsule', [0, 0, 0], [1, 1, 1], 5);
    const result = cataractCurriculum.validateCurrentStep('iol_injector', 2, 0);
    expect(result.isValid).toBe(false);
    expect(result.score).toBeLessThan(60);
  });
});
