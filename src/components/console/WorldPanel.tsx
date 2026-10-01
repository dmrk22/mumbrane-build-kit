'use client'

import { type ReactNode, useEffect, useId, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { CONSOLE_UI } from '@/content/console/ui'
import { WORLDS } from '@/content/console/worlds'
import type { Build, World, WorldId } from '@/lib/console/types'
import { cx } from '@/lib/cx'
import { citeKey } from './Evidence'

const { world: copy } = CONSOLE_UI

function Section({ title, help, children }: { title: string; help: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="border-t border-surface-rule px-5 py-5">
      <h3 id={id} className="font-mono text-label text-surface-subtle uppercase">
        {title}
      </h3>
      <p className="mt-1 text-caption text-surface-muted">{help}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

/**
 * The world (CONSOLE §4): switcher, active build, definitions, facts grouped by entity, and "Try a
 * change" (definition variants → Rebuild). Rendered as the left column from 1280 px and inside the
 * world drawer below it, so names and ids are per instance.
 */
export function WorldPanel({
  world,
  build,
  pending,
  flash,
  onWorld,
  onPending,
  onRebuild,
}: {
  world: World
  build: Build
  pending: string | null
  flash: string | null
  onWorld: (id: WorldId) => void
  onPending: (variantId: string | null) => void
  onRebuild: () => void
}) {
  const name = useId()
  const root = useRef<HTMLDivElement>(null)
  // A cited fact or definition scrolls into view in whichever instance is showing.
  useEffect(() => {
    if (!flash) return
    const el = root.current?.querySelector('[data-flash="true"]')
    if (el instanceof HTMLElement && el.offsetParent) el.scrollIntoView({ block: 'nearest' })
  }, [flash])

  const byEntity = world.entities
    .map((e) => ({ entity: e, facts: build.facts.filter((f) => f.entity === e.id) }))
    .filter((g) => g.facts.length > 0)
  const options = [{ id: null, label: copy.base, effect: copy.baseEffect }, ...world.variants]

  return (
    <div ref={root}>
      <div className="px-5 pt-5 pb-5">
        <fieldset>
          <legend className="font-mono text-label text-surface-subtle uppercase">{copy.label}</legend>
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-sm border border-surface-rule p-1">
            {WORLDS.map((w) => (
              <button
                key={w.id}
                type="button"
                aria-pressed={w.id === world.id}
                onClick={() => onWorld(w.id)}
                className={cx(
                  'h-8 rounded-xs px-2 text-small transition-[color,background-color] duration-(--duration-micro) ease-out pointer-coarse:h-11',
                  w.id === world.id
                    ? 'bg-surface-invert text-surface-on-invert'
                    : 'text-surface-muted hover:bg-surface-raise hover:text-surface-fg',
                )}
              >
                {w.name}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="mt-5 text-small text-surface-muted">{world.blurb}</p>
        <p className="mt-4 flex items-center gap-2 font-mono text-label text-surface-fg">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-(--console-ok)" />
          <span key={build.id} className="console-fade">
            {copy.build(build.id, true)}
          </span>
        </p>
        <p className="mt-1.5 text-caption text-surface-muted">{copy.buildHelp}</p>
      </div>

      <Section title={copy.definitions} help={copy.definitionsHelp}>
        <ul className="space-y-3">
          {build.definitions.map((d) => (
            <li
              key={d.id}
              data-flash={flash === citeKey.definition(d.term)}
              className="rounded-sm border border-surface-rule bg-surface-raise p-3.5"
            >
              <p key={d.text} className="console-fade font-serif text-small text-surface-fg">
                {d.text}
              </p>
              <p className="sr-only">{copy.requires}</p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {d.requires.map((r) => (
                  <li
                    key={r.text}
                    className="rounded-xs border border-surface-rule px-1.5 py-0.5 font-mono text-label text-surface-muted"
                  >
                    {r.text}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={copy.facts} help={copy.factsHelp}>
        <ul className="space-y-4">
          {byEntity.map(({ entity, facts }) => (
            <li key={entity.id}>
              <p className="flex items-baseline gap-2 font-mono text-label">
                <span className="text-surface-fg">{entity.id}</span>
                <span className="text-surface-subtle">{entity.kind}</span>
              </p>
              <ul className="mt-1.5 space-y-1">
                {facts.map((f) => (
                  <li
                    key={f.text}
                    data-flash={flash === citeKey.fact(f.text)}
                    className={cx(
                      'rounded-xs px-1 font-mono text-code',
                      f.type === 'property' && f.negated ? 'text-(--console-gap)' : 'text-surface-muted',
                    )}
                  >
                    {f.text}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={copy.change} help={copy.changeHelp}>
        <fieldset>
          <legend className="sr-only">{copy.change}</legend>
          <div className="space-y-2">
            {options.map((o) => {
              const checked = pending === o.id
              return (
                <label
                  key={o.id ?? 'base'}
                  className={cx(
                    'flex cursor-pointer gap-3 rounded-sm border p-3 transition-[border-color,background-color] duration-(--duration-micro) ease-out',
                    checked
                      ? 'border-surface-fg/50 bg-surface-raise'
                      : 'border-surface-rule hover:bg-surface-raise',
                  )}
                >
                  <input
                    type="radio"
                    name={name}
                    checked={checked}
                    onChange={() => onPending(o.id)}
                    className="mt-1 size-4 shrink-0 accent-current"
                  />
                  <span>
                    <span className="block text-small font-medium text-surface-fg">{o.label}</span>
                    <span className="mt-0.5 block text-caption text-surface-muted">{o.effect}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
        <Button
          variant="secondary"
          className="mt-4 w-full"
          disabled={pending === build.variantId}
          onClick={onRebuild}
        >
          {copy.rebuild}
        </Button>
      </Section>
    </div>
  )
}
