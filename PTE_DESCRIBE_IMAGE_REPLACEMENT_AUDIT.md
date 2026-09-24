# Describe Image Replacement Audit

## Scope

The Describe Image question bank contains **14 prompts**, each with a distinct image source. The audit identified unreliable external image URLs among the existing sources. The learner flow now blocks scoring until an image loads successfully, preventing false results while replacement media is deployed.

## Original asset set

Eight original, deterministic visual prompts were created for replacement use: a water-cycle process diagram, public-transport trend chart, electricity-generation process diagram, regional population-share bar chart, urban affordability comparison, age-distribution pyramid, annual temperature-variation trend, and urban water-management cycle.

## Lightweight validation

The water-cycle prompt was reviewed after generation. Its labels are legible and non-overlapping, and it has a clear process structure appropriate for a Describe Image response. All assets are PNG files at 1584 × 1008 pixels and are intended for platform hosting rather than remote hotlinking.

## Applied question-bank mappings

| Question ID | Prompt topic | Platform-hosted image path |
| --- | --- | --- |
| 30033 | Water cycle | `/manus-storage/water_cycle_original_4e1e8a0a.png` |
| 30034 | GDP comparison | `/manus-storage/regional_share_original_94b69a63.png` |
| 30035 | Nuclear-power process | `/manus-storage/energy_process_original_f02766cf.png` |
| 150004 | Global smartphone market share | `/manus-storage/smartphone_market_share_original_c07d4480.png` |
| 180019 | World population | `/manus-storage/age_structure_original_cddc968b.png` |
| 180020 | Revenue growth | `/manus-storage/transit_trends_original_3fa2981a.png` |
| 180021 | Oral-reading fluency | `/manus-storage/affordability_index_original_12e11fff.png` |
| 180022 | Global temperature | `/manus-storage/temperature_trend_original_e08bc293.png` |
| 180023 | Water-cycle diagram | `/manus-storage/urban_water_system_original_5d7c6b45.png` |

The corresponding database records were updated in scoped statements that only targeted the nine affected `describe_image` question IDs. The regression suite asserts the complete replacement mapping, the required `/manus-storage/` prefix, unique asset paths, rejection of external URLs, and platform-hosted sources for all 14 current Describe Image questions.

## Complete source verification

All 14 current `describe_image` records were queried after replacement. Every source now begins with `/manus-storage/`. Each image path was then requested from the running development server and returned HTTP `200`, including the five previously hosted prompts and all nine original replacement prompts.
