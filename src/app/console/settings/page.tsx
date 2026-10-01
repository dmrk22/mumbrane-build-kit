import { SettingsView } from '@/components/console/SettingsView'
import { routeMetadata } from '@/lib/seo'

export const metadata = routeMetadata('/console/settings')

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-8 pb-16 md:px-10 md:pt-12">
      <SettingsView />
    </div>
  )
}
