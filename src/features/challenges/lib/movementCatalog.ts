export type MovementCategory =
  | 'push'
  | 'pull'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'carry'
  | 'cardio'
  | 'olympic'
  | 'core'
  | 'isometric'
  | 'plyometric'
  | 'gymnastics';

export type CatalogMovement = {
  slug: string;
  category: MovementCategory;
};

/**
 * V1 movement catalog — ~100 movements covering the majority of competitive fitness patterns.
 * Slugs are stable identifiers; human-readable labels live in i18n (`movements.<slug>`).
 * To add a movement: append here + add i18n keys in each locale file.
 */
export const MOVEMENT_CATALOG: readonly CatalogMovement[] = [
  // — Push —
  { slug: 'push_up', category: 'push' },
  { slug: 'diamond_push_up', category: 'push' },
  { slug: 'pike_push_up', category: 'push' },
  { slug: 'handstand_push_up', category: 'push' },
  { slug: 'dip', category: 'push' },
  { slug: 'ring_dip', category: 'push' },
  { slug: 'overhead_press', category: 'push' },
  { slug: 'push_press', category: 'push' },
  { slug: 'bench_press', category: 'push' },
  { slug: 'floor_press', category: 'push' },

  // — Pull —
  { slug: 'pull_up', category: 'pull' },
  { slug: 'chin_up', category: 'pull' },
  { slug: 'muscle_up', category: 'pull' },
  { slug: 'ring_muscle_up', category: 'pull' },
  { slug: 'bent_over_row', category: 'pull' },
  { slug: 'inverted_row', category: 'pull' },
  { slug: 'renegade_row', category: 'pull' },
  { slug: 'rope_climb', category: 'pull' },
  { slug: 'lat_pulldown', category: 'pull' },
  { slug: 'ring_row', category: 'pull' },

  // — Squat —
  { slug: 'air_squat', category: 'squat' },
  { slug: 'front_squat', category: 'squat' },
  { slug: 'back_squat', category: 'squat' },
  { slug: 'overhead_squat', category: 'squat' },
  { slug: 'goblet_squat', category: 'squat' },
  { slug: 'pistol_squat', category: 'squat' },
  { slug: 'wall_ball', category: 'squat' },
  { slug: 'squat_jump', category: 'squat' },

  // — Hinge —
  { slug: 'deadlift', category: 'hinge' },
  { slug: 'romanian_deadlift', category: 'hinge' },
  { slug: 'sumo_deadlift', category: 'hinge' },
  { slug: 'kettlebell_swing', category: 'hinge' },
  { slug: 'single_leg_deadlift', category: 'hinge' },
  { slug: 'good_morning', category: 'hinge' },
  { slug: 'hip_thrust', category: 'hinge' },
  { slug: 'glute_bridge', category: 'hinge' },

  // — Lunge —
  { slug: 'walking_lunge', category: 'lunge' },
  { slug: 'reverse_lunge', category: 'lunge' },
  { slug: 'jump_lunge', category: 'lunge' },
  { slug: 'lateral_lunge', category: 'lunge' },
  { slug: 'bulgarian_split_squat', category: 'lunge' },
  { slug: 'step_up', category: 'lunge' },

  // — Carry —
  { slug: 'farmer_carry', category: 'carry' },
  { slug: 'overhead_carry', category: 'carry' },
  { slug: 'suitcase_carry', category: 'carry' },
  { slug: 'sandbag_carry', category: 'carry' },
  { slug: 'front_rack_carry', category: 'carry' },

  // — Cardio / Mono-structure —
  { slug: 'run', category: 'cardio' },
  { slug: 'row_erg', category: 'cardio' },
  { slug: 'assault_bike', category: 'cardio' },
  { slug: 'ski_erg', category: 'cardio' },
  { slug: 'jump_rope', category: 'cardio' },
  { slug: 'double_under', category: 'cardio' },
  { slug: 'shuttle_run', category: 'cardio' },
  { slug: 'battle_rope', category: 'cardio' },

  // — Olympic / Power —
  { slug: 'clean', category: 'olympic' },
  { slug: 'power_clean', category: 'olympic' },
  { slug: 'hang_clean', category: 'olympic' },
  { slug: 'snatch', category: 'olympic' },
  { slug: 'power_snatch', category: 'olympic' },
  { slug: 'thruster', category: 'olympic' },
  { slug: 'clean_and_jerk', category: 'olympic' },
  { slug: 'push_jerk', category: 'olympic' },

  // — Core —
  { slug: 'sit_up', category: 'core' },
  { slug: 'ghd_sit_up', category: 'core' },
  { slug: 'toes_to_bar', category: 'core' },
  { slug: 'knees_to_elbow', category: 'core' },
  { slug: 'v_up', category: 'core' },
  { slug: 'leg_raise', category: 'core' },
  { slug: 'russian_twist', category: 'core' },
  { slug: 'ab_wheel', category: 'core' },

  // — Isometric —
  { slug: 'plank', category: 'isometric' },
  { slug: 'side_plank', category: 'isometric' },
  { slug: 'wall_sit', category: 'isometric' },
  { slug: 'l_sit', category: 'isometric' },
  { slug: 'handstand_hold', category: 'isometric' },
  { slug: 'dead_hang', category: 'isometric' },
  { slug: 'hollow_body', category: 'isometric' },

  // — Plyometric / Explosive —
  { slug: 'box_jump', category: 'plyometric' },
  { slug: 'box_jump_over', category: 'plyometric' },
  { slug: 'burpee', category: 'plyometric' },
  { slug: 'broad_jump', category: 'plyometric' },
  { slug: 'mountain_climber', category: 'plyometric' },
  { slug: 'bear_crawl', category: 'plyometric' },

  // — Gymnastics / Skills —
  { slug: 'handstand_walk', category: 'gymnastics' },
  { slug: 'kipping_pull_up', category: 'gymnastics' },
  { slug: 'chest_to_bar', category: 'gymnastics' },
  { slug: 'turkish_get_up', category: 'gymnastics' },
  { slug: 'strict_ring_dip', category: 'gymnastics' },
] as const;

/** Slugs grouped by category, preserving catalog order within each group. */
export function movementsByCategory(): Map<MovementCategory, CatalogMovement[]> {
  const map = new Map<MovementCategory, CatalogMovement[]>();
  for (const m of MOVEMENT_CATALOG) {
    const list = map.get(m.category);
    if (list) list.push(m);
    else map.set(m.category, [m]);
  }
  return map;
}

const slugSet = new Set(MOVEMENT_CATALOG.map((m) => m.slug));

export function isKnownMovementSlug(slug: string): boolean {
  return slugSet.has(slug);
}

export function getMovementCategory(slug: string): MovementCategory | null {
  const match = MOVEMENT_CATALOG.find((movement) => movement.slug === slug);
  return match?.category ?? null;
}

/** Sentinel value for the "Other (specify)" option. */
export const OTHER_MOVEMENT_SLUG = '__other__';
