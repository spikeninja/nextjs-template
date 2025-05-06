export const DO_SOMETHING_USEFUL = "doSomethingUseful"
export const GENERATE_INTERVIEW_QUESTIONS = "generateInterviewQuestions"

export const doSomethingUseful = async (payload: {
  userId: number
  someAnotherId: string
}) => {
  const result = payload.userId + 10
  return { userfulResult: result }
}

export const jobProcessors = {
  [DO_SOMETHING_USEFUL]: doSomethingUseful,
}
