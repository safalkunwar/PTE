import { describe, expect, it } from "vitest";
import {
  describeImageHostedSourceMappings,
  describeImageQuestionImageSources,
  isPlatformHostedDescribeImageSource,
} from "./describeImageMedia";

describe("Describe Image hosted source replacements", () => {
  it("maps every audited external prompt to a stable platform-hosted asset", () => {
    expect(describeImageHostedSourceMappings).toEqual({
      30033: "/manus-storage/water_cycle_original_4e1e8a0a.png",
      30034: "/manus-storage/regional_share_original_94b69a63.png",
      30035: "/manus-storage/energy_process_original_f02766cf.png",
      150004: "/manus-storage/smartphone_market_share_original_c07d4480.png",
      180019: "/manus-storage/age_structure_original_cddc968b.png",
      180020: "/manus-storage/transit_trends_original_3fa2981a.png",
      180021: "/manus-storage/affordability_index_original_12e11fff.png",
      180022: "/manus-storage/temperature_trend_original_e08bc293.png",
      180023: "/manus-storage/urban_water_system_original_5d7c6b45.png",
    });
  });

  it("does not permit an external URL for an audited Describe Image prompt", () => {
    const sources = Object.values(describeImageHostedSourceMappings);

    expect(sources).toHaveLength(9);
    expect(new Set(sources).size).toBe(sources.length);
    expect(sources.every(isPlatformHostedDescribeImageSource)).toBe(true);
    expect(sources.some(source => /^https?:\/\//.test(source))).toBe(false);
  });

  it("keeps all current Describe Image question sources on platform storage", () => {
    const questionIds = Object.keys(describeImageQuestionImageSources).map(Number).sort((a, b) => a - b);

    expect(questionIds).toEqual([
      30028, 30029, 30030, 30031, 30032, 30033, 30034, 30035,
      150004, 180019, 180020, 180021, 180022, 180023,
    ]);
    expect(Object.values(describeImageQuestionImageSources).every(isPlatformHostedDescribeImageSource)).toBe(true);
  });

  it("rejects missing and external sources from the platform-hosted contract", () => {
    expect(isPlatformHostedDescribeImageSource(undefined)).toBe(false);
    expect(isPlatformHostedDescribeImageSource(null)).toBe(false);
    expect(isPlatformHostedDescribeImageSource("https://upload.wikimedia.org/example.png")).toBe(false);
  });
});
