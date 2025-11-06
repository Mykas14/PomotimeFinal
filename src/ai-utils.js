// Placeholder AI utils - mock implementations.
// Exports named functions and a default export object.

export async function generateQuiz(file) {
  // In a real implementation this would parse the file and call an AI service.
  // Return mock quiz structure matching what PomoTime expects.
  return {
    title: file ? file.name || "Uploaded Document Quiz" : "Sample Quiz",
    questions: [
      {
        question: "What is 2 + 2?",
        options: ["1", "2", "4", "22"],
        answer: "4",
      },
      {
        question: "What color is the sky?",
        options: ["Green", "Blue", "Red", "Yellow"],
        answer: "Blue",
      },
    ],
  }
}

export async function generateStudyPlan(topic, durationDays = 7) {
  // Return a mock study plan array of days with activities.
  const plan = []
  for (let i = 0; i < durationDays; i++) {
    plan.push({
      topic: `${topic} — subtopic ${i + 1}`,
      activities: [
        `Read about ${topic} part ${i + 1}`,
        `Do practice problems for ${topic} part ${i + 1}`,
        `Review and summary notes for day ${i + 1}`,
      ],
    })
  }
  return plan
}

export default {
  generateQuiz,
  generateStudyPlan,
}
