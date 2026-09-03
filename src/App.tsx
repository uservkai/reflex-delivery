import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './lib/supabase'
import type { Profile } from './lib/types'
import LoginPage from './pages/LoginPage'
import RetailerPage from './pages/RetailerPage'
import DispatcherPage from './pages/DispatcherPage'
import RiderPage from './pages/RiderPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import FaqPage from './pages/FaqPage'
import Layout from './components/Layout'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user) {
        setProfile(null)
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (error) console.error(error)
      setProfile((data as Profile) ?? null)
      setLoading(false)
    }
    loadProfile()
  }, [session])

  if (loading) return <div className="center-screen"><div className="spinner" />Loading Reflex…</div>

  if (!session || !profile) {
    return (
      <Routes>
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  const home = profile.role === 'retailer' ? '/retailer' : profile.role === 'dispatcher' ? '/dispatcher' : '/rider'

  return (
    <Routes>
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route element={<Layout profile={profile} />}>
        <Route path="/retailer" element={profile.role === 'retailer' ? <RetailerPage profile={profile} /> : <Navigate to={home} />} />
        <Route path="/dispatcher" element={profile.role === 'dispatcher' ? <DispatcherPage /> : <Navigate to={home} />} />
        <Route path="/rider" element={profile.role === 'rider' ? <RiderPage profile={profile} /> : <Navigate to={home} />} />
        <Route path="*" element={<Navigate to={home} />} />
      </Route>
    </Routes>
  )
}
