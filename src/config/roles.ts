// Define roles with their aliases inline
export const FILM_ROLES_WITH_ALIASES = {
  // Camera & Photography
  'Director of Photography (DP)': ['Cinematographer', 'DP', 'Director of Photography'],
  'Camera Operator': ['Cam Op', 'Additional Camera Operator', 'Additional Cam Op'],
  'Camera Assistant': ['1st AC', '2nd AC', 'Focus Puller'],
  'Photographer': ['Still Photographer'],
  'Drone Pilot': ['Drone Operator'],

  // Direction & Production
  'Director': [],
  'Assistant Director (AD)': ['1st AD', '2nd AD', 'AD'],
  'Producer': [],
  'Executive Producer': ['EP'],
  'Associate Producer': [],
  'Line Producer': [],
  'Production Manager (PM)': ['PM', 'UPM', 'Unit Production Manager'],
  'Production Coordinator': [],
  'Production Assistant': ['PA'],

  // Writing
  'Screenwriter': ['Writer', 'Scriptwriter', 'Scriptwriting'],

  // Sound
  'Sound Designer': [],
  'Sound Mixer': ['Production Sound Mixer', 'Sound Recordist'],
  'Boom Operator': [],
  'Audio Engineer': ['Sound Engineer', 'Audio/Lighting'],
  'Composer': ['Music Composer'],

  // Lighting & Grip
  'Gaffer': ['Chief Lighting Technician'],
  'Key Grip': [],
  'Grip': [],
  'Lighting Technician': ['Electrician'],

  // Art Department
  'Production Designer': ['Art Director'],
  'Set Designer': [],
  'Set Decorator': [],
  'Prop Master': ['Props'],

  // Post-Production
  'Editor': ['Film Editor', 'Video Editor'],
  'Colorist': ['Color Grader'],
  'VFX Artist': ['Visual Effects Artist', 'VFX'],
  'Motion Graphics Designer': ['Motion Graphics', 'Animator'],

  // Hair, Makeup, Wardrobe
  'Makeup Artist': ['MUA'],
  'Hair Stylist': [],
  'Costume Designer': ['Wardrobe', 'Wardrobe Stylist'],

  // Performance
  'Actor': ['Actress', 'Performer', 'Talent'],
  'Voice Actor': ['Voice Over Artist', 'VO Artist', 'Narrator'],
  'Stunt Coordinator': [],

  // Other
  'Script Supervisor': ['Continuity'],
  'Location Scout': ['Location Manager'],
  'Creative Director': [],
  'Videographer': [],
  'Filmmaker': [],
} as const;

export const FILM_ROLES = Object.keys(FILM_ROLES_WITH_ALIASES);

// For autocomplete: show both canonical and aliases
export const ALL_ROLE_STRINGS = FILM_ROLES.flatMap(role =>
  [role, ...(FILM_ROLES_WITH_ALIASES[role as keyof typeof FILM_ROLES_WITH_ALIASES] || [])]
);

/**
 * Normalize a role string to its canonical form.
 * Returns the canonical role if found, otherwise returns the input unchanged.
 */
export function normalizeRole(input: string): string {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  for (const [canonical, aliases] of Object.entries(FILM_ROLES_WITH_ALIASES)) {
    if (canonical.toLowerCase() === lower ||
        aliases.some((alias: string) => alias.toLowerCase() === lower)) {
      return canonical;
    }
  }

  return trimmed; // Return as-is if no match
}

/**
 * Normalize a comma-separated list of roles.
 * Deduplicates roles that normalize to the same canonical form.
 */
export function normalizeRoles(rolesStr: string): string {
  const roles = rolesStr.split(/[,/]/).map(r => r.trim()).filter(Boolean);
  const normalized = roles.map(normalizeRole);
  // Deduplicate while preserving order
  const unique = [...new Set(normalized)];
  return unique.join(', ');
}

export type FilmRole = typeof FILM_ROLES[number];
