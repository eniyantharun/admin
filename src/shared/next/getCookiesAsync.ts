import { cookies } from 'next/headers'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// better typing and name
export async function getCookiesAsync(): Promise<ReadonlyRequestCookies> {
  return await cookies()
}
