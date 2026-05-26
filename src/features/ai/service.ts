import OpenAI from 'openai'
import { db } from '@/core/db'
import { aiLogs } from '@/core/db/schema/ai-logs'
import { env } from '@/core/config/env'
import { logger } from '@/core/lib/logger'

async function getClient() {
  if (!env.OPENAI_API_KEY) return null
  return new OpenAI({ apiKey: env.OPENAI_API_KEY })
}

async function logCall(userId: string, feature: string, model: string, tokensIn: number, tokensOut: number, latency: number) {
  await db.insert(aiLogs).values({
    id: crypto.randomUUID(),
    userId,
    feature,
    model,
    tokensIn,
    tokensOut,
    latency,
  }).run()
}


export async function generateTaskSuggestions(userId: string, context: string) {
  const client = await getClient()
  if (!client) return null

  const start = Date.now()
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a productivity assistant. Suggest 3-5 concrete tasks based on the user\'s project description. Return as a JSON array of {title:string, priority:"low"|"medium"|"high"}.' },
      { role: 'user', content: context },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 500,
  })

  const latency = Date.now() - start
  const usage = response.usage

  await logCall(
    userId,
    'task-suggestion',
    'gpt-4o',
    usage?.prompt_tokens ?? 0,
    usage?.completion_tokens ?? 0,
    latency
  )

  const content = response.choices[0]?.message?.content
  if (!content) return null

  try {
    const parsed = JSON.parse(content)
    return Array.isArray(parsed.tasks) ? parsed.tasks : Array.isArray(parsed) ? parsed : []
  } catch {
    logger.warn({ userId }, 'Failed to parse AI suggestion response')
    return null
  }
}

export async function generateProductivityInsight(userId: string, taskSummary: string) {
  const client = await getClient()
  if (!client) return null

  const start = Date.now()
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a productivity analyst. Analyze the task data and provide a brief insight (2-3 sentences) about productivity patterns and suggestions.' },
      { role: 'user', content: taskSummary },
    ],
    max_tokens: 300,
  })

  const latency = Date.now() - start
  const usage = response.usage

  await logCall(
    userId,
    'productivity-insight',
    'gpt-4o',
    usage?.prompt_tokens ?? 0,
    usage?.completion_tokens ?? 0,
    latency
  )

  return response.choices[0]?.message?.content ?? null
}

export async function smartPrioritize(userId: string, tasksJson: string) {
  const client = await getClient()
  if (!client) return null

  const start = Date.now()
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a prioritization assistant. Given a list of tasks, reorder them by priority (urgency + importance). Return JSON as {tasks: [{id:string, position:number}]}.' },
      { role: 'user', content: tasksJson },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1000,
  })

  const latency = Date.now() - start
  const usage = response.usage

  await logCall(
    userId,
    'smart-prioritize',
    'gpt-4o',
    usage?.prompt_tokens ?? 0,
    usage?.completion_tokens ?? 0,
    latency
  )

  const content = response.choices[0]?.message?.content
  if (!content) return null

  try {
    const parsed = JSON.parse(content)
    return parsed.tasks ?? null
  } catch {
    logger.warn({ userId }, 'Failed to parse prioritization response')
    return null
  }
}
