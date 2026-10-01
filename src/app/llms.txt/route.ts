import { LLMS, MD_DOCS, type MdDoc } from '@/content/mdDocs'
import { publicEnv } from '@/lib/env'

// /llms.txt (CONTENT §6): the lab in one paragraph, then one line per markdown document.
export const dynamic = 'force-static'

const list = (group: MdDoc['group']) =>
  MD_DOCS.filter((d) => d.group === group).map(
    (d) => `- [${d.title}](${new URL(`/md/${d.key}`, publicEnv.siteUrl).href}): ${d.description}`,
  )

const BODY = [
  `# ${LLMS.title}`,
  '',
  `> ${LLMS.summary}`,
  '',
  LLMS.intro,
  '',
  `## ${LLMS.core}`,
  '',
  ...list('core'),
  '',
  `## ${LLMS.publications}`,
  '',
  ...list('publication'),
  '',
].join('\n')

export function GET() {
  return new Response(BODY, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
