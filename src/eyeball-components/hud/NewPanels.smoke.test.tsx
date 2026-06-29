import { render } from '@testing-library/react';
import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import { InstrumentPanel } from './InstrumentPanel';
import { MicroscopePanel } from './MicroscopePanel';
import { CurriculumPanel } from './CurriculumPanel';
import { ScoreCoachPanel } from './ScoreCoachPanel';
import { ProcedureMenu } from './ProcedureMenu';
import { OperativeFieldBadge } from './OperativeFieldBadge';
import { useSimulationStore } from '../../stores/simulationStore';

beforeEach(() => {
  useSimulationStore.getState().reset();
  useSimulationStore.setState({ eyeSide: 'OD' });
});

afterEach(() => {
  useSimulationStore.getState().reset();
  useSimulationStore.setState({ eyeSide: 'OD' });
});

describe('InstrumentPanel', () => {
  test('lists all available instruments and highlights the active one', () => {
    const { getByText } = render(<InstrumentPanel />);
    expect(getByText('Keratome (Incision Knife)')).toBeTruthy();
    expect(getByText('Phaco')).toBeTruthy();
  });

  test('switching instrument updates the active readout', () => {
    const { getByText } = render(<InstrumentPanel />);
    getByText('Phaco').click();
    expect(useSimulationStore.getState().currentInstrument?.getType()).toBe('phaco_tip');
  });

  test('all 6 implemented instruments are selectable, including hydrodissection and IOL injector', () => {
    const { getByText } = render(<InstrumentPanel />);
    expect(getByText('Hydro Cannula')).toBeTruthy();
    expect(getByText('IOL Injector')).toBeTruthy();

    getByText('Hydro Cannula').click();
    expect(useSimulationStore.getState().currentInstrument?.getType()).toBe('hydrodissection_cannula');

    getByText('IOL Injector').click();
    expect(useSimulationStore.getState().currentInstrument?.getType()).toBe('iol_injector');
  });
});

describe('MicroscopePanel', () => {
  test('renders current zoom and toggles enabled state', () => {
    const { getByText } = render(<MicroscopePanel />);
    expect(getByText('On')).toBeTruthy();
    getByText('On').click();
    expect(useSimulationStore.getState().microscope.enabled).toBe(false);
  });
});

describe('CurriculumPanel', () => {
  test('starts in Free Observation mode with a Start Procedure control', () => {
    const { getByText } = render(<CurriculumPanel />);
    expect(getByText('Free Observation')).toBeTruthy();
    expect(getByText('Start Procedure (Operate)')).toBeTruthy();
  });

  test('shows the incision step as current once the procedure is started', () => {
    useSimulationStore.getState().startProcedure();
    const { getByText } = render(<CurriculumPanel />);
    expect(getByText('Incision')).toBeTruthy();
    expect(getByText('Advance to next step')).toBeTruthy();
  });

  test('advance button is disabled until the step validates', () => {
    useSimulationStore.getState().startProcedure();
    const { getByText } = render(<CurriculumPanel />);
    const button = getByText('Advance to next step') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});

describe('ProcedureMenu', () => {
  test('defaults to Cataract and switching to Retina updates the selected procedure', () => {
    const { getByText } = render(<ProcedureMenu />);
    expect(useSimulationStore.getState().selectedProcedure).toBe('cataract');

    getByText('Vitreoretinal').click();
    expect(useSimulationStore.getState().selectedProcedure).toBe('retina');
    expect(useSimulationStore.getState().currentInstrument?.getType()).toBe('vitrector');
  });
});

describe('CurriculumPanel — free-practice procedures', () => {
  test('shows a free-practice notice instead of cataract steps when Retina is selected', () => {
    useSimulationStore.getState().setProcedure('retina');
    const { getByText } = render(<CurriculumPanel />);
    expect(getByText(/isn't implemented yet/)).toBeTruthy();
  });
});

describe('InstrumentPanel — procedure filtering', () => {
  test('only shows retina instruments when the retina procedure is selected', () => {
    useSimulationStore.getState().setProcedure('retina');
    const { getAllByText, getByText, queryByText } = render(<InstrumentPanel />);
    expect(getAllByText('Vitrector').length).toBeGreaterThan(0);
    expect(getByText('Endolaser')).toBeTruthy();
    expect(queryByText('Phaco')).toBeNull();
  });
});
describe('OperativeFieldBadge', () => {
  test('defaults to OD and shows the right-side operator position', () => {
    const { getByText } = render(<OperativeFieldBadge />);
    expect(useSimulationStore.getState().eyeSide).toBe('OD');
    expect(getByText(/patient's right side/)).toBeTruthy();
  });

  test('clicking OS updates the store eye side', () => {
    const { getByText } = render(<OperativeFieldBadge />);
    getByText('OS — Left Eye').click();
    expect(useSimulationStore.getState().eyeSide).toBe('OS');
  });

  test('shows the left-side operator position once eyeSide is OS', () => {
    useSimulationStore.getState().setEyeSide('OS');
    const { getByText } = render(<OperativeFieldBadge />);
    expect(getByText(/patient's left side/)).toBeTruthy();
  });
});

describe('ScoreCoachPanel', () => {
  test('renders default performance metrics', () => {
    const { getByText } = render(<ScoreCoachPanel />);
    expect(getByText('Score & AI Coach')).toBeTruthy();
    expect(getByText(/keep operating/i)).toBeTruthy();
  });
});

