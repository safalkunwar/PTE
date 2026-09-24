/**
 * Audited replacement sources for Describe Image prompts that previously
 * depended on unreliable external hotlinks. These paths are deployed with
 * the platform and match the corresponding persisted question-bank records.
 */
export const describeImageHostedSourceMappings = {
  30033: "/manus-storage/water_cycle_original_4e1e8a0a.png",
  30034: "/manus-storage/regional_share_original_94b69a63.png",
  30035: "/manus-storage/energy_process_original_f02766cf.png",
  150004: "/manus-storage/smartphone_market_share_original_c07d4480.png",
  180019: "/manus-storage/age_structure_original_cddc968b.png",
  180020: "/manus-storage/transit_trends_original_3fa2981a.png",
  180021: "/manus-storage/affordability_index_original_12e11fff.png",
  180022: "/manus-storage/temperature_trend_original_e08bc293.png",
  180023: "/manus-storage/urban_water_system_original_5d7c6b45.png",
} as const;

/** Every current Describe Image question is served from platform storage. */
export const describeImageQuestionImageSources = {
  30028: "/manus-storage/climate-graph_167a0925.png",
  30029: "/manus-storage/electricity-pie_1f09316b.png",
  30030: "/manus-storage/japan-population-pyramid_fa4a3615.jpg",
  30031: "/manus-storage/university-enrollment_53b8eaa7.jpg",
  30032: "/manus-storage/amazon-deforestation-map_a2cfc38d.jpg",
  ...describeImageHostedSourceMappings,
} as const;

export function isPlatformHostedDescribeImageSource(source: string | null | undefined): boolean {
  return typeof source === "string" && source.startsWith("/manus-storage/");
}
