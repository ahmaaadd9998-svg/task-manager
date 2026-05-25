export function buildTaskSuggestionPrompt(projectDescription: string) {
  return {
    context: projectDescription,
    instruction: 'Generate actionable, specific tasks based on this project context. Each task should be concrete and immediately doable.',
  }
}

export function buildProductivityPrompt(taskStats: { total: number; done: number; overdue: number; topPriority: string }) {
  return `
Total tasks: ${taskStats.total}
Completed: ${taskStats.done}
Overdue: ${taskStats.overdue}
Top priority area: ${taskStats.topPriority}
`
}
