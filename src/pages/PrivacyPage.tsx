import { Link } from 'react-router-dom'
import { SiteFooter } from '../components/Layout'

export default function PrivacyPage() {
  return (
    <div className="public-shell">
      <header className="public-topbar"><Link to="/" className="brand brand-link">REFLEX</Link><Link to="/" className="text-link">Back to Reflex</Link></header>
      <main className="legal-page">
        <span className="eyebrow">Privacy</span>
        <h1>Privacy Policy</h1>
        <p className="legal-lead">Reflex is a demonstration delivery-management application. This policy describes how information is handled in the sprint MVP.</p>
        <section><h2>Information used</h2><p>Reflex stores account information and delivery details entered by users, including customer names, phone numbers, addresses, item descriptions, delivery status, rider assignment, and confirmation data.</p></section>
        <section><h2>How information is used</h2><p>Information is used only to support the delivery workflow: creating requests, assigning riders, displaying status, and confirming completed handovers.</p></section>
        <section><h2>Demo accounts</h2><p>Demo accounts are intended for product evaluation and should contain no sensitive or real customer information.</p></section>
        <section><h2>Data services</h2><p>The MVP uses Supabase for authentication, database storage, and realtime updates. A production release would require a fuller privacy review and retention policy.</p></section>
        <section><h2>Contact</h2><p>Questions about this demonstration can be sent to <a href="mailto:hello@reflex.app">hello@reflex.app</a>.</p></section>
      </main>
      <SiteFooter />
    </div>
  )
}
