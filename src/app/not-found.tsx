import Link from 'next/link'
import { site } from '@/content/site'

// Never echoes the requested path (SECURITY §2.3).
export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-paper px-6 text-center text-text">
      <div>
        <h1 className="font-serif text-display-s">{site.notFound.title}</h1>
        <p className="mt-4 text-body text-text-2">{site.notFound.body}</p>
        <Link
          href="/"
          className="mt-8 inline-block text-body text-ultramarine-fg underline underline-offset-4"
        >
          {site.notFound.home}
        </Link>
      </div>
    </main>
  )
}
