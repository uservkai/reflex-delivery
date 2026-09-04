import type { ReactNode } from 'react'
import type { Delivery } from '../lib/types'
import StatusBadge from './StatusBadge'

export default function DeliveryCard({ delivery, actions, extra }: { delivery: Delivery; actions?: ReactNode; extra?: ReactNode }) {
  return (
    <article className="card delivery-card">
      <div className="card-head">
        <div>
          <h3>{delivery.customer_name}</h3>
          <p className="muted">{delivery.item}</p>
        </div>
        <StatusBadge status={delivery.status} />
      </div>
      <div className="details-grid">
        <div><span>Phone</span><strong>{delivery.phone}</strong></div>
        <div><span>Address</span><strong>{delivery.address}</strong></div>
        <div><span>Created</span><strong>{new Date(delivery.created_at).toLocaleString()}</strong></div>
        {delivery.rider?.full_name && <div><span>Rider</span><strong>{delivery.rider.full_name}</strong></div>}
      </div>
      {extra}
      {actions && <div className="actions">{actions}</div>}
    </article>
  )
}
