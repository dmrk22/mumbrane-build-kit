import { UsageView } from '@/components/console/UsageView'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/console/usage')

// CONSOLE §9: this tab's real, local activity — no sample numbers.
export default function UsagePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 pt-8 pb-16 md:px-10 md:pt-12">
      <UsageView />
    </div>
  )
}
