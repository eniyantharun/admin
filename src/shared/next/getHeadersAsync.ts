import { headers } from 'next/headers'
import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'

// better typing and name
export async function getHeadersAsync(): Promise<ReadonlyHeaders> {
  return await headers()
}
