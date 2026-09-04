import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Delivery, Profile } from '../lib/types'
import DeliveryCard from '../components/DeliveryCard'

export default function DispatcherPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [riders, setRiders] = useState<Profile[]>([])
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const [deliveryRes, riderRes] = await Promise.all([
      supabase.from('deliveries').select('*, rider:profiles!deliveries_rider_id_fkey(*)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('role', 'rider').order('full_name'),
    ])
    if (deliveryRes.data) setDeliveries(deliveryRes.data as Delivery[])
    if (riderRes.data) setRiders(riderRes.data as Profile[])
  }, [])

  useEffect(() => {
    load()
    const channel = supabase.channel('dispatcher-deliveries').on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, load).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  async function assign(deliveryId: string) {
    const riderId = selected[deliveryId]
    if (!riderId) return setMessage('Select a rider first.')
    const { error } = await supabase.rpc('assign_delivery', { p_delivery_id: deliveryId, p_rider_id: riderId })
    setMessage(error ? error.message : 'Delivery assigned.')
    load()
  }

  const pending = deliveries.filter(d => d.status === 'pending')
  const active = deliveries.filter(d => d.status !== 'pending')

  return (
    <div>
      <div className="section-title"><div><h1>Dispatcher</h1><p>Assign open requests and monitor the delivery queue.</p></div><button className="button ghost" onClick={load}>Refresh</button></div>
      {message && <div className="notice">{message}</div>}
      <div className="metric-row"><div className="metric card"><span>Open</span><strong>{pending.length}</strong></div><div className="metric card"><span>Active / done</span><strong>{active.length}</strong></div><div className="metric card"><span>Riders</span><strong>{riders.length}</strong></div></div>
      <h2>Open requests</h2>
      <div className="list-stack">
        {pending.length === 0 && <div className="card empty">No open deliveries.</div>}
        {pending.map(d => <DeliveryCard key={d.id} delivery={d} actions={<><select value={selected[d.id] ?? ''} onChange={e => setSelected({ ...selected, [d.id]: e.target.value })}><option value="">Select rider…</option>{riders.map(r => <option value={r.id} key={r.id}>{r.full_name}</option>)}</select><button className="button primary" onClick={() => assign(d.id)}>Assign</button></>} />)}
      </div>
      <h2 className="spaced-heading">Assigned & completed</h2>
      <div className="list-stack">{active.map(d => <DeliveryCard key={d.id} delivery={d} />)}</div>
    </div>
  )
}
