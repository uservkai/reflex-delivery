import { FormEvent, useCallback, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase'
import type { Delivery, Profile } from '../lib/types'
import DeliveryCard from '../components/DeliveryCard'

export default function RetailerPage({ profile }: { profile: Profile }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [form, setForm] = useState({ customer_name: '', phone: '', address: '', item: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('deliveries').select('*, rider:profiles!deliveries_rider_id_fkey(*)').order('created_at', { ascending: false })
    if (error) setError(error.message); else setDeliveries((data ?? []) as Delivery[])
  }, [])

  useEffect(() => {
    load()
    const channel = supabase.channel(`retailer-${profile.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, load).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load, profile.id])

  async function createDelivery(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    const { error } = await supabase.from('deliveries').insert({ ...form, retailer_id: profile.id })
    if (error) setError(error.message)
    else setForm({ customer_name: '', phone: '', address: '', item: '' })
    setBusy(false); load()
  }

  return (
    <div className="dashboard-grid">
      <section>
        <div className="section-title"><div><h1>Retailer</h1><p>Log a request and track every delivery state.</p></div></div>
        <form className="card form-stack sticky-card" onSubmit={createDelivery}>
          <h2>New delivery request</h2>
          <label>Customer name<input required value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} /></label>
          <label>Phone<input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
          <label>Delivery address<textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label>
          <label>Item description<textarea required value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} /></label>
          {error && <div className="error">{error}</div>}
          <button className="button primary" disabled={busy}>{busy ? 'Creating…' : 'Create delivery'}</button>
        </form>
      </section>
      <section>
        <div className="section-title"><div><h2>My deliveries</h2><p>{deliveries.length} request{deliveries.length === 1 ? '' : 's'}</p></div><button className="button ghost" onClick={load}>Refresh</button></div>
        <div className="list-stack">
          {deliveries.length === 0 && <div className="card empty">No deliveries yet.</div>}
          {deliveries.map(d => <DeliveryCard key={d.id} delivery={d} extra={d.status !== 'pending' && d.status !== 'delivered' ? <div className="qr-panel"><QRCodeSVG value={`REFLEX:${d.id}:${d.confirmation_code}`} size={120} /><div><strong>Customer confirmation QR</strong><p className="muted">Show this to the rider only when the order is being handed over to the customer.</p></div></div> : undefined} />)}
        </div>
      </section>
    </div>
  )
}
