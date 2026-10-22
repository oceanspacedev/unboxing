import { BadgeCheck, CreditCard, Store, Truck } from 'lucide-react'
import { BENEFITS } from '../data'

const ICONS = { BadgeCheck, CreditCard, Store, Truck }

export default function Benefits() {
  return (
    <section className="container section">
      <ul className="benefits">
        {BENEFITS.map((b) => {
          const Icon = ICONS[b.icon]
          return (
            <li key={b.label}>
              <Icon size={20} strokeWidth={1.75} />
              <span>{b.label}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
