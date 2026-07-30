import type { ReactNode } from 'react'

/** A titled block: an <h2> heading over its content. Used in both columns. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  )
}
