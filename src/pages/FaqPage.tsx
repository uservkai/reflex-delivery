import { Link } from 'react-router-dom'
import { SiteFooter } from '../components/Layout'

const faqs = [
  ['What is Reflex?', 'Reflex is a delivery-coordination MVP that gives retailers, dispatchers, and riders one shared view of each delivery request.'],
  ['Who can use Reflex?', 'The sprint build has three roles: retailer, dispatcher, and rider. A second rider demo account is included so assignment can be tested with more than one rider.'],
  ['How are deliveries assigned?', 'A retailer creates a request, the dispatcher sees the open request, and the dispatcher assigns it to an available rider.'],
  ['How does delivery confirmation work?', 'At handover, the rider scans the customer confirmation QR. The scan acts as lightweight confirmation before the delivery is completed.'],
  ['What are the demo accounts?', 'The landing page offers Demo Retailer, Demo Dispatcher, Demo Rider, and Demo Rider 2 through one compact selector. They are preconfigured test accounts and should contain no sensitive information.'],
]

export default function FaqPage() {
  return (
    <div className="public-shell">
      <header className="public-topbar"><Link to="/" className="brand brand-link">REFLEX</Link><Link to="/" className="text-link">Back to Reflex</Link></header>
      <main className="legal-page faq-page">
        <span className="eyebrow">Support</span>
        <h1>Frequently Asked Questions</h1>
        <p className="legal-lead">A quick guide to how the Reflex demonstration works.</p>
        <div className="faq-list">
          {faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
