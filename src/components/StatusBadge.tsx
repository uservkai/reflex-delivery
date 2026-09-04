import type { DeliveryStatus } from '../lib/types'

const labels: Record<DeliveryStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
}

export default function StatusBadge({ status }: { status: DeliveryStatus }) {
  return <span className={`status status-${status}`}>{labels[status]}</span>
}
