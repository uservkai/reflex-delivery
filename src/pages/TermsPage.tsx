import { Link } from 'react-router-dom'
import { SiteFooter } from '../components/Layout'

export default function TermsPage() {
  return (
    <div className="public-shell">
      <header className="public-topbar"><Link to="/" className="brand brand-link">REFLEX</Link><Link to="/" className="text-link">Back to Reflex</Link></header>
      <main className="legal-page">
        <span className="eyebrow">Terms</span>
        <h1>Terms of Service</h1>
        <p className="legal-lead">These lightweight terms apply to the Reflex sprint MVP and its public demonstration accounts.</p>
        <section><h2>Demo purpose</h2><p>Reflex is provided as a project demonstration. It is not presented as a production logistics service or a guarantee of delivery performance.</p></section>
        <section><h2>Responsible use</h2><p>Do not enter confidential, financial, medical, or other sensitive personal information into public demo accounts.</p></section>
        <section><h2>Account access</h2><p>Public demo credentials may be shared with multiple visitors. Data created in those accounts may therefore be visible to other people testing the application.</p></section>
        <section><h2>Availability</h2><p>The demo may be changed, reset, interrupted, or removed as the project evolves.</p></section>
        <section><h2>Contact</h2><p>For questions about the project, contact <a href="mailto:hello@reflex.app">hello@reflex.app</a>.</p></section>
      </main>
      <SiteFooter />
    </div>
  )
}
