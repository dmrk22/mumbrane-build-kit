import { redirect } from 'next/navigation'
import { Playground } from '@/components/console/Playground'
import { parseWorld } from '@/lib/security/params'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/console/playground')

// CONSOLE §4: `world` is parsed at the boundary (SECURITY §4.5); missing or unknown → the entry
// screen, which is where a world is chosen.
export default async function PlaygroundPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const world = parseWorld((await searchParams).world)
  if (!world) redirect('/console')
  return <Playground initialWorld={world} />
}
