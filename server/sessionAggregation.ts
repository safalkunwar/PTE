import { getPteTaskProcedure } from "@shared/pteTaskConfig";

export type PlannedQuestionId = { questionId: number };

type QuestionIdentity = {
  taskType?: string | null;
  section?: string | null;
};

export function isScoredSessionQuestion(question?: QuestionIdentity | null): boolean {
  if (!question?.taskType) return true;
  return getPteTaskProcedure(question.taskType, question.section as never)?.scored !== false;
}

export function filterScoredSessionResponses<T extends { question?: QuestionIdentity | null }>(responses: T[]): T[] {
  return responses.filter((response) => isScoredSessionQuestion(response.question));
}

export function selectLatestPlannedResponses<T extends PlannedQuestionId>(
  responses: T[],
  plan: PlannedQuestionId[],
): T[] {
  if (plan.length === 0) return responses;
  const latestByQuestionId = new Map(responses.map(response => [response.questionId, response]));
  return plan
    .map(item => latestByQuestionId.get(item.questionId))
    .filter((response): response is T => Boolean(response));
}
