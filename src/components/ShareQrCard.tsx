import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type ShareQrCardProps = {
  shareUrl: string
}

export function ShareQrCard({ shareUrl }: ShareQrCardProps) {
  const [svgMarkup, setSvgMarkup] = useState<string>('')
  const [foutmelding, setFoutmelding] = useState<string | null>(null)

  useEffect(() => {
    let geannuleerd = false

    void QRCode.toString(shareUrl, {
      type: 'svg',
      margin: 1,
      width: 220,
      color: {
        dark: '#1f2a1f',
        light: '#ffffff',
      },
    })
      .then((markup: string) => {
        if (!geannuleerd) {
          setSvgMarkup(markup)
          setFoutmelding(null)
        }
      })
      .catch((error: Error) => {
        if (!geannuleerd) {
          setSvgMarkup('')
          setFoutmelding((error as Error).message)
        }
      })

    return () => {
      geannuleerd = true
    }
  }, [shareUrl])

  return (
    <section className="share-card paneel-stack" aria-labelledby="share-title">
      <h3 id="share-title">Deel deze persona</h3>
      <p className="support-text">Gebruik de deel-URL of laat medespelers de QR-code scannen.</p>
      <input className="text-input" readOnly value={shareUrl} aria-label="Deel URL" />
      {foutmelding ? (
        <p className="feedback-message error">QR genereren mislukt: {foutmelding}</p>
      ) : svgMarkup ? (
        <div className="qr-frame" aria-label="Persona QR-code" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
      ) : (
        <p className="support-text">QR-code wordt opgebouwd...</p>
      )}
    </section>
  )
}