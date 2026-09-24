/**
 * Application-authored calibration references for subjective PTE scoring prompts.
 *
 * These short responses are illustrative training anchors, not Pearson-published
 * sample responses and not a substitute for the official score guide. They are
 * intentionally task-neutral enough to guide band separation without pretending
 * that one response determines a real exam score.
 */
export const PTE_SUBJECTIVE_CALIBRATION_ANCHORS = `
ILLUSTRATIVE CALIBRATION ANCHORS — APPLICATION REFERENCE ONLY
Use these as qualitative band boundaries. Do not copy their wording, and do not
award a band from fluency alone. Content and form gates remain decisive.

10 (zero/near-zero): "I do not know." The response is empty, irrelevant, or fails a required form/content gate.
30 (limited): "Technology is good. Many people use it. It is sometimes difficult." Isolated basic ideas; development and control are very limited.
50 (competent): "Technology helps people communicate and find information, but it can also create stress when people are always connected." Main meaning is recoverable, but language range and development are modest.
65 (good): "Technology improves access to education and services, although excessive use can reduce concentration. Its value depends on using it purposefully and maintaining reasonable limits." Relevant, organized response with adequate range and some non-blocking errors.
79 (very good): "Digital tools have widened access to education, accelerated collaboration, and reduced geographic barriers; nevertheless, constant connectivity can erode attention and privacy. Responsible design and informed use can preserve the benefits while limiting those costs." Fully relevant, coherent, flexible academic language with only occasional inaccuracies.
90 (expert): "Technology is most valuable when it expands human agency rather than merely increasing activity: it democratizes expertise, coordinates complex systems, and enables participation across distance, while principled governance protects attention, privacy, and equity. This balanced view recognizes both measurable gains and the conditions required to sustain them." Complete, precise, well-controlled response meeting every task requirement.

For speaking tasks, apply the same content ladder to the transcript while separately judging pronunciation and oral fluency. For summaries, require source-grounded coverage. For essays, require the requested form and development. For objective tasks, use deterministic answer keys instead of subjective anchors.
`;

export const PTE_SUBJECTIVE_CALIBRATION_BANDS = [10, 30, 50, 65, 79, 90] as const;
