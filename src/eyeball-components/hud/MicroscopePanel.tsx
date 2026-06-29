import { useSimulationStore } from '../../stores/simulationStore';
import { Slider } from '../ui/slider';

export function MicroscopePanel() {
  const microscope = useSimulationStore((s) => s.microscope);
  const toggleMicroscope = useSimulationStore((s) => s.toggleMicroscope);
  const setMicroscopeZoom = useSimulationStore((s) => s.setMicroscopeZoom);
  const setMicroscopeFocus = useSimulationStore((s) => s.setMicroscopeFocus);
  const setMicroscopeCoaxial = useSimulationStore((s) => s.setMicroscopeCoaxial);
  const resetMicroscope = useSimulationStore((s) => s.resetMicroscope);

  return (
    <div className="pointer-events-auto w-56 rounded-lg border border-blue-500/30 bg-gray-950/85 p-3 text-blue-100 backdrop-blur">
      <div className="mb-2 flex items-center justify-between border-b border-blue-500/20 pb-1">
        <h3 className="text-xs font-semibold tracking-wider text-blue-400 uppercase">Microscope</h3>
        <button
          onClick={toggleMicroscope}
          className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase transition-colors ${
            microscope.enabled
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          {microscope.enabled ? 'On' : 'Off'}
        </button>
      </div>

      <div className="mb-2">
        <label className="mb-1 flex justify-between text-xs text-blue-100">
          <span>Zoom</span>
          <span className="font-mono text-blue-300">{microscope.zoom.toFixed(1)}x</span>
        </label>
        <Slider
          min={1}
          max={25}
          step={0.5}
          value={[microscope.zoom]}
          onValueChange={([v]) => {
            setMicroscopeZoom(v);
          }}
        />
      </div>

      <div className="mb-2">
        <label className="mb-1 flex justify-between text-xs text-blue-100">
          <span>Focus (cornea → posterior)</span>
          <span className="font-mono text-blue-300">{microscope.focus.toFixed(2)}</span>
        </label>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[microscope.focus]}
          onValueChange={([v]) => {
            setMicroscopeFocus(v);
          }}
        />
      </div>

      <div className="mb-2">
        <label className="mb-1 flex justify-between text-xs text-blue-100">
          <span>Coaxial illumination</span>
          <span className="font-mono text-blue-300">{microscope.coaxialIntensity.toFixed(1)}</span>
        </label>
        <Slider
          min={0}
          max={4}
          step={0.1}
          value={[microscope.coaxialIntensity]}
          onValueChange={([v]) => {
            setMicroscopeCoaxial(v);
          }}
        />
      </div>

      <button
        onClick={resetMicroscope}
        className="mt-1 w-full rounded border border-blue-500/20 px-2 py-1 text-[10px] text-blue-300/70 hover:bg-gray-800 hover:text-blue-200"
      >
        Reset Microscope
      </button>
    </div>
  );
}
