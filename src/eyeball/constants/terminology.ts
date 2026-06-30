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


// ─── Surgical phase → surgeon-facing display name ───────────────────────────
// Internal phase machine (phaseMachine.ts) still uses generic state-machine
// vocabulary (IDLE/CONTACT/INSERTING/WITHDRAWING/COMPLETE) for its transition
// logic. This dictionary is what actually appears in the phase pill and the
// telemetry table.
export const PHASE_DISPLAY: Record<string, string> = {
  IDLE:        'Pre-Op',
  CONTACT:     'Corneal Contact',
  INSERTING:   'Advancing',
  WITHDRAWING: 'Withdrawing',
  COMPLETE:    'Step Complete',
};

// ─── Ophthalmic surgery glossary ─────────────────────────────────────────────
// Real clinical terminology for the in-app Glossary panel — gives trainees
// a quick reference for the anatomy and procedural vocabulary used
// throughout the curriculum, instrument names, and HUD readouts.
export interface GlossaryTerm {
  term: string;
  short?: string;        // abbreviation, if any (e.g. "AC", "I/A")
  definition: string;
  category: 'Anatomy' | 'Procedure' | 'Instrument' | 'Fluidics' | 'Complication';
}

export const OPHTHALMIC_GLOSSARY: GlossaryTerm[] = [
  // Anatomy
  { term: 'Limbus', definition: 'The circular border where the clear cornea meets the white sclera — the standard incision site for cataract surgery.', category: 'Anatomy' },
  { term: 'Anterior Chamber', short: 'AC', definition: 'The fluid-filled space between the cornea and the iris/lens. Must stay pressurised throughout surgery to prevent collapse.', category: 'Anatomy' },
  { term: 'Cornea', definition: 'The clear, dome-shaped front surface of the eye through which the incision is made.', category: 'Anatomy' },
  { term: 'Sclera', definition: 'The white, fibrous outer coat of the eye. The entry site for vitreoretinal surgery (pars plana).', category: 'Anatomy' },
  { term: 'Iris', definition: 'The coloured, muscular diaphragm that controls pupil size; must be protected from instrument trauma throughout surgery.', category: 'Anatomy' },
  { term: 'Pupil', definition: 'The central opening of the iris. Pharmacologically dilated (mydriasis) before surgery for adequate visualisation.', category: 'Anatomy' },
  { term: 'Lens Capsule', definition: 'The thin, transparent membrane enclosing the natural lens. The anterior portion is opened during capsulorhexis; the posterior portion is preserved to hold the IOL.', category: 'Anatomy' },
  { term: 'Nucleus', definition: 'The dense, central core of the lens — the primary target of phacoemulsification.', category: 'Anatomy' },
  { term: 'Cortex', definition: 'The softer, peripheral lens material surrounding the nucleus, removed by irrigation/aspiration after phaco.', category: 'Anatomy' },
  { term: 'Zonules', definition: 'Fine fibres suspending the lens capsule from the ciliary body. Excessive vacuum or mechanical stress can cause zonular dialysis.', category: 'Anatomy' },
  { term: 'Pars Plana', definition: 'A relatively avascular zone of the sclera ~3.5–4mm posterior to the limbus, used as the entry site for vitreoretinal instruments.', category: 'Anatomy' },
  { term: 'Vitreous', definition: 'The clear, gel-like substance filling the back chamber of the eye, removed during vitrectomy (PPV).', category: 'Anatomy' },
  { term: 'Endothelium', definition: 'The single-cell inner layer of the cornea, responsible for keeping it clear. Does not regenerate — must be protected from instrument contact.', category: 'Anatomy' },

  // Procedures
  { term: 'Phacoemulsification', short: 'Phaco', definition: 'Ultrasound-based technique that fragments and emulsifies the lens nucleus for aspiration through a small incision.', category: 'Procedure' },
  { term: 'Capsulorhexis', short: 'CCC', definition: 'Continuous Curvilinear Capsulorhexis — a circular tear made in the anterior lens capsule to access the nucleus and later support the IOL.', category: 'Procedure' },
  { term: 'Hydrodissection', definition: 'Injection of fluid beneath the anterior capsule to separate the lens cortex from the capsule, allowing the nucleus to rotate freely.', category: 'Procedure' },
  { term: 'Irrigation/Aspiration', short: 'I/A', definition: 'The combined inflow (irrigation) and vacuum-based removal (aspiration) of residual cortical lens material after phaco.', category: 'Procedure' },
  { term: 'IOL Insertion', definition: 'Placement of the foldable intraocular lens into the empty capsular bag, replacing the natural lens.', category: 'Procedure' },
  { term: 'Wound Hydration', definition: 'Injection of balanced salt solution into the corneal stroma at the incision edges to create a watertight, self-sealing wound.', category: 'Procedure' },
  { term: 'Vitrectomy', short: 'PPV', definition: 'Pars Plana Vitrectomy — surgical removal of the vitreous gel, typically to access and repair the retina.', category: 'Procedure' },
  { term: 'Membrane Peeling', definition: 'Delicate removal of epiretinal membrane or internal limiting membrane (ILM) from the retinal surface using micro-forceps.', category: 'Procedure' },
  { term: 'Trabeculectomy', definition: 'A glaucoma filtration procedure creating a new drainage pathway for aqueous humour to lower intra-ocular pressure.', category: 'Procedure' },
  { term: 'Keratoplasty', definition: 'Corneal transplantation. Full-thickness (PK) or lamellar (DALK/DSAEK/DMEK) depending on which corneal layers are diseased.', category: 'Procedure' },
  { term: 'Paracentesis', definition: 'A small side-port incision (separate from the main wound) used for instrument access and chamber maintenance.', category: 'Procedure' },

  // Instruments
  { term: 'Keratome', definition: 'A angled, sharp-tipped blade used to create the self-sealing corneal incision at the start of surgery.', category: 'Instrument' },
  { term: 'Phaco Tip', definition: 'The ultrasonic handpiece tip that fragments and aspirates the lens nucleus during phacoemulsification.', category: 'Instrument' },
  { term: 'Capsulorhexis Forceps', definition: 'Fine, specialised forceps used to grasp and tear the anterior lens capsule in a continuous circular fashion.', category: 'Instrument' },
  { term: 'Hydrodissection Cannula', definition: 'A blunt-tipped cannula used to inject fluid beneath the capsule, separating cortex from capsule and hydrating the wound.', category: 'Instrument' },
  { term: 'IOL Injector', definition: 'A cartridge-loaded device that folds and delivers the intraocular lens through the small incision into the capsular bag.', category: 'Instrument' },
  { term: 'Vitrector', definition: 'A high-speed cutting/aspiration probe used to remove vitreous gel during vitreoretinal surgery.', category: 'Instrument' },
  { term: 'Endolaser', definition: 'A fibre-optic laser probe used inside the eye to create chorioretinal adhesions around retinal breaks.', category: 'Instrument' },
  { term: 'Micro Forceps', definition: 'Extremely fine forceps used for membrane peeling and precise intraocular tissue manipulation.', category: 'Instrument' },

  // Fluidics
  { term: 'Balanced Salt Solution', short: 'BSS', definition: 'A sterile, pH- and osmolality-balanced irrigating fluid used to maintain the anterior chamber throughout surgery.', category: 'Fluidics' },
  { term: 'Viscoelastic', short: 'OVD', definition: 'Ophthalmic Viscosurgical Device — a gel-like substance injected to maintain space and protect tissue during key surgical steps.', category: 'Fluidics' },
  { term: 'Vacuum / Aspiration', definition: 'Suction applied through the instrument to draw in and remove lens material; must be balanced against chamber stability.', category: 'Fluidics' },
  { term: 'Chamber Stability', definition: 'A measure of how well the anterior chamber maintains its pressure and volume during active irrigation/aspiration.', category: 'Fluidics' },

  // Complications
  { term: 'Posterior Capsule Rupture', short: 'PCR', definition: 'A tear in the posterior lens capsule — the most significant intraoperative complication of cataract surgery, risking vitreous loss.', category: 'Complication' },
  { term: 'Zonular Dialysis', definition: 'Disruption of the zonular fibres suspending the lens, often from excessive vacuum or mechanical stress, risking lens subluxation.', category: 'Complication' },
  { term: 'Mydriasis', definition: 'Pharmacological pupil dilation achieved with drops (e.g. tropicamide, phenylephrine) prior to surgery for adequate surgical visualisation.', category: 'Complication' },
];
