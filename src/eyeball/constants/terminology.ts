import type { SimulationMode } from '../types';

/**
 * Surgical display-name dictionary.
 *
 * This codebase originates from a robotics/teleoperation background, so
 * internal state values use robot-arm vocabulary (VIEW/PLACE/EDIT/REPLAY
 * modes, RCM = "Remote Center of Motion", Kinematics, Tilt Alpha/Beta).
 * Those identifiers are intentionally left unchanged in the code — they
 * are deeply wired through 40+ files and a rename risks regressions with
 * no compiler available to verify against.
 *
 * Instead, every UI string a surgeon actually reads routes through this
 * single dictionary, translating robotics terms into the language a
 * trainee ophthalmic surgeon would recognise. Update display wording here
 * — never hardcode robotics terms directly in component JSX again.
 */

// Workflow mode → what the surgeon sees on screen
export const MODE_DISPLAY: Record<SimulationMode, string> = {
  VIEW:   'Observe',
  PLACE:  'Mark Entry',
  EDIT:   'Operate',
  REPLAY: 'Playback',
};

// Short one-line description of what to do in each mode
export const MODE_HINT: Record<SimulationMode, string> = {
  VIEW:   'Observation — press P to mark the entry point',
  PLACE:  'Click the eyeball surface to mark the incision / entry point',
  EDIT:   'Drag ↔ to swing the instrument · Drag ↕ to insert/withdraw · Scroll for fine depth · 1-4 for approach-angle presets',
  REPLAY: 'Playback — use the Controls panel to adjust speed',
};

// "RCM" (robotics: Remote Center of Motion) -> surgical: the fixed point
// where the instrument enters the eye (limbal or scleral incision site).
export const ENTRY_POINT_LABEL       = 'Entry Point';
export const ENTRY_POINT_LABEL_PLURAL = 'Entry Points';

// "Kinematics" (robotics: joint motion data) -> surgical: live instrument telemetry
export const TELEMETRY_PANEL_LABEL = 'Instrument Telemetry';

// "Tilt Alpha / Tilt Beta" (robotics: gimbal joint angles) -> surgical: approach geometry
export const APPROACH_ANGLE_LABEL = 'Approach Angle';   // was "Tilt Alpha"
export const SWING_ANGLE_LABEL    = 'Swing Angle';       // was "Tilt Beta"

// Short symbol forms for compact tables / coordinate readouts
export const APPROACH_ANGLE_SYMBOL = 'Approach (α)';
export const SWING_ANGLE_SYMBOL    = 'Swing (β)';
