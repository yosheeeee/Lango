import { z } from 'zod'

const jsonLeafSchema: z.ZodType<string | number | boolean | null> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
])

export const jsonRecordSchema: z.ZodType<Record<string, unknown>> = z.lazy(() =>
  z.record(z.string(), z.union([jsonLeafSchema, jsonRecordSchema]))
)

export function safeJsonParse<T extends Record<string, unknown>>(
  content: string,
  fallback: T = {} as T
): T {
  try {
    const parsed = JSON.parse(content)
    const result = jsonRecordSchema.safeParse(parsed)
    if (result.success) return parsed as T
    return fallback
  } catch {
    return fallback
  }
}
