import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Delivery, Profile } from '../lib/types'
import DeliveryCard from '../components/DeliveryCard'
import QrScanner from '../components/QrScanner'

export default function RiderPage({ profile }: { profile: Profile }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [scanDelivery, setScanDelivery] = useState<Delivery | null>(null)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('deliveries').select('*').eq('rider_id', profile.id).order('created_at', { ascending: false })
    if (error) setMessage(error.message); else setDeliveries((data ?? []) as Delivery[])
  }, [profile.id])

  useEffect(() => {
    load()
    const channel = supabase.channel(`rider-${profile.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, load).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load, profile.id])

  async function markPickedUp(id: string) {
    const { error } = await supabase.rpc('rider_mark_picked_up', { p_delivery_id: id })
    setMessage(error ? error.message : 'Marked as picked up.'); load()
  }

  async function confirmDelivered(decoded: string) {
    if (!scanDelivery) return
    const prefix = `REFLEX:${scanDelivery.id}:`
    if (!decoded.startsWith(prefix)) {
      setMessage('This QR code does not belong to the selected delivery.'); setScanDelivery(null); return
    }
    const code = decoded.slice(prefix.length)
    const { error } = await supabase.rpc('rider_confirm_delivery', { p_delivery_id: scanDelivery.id, p_confirmation_code: code })
    setMessage(error ? error.message : 'Delivery confirmed and completed.'); setScanDelivery(null); load()
  }

  const active = deliveries.filter(d => d.status !== 'delivered')
  const done = deliveries.filter(d => d.status === 'delivered')

  return (
    <div>
      <div className="section-title"><div><h1>Rider</h1><p>Your assigned jobs, ordered newest first.</p></div><button className="button ghost" onClick={load}>Refresh</button></div>
      {message && <div className="notice">{message}</div>}
      <h2>Active deliveries</h2>
      <div className="list-stack">
        {active.length === 0 && <div className="card empty">No active assigned deliveries.</div>}
        {active.map(d => <DeliveryCard key={d.id} delivery={d} actions={d.status === 'assigned' ? <button className="button primary" onClick={() => markPickedUp(d.id)}>Mark picked up</button> : d.status === 'picked_up' ? <button className="button success" onClick={() => setScanDelivery(d)}>Scan QR & deliver</button> : undefined} />)}
      </div>
      <h2 className="spaced-heading">Completed</h2>
      <div className="list-stack">{done.map(d => <DeliveryCard key={d.id} delivery={d} />)}</div>
      {scanDelivery && <QrScanner onScan={confirmDelivered} onCancel={() => setScanDelivery(null)} />}
    </div>
  )
}
