import { Link, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <div className="brand">REFLEX</div>
          <p>Clear delivery coordination for growing retail teams.</p>
          <span>© 2026 Reflex. All rights reserved.</span>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/faq">FAQ</Link>
          <a href="mailto:hello@reflex.app">hello@reflex.app</a>
        </nav>

        <div className="social-links" aria-label="Social media links">
          <a href="#" aria-label="LinkedIn" title="LinkedIn">in</a>
          <a href="#" aria-label="Instagram" title="Instagram">◎</a>
          <a href="#" aria-label="X" title="X">X</a>
        </div>
      </div>
    </footer>
  )
}

export default function Layout({ profile }: { profile: Profile }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">REFLEX</div>
          <div className="subtitle">Delivery Readiness MVP</div>
        </div>
        <div className="user-area">
          <div className="user-copy">
            <strong>{profile.full_name}</strong>
            <span className="role-pill">{profile.role}</span>
          </div>
          <button className="button ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </header>
      <main className="page-wrap"><Outlet /></main>
      <SiteFooter />
    </div>
  )
}
