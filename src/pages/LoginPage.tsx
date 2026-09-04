import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { SiteFooter } from '../components/Layout'

type DemoAccountKey = 'retailer' | 'dispatcher' | 'rider' | 'rider2'

type DemoAccount = {
  label: string
  description: string
  email?: string
  password?: string
}

const demoAccounts: Record<DemoAccountKey, DemoAccount> = {
  retailer: {
    label: 'Demo Retailer',
    description: 'Create and track delivery requests',
    email: import.meta.env.VITE_DEMO_RETAILER_EMAIL,
    password: import.meta.env.VITE_DEMO_RETAILER_PASSWORD,
  },
  dispatcher: {
    label: 'Demo Dispatcher',
    description: 'Review open requests and assign riders',
    email: import.meta.env.VITE_DEMO_DISPATCHER_EMAIL,
    password: import.meta.env.VITE_DEMO_DISPATCHER_PASSWORD,
  },
  rider: {
    label: 'Demo Rider',
    description: 'Update assigned deliveries and confirm handover',
    email: import.meta.env.VITE_DEMO_RIDER_EMAIL,
    password: import.meta.env.VITE_DEMO_RIDER_PASSWORD,
  },
  rider2: {
    label: 'Demo Rider 2',
    description: 'Test assignment with a second rider account',
    email: import.meta.env.VITE_DEMO_RIDER2_EMAIL,
    password: import.meta.env.VITE_DEMO_RIDER2_PASSWORD,
  },
}

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [demoAccount, setDemoAccount] = useState<DemoAccountKey>('retailer')
  const [demoBusy, setDemoBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'retailer' } },
      })
      if (error) setMessage(error.message)
      else setMessage('Account created. If email confirmation is enabled in Supabase, confirm your email, then sign in.')
    }

    setBusy(false)
  }

  async function demoLogin() {
    setMessage('')
    setDemoBusy(true)

    const account = demoAccounts[demoAccount]
    if (!account.email || !account.password) {
      setMessage(`${account.label} is not configured yet. Add its VITE_DEMO_* credentials to your environment variables.`)
      setDemoBusy(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    })

    if (error) setMessage(`Demo sign-in failed: ${error.message}`)
    setDemoBusy(false)
  }

  const selectedDemo = demoAccounts[demoAccount]

  return (
    <div className="public-shell">
      <main className="auth-page">
        <section className="auth-hero">
          <div className="hero-copy">
            <span className="hero-kicker">Delivery coordination, made visible</span>
            <div className="brand large">REFLEX</div>
            <h1>From delivery uncertainty to a clear, visible flow.</h1>
            <p>Log requests, assign riders, follow every status change, and confirm the final handover in one connected workspace.</p>
            <div className="flow-strip" aria-label="Delivery flow">
              <span>Request</span><b>→</b><span>Assign</span><b>→</b><span>Pick Up</span><b>→</b><span>Deliver</span>
            </div>
          </div>

          <aside className="hero-note">
            <span className="note-number">01</span>
            <div><strong>One shared delivery record</strong><p>Retailer, dispatcher, and rider see the same job move forward.</p></div>
          </aside>
        </section>

        <section className="auth-panel-wrap">
          <section className="card auth-card">
            <div className="demo-section compact-demo">
              <div className="demo-heading">
                <span className="eyebrow">Explore Reflex</span>
                <h2>Try a demo account</h2>
              </div>

              <div className="demo-picker">
                <label>
                  <span className="sr-only">Select demo account</span>
                  <select value={demoAccount} onChange={e => setDemoAccount(e.target.value as DemoAccountKey)} disabled={demoBusy || busy}>
                    {Object.entries(demoAccounts).map(([key, account]) => (
                      <option key={key} value={key}>{account.label}</option>
                    ))}
                  </select>
                </label>
                <button type="button" className="button accent demo-continue" disabled={demoBusy || busy} onClick={demoLogin}>
                  {demoBusy ? 'Signing in…' : 'Continue as Demo'}
                </button>
              </div>
              <p className="demo-description">{selectedDemo.description}</p>
            </div>

            <div className="auth-divider"><span>or use your own account</span></div>

            <div className="tabs compact-tabs">
              <button type="button" className={mode === 'signin' ? 'tab active' : 'tab'} onClick={() => setMode('signin')}>Sign in</button>
              <button type="button" className={mode === 'signup' ? 'tab active' : 'tab'} onClick={() => setMode('signup')}>Create account</button>
            </div>

            <form onSubmit={submit} className="form-stack compact-form">
              {mode === 'signup' && <label>Full name<input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Grace Akinyi" /></label>}
              <div className={mode === 'signin' ? 'form-row' : ''}>
                <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
                <label>Password<input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" /></label>
              </div>
              {mode === 'signup' && <label>Account type<input value="Retailer" disabled /></label>}
              {message && <div className="notice">{message}</div>}
              <button className="button primary auth-submit" disabled={busy || demoBusy}>{busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
            </form>

            <div className="micro-links"><Link to="/faq">Need help?</Link><span>•</span><span>Demo accounts contain no sensitive data.</span></div>
          </section>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
