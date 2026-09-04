import { useEffect, useId } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function QrScanner({ onScan, onCancel }: { onScan: (text: string) => void; onCancel: () => void }) {
  const rawId = useId()
  const id = `scanner-${rawId.replace(/:/g, '')}`

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(id, { fps: 10, qrbox: { width: 240, height: 240 } }, false)
    scanner.render(
      (decodedText) => {
        scanner.clear().finally(() => onScan(decodedText))
      },
      () => {},
    )
    return () => { scanner.clear().catch(() => {}) }
  }, [id, onScan])

  return (
    <div className="modal-backdrop">
      <div className="modal card">
        <div className="card-head"><h3>Scan delivery confirmation</h3><button className="button ghost" onClick={onCancel}>Close</button></div>
        <p className="muted">Point the rider device camera at the customer's Reflex QR code.</p>
        <div id={id} />
      </div>
    </div>
  )
}
