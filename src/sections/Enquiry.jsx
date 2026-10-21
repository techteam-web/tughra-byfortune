import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, PAGE_IN } from '../motion/index.js'
import { BackControl, Lockup } from '../ui/controls.jsx'
import { CORNER } from '../ui/layout.js'
import { glowAt } from '../ui/glow.js'
import RibbonStage from '../components/RibbonStage.jsx'
import { IcArrow } from '../ui/icons.jsx'
import tower from '../assets/gallery/exterior/cam-8-goldenhour-01-wm.webp'

// Set to a URL that accepts a JSON POST ({ name, phone }) to deliver enquiries.
// While empty, the form validates and confirms on screen but the details are
// NOT sent anywhere.
const ENQUIRY_ENDPOINT = ''

const isName = (v) => v.trim().length >= 2
const isPhone = (v) => v.replace(/\D/g, '').length >= 7

function Field({ id, label, error, children }) {
  return (
    <div className="eq-row">
      <label htmlFor={id} className="tr-label flex items-center gap-1.5">
        {label}
        <span className="text-[var(--ribbon-main-gold)]" aria-hidden="true">*</span>
      </label>
      {children}
      <span id={`${id}-err`} className="mt-1.5 block min-h-[1rem] text-[0.75rem] leading-4 text-alert" aria-live="polite">
        {error}
      </span>
    </div>
  )
}

// The menu's setting: the tower at golden hour edge to edge, the form in the ribbon panel.
function Enquiry({ onClose }) {
  const rootRef = useRef(null)
  const [values, setValues] = useState({ name: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | failed

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.fade('.eq-top', { y: -10 }), 0.4)
      tl.add(fx.fade('.eq-label', { y: 8, duration: 0.5 }), 0.75)
      tl.add(fx.heading('.eq-line', { stagger: 0.08 }), 0.85)
      tl.add(fx.line('.eq-hair'), 1)
      tl.add(fx.fade('.eq-row', { stagger: 0.08 }), 1.05)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // the thank-you: the ring and the tick draw on
  useLayoutEffect(() => {
    if (status !== 'done') return
    const ctx = gsap.context(() => {
      fx.draw('.eq-done path, .eq-done circle', { stagger: 0.25, duration: 1 })
      fx.fade('.eq-done-copy', { stagger: 0.1, delay: 0.4 })
    }, rootRef)
    return () => ctx.revert()
  }, [status])

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!isName(values.name)) e.name = 'Please tell us your name'
    if (!isPhone(values.phone)) e.phone = 'Please enter a valid phone number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (status === 'sending' || !validate()) return
    setStatus('sending')
    try {
      if (ENQUIRY_ENDPOINT) {
        const res = await fetch(ENQUIRY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
        if (!res.ok) throw new Error('bad status')
      }
      setStatus('done')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div ref={rootRef}>
      <RibbonStage
        image={tower}
        photo="object-[50%_14%]"
        label="Enquire"
        className="[--menu-panel-top:0.72] [--menu-panel-mid:0.78] [--menu-panel-low:0.86]"
        panel={
          <>
            <button type="button" onClick={onClose} aria-label="Back to menu" className="eq-top tr-focus shrink-0 self-start border-none bg-transparent p-0">
              <Lockup />
            </button>

            <div className="flex flex-1 flex-col justify-end side:justify-center">
              {status === 'done' ? (
                <div className="eq-done max-w-[22rem]">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-[var(--ribbon-champagne)]" aria-hidden="true">
                    <circle cx="32" cy="32" r="29" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
                    <path d="M20 33l8 8 16-17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h2 className="eq-done-copy tr-display mt-7 text-[2.6rem]">Thank you</h2>
                  <p className="eq-done-copy mt-4 text-[0.875rem] leading-relaxed text-cream/80">
                    {ENQUIRY_ENDPOINT ? 'We have your details and will be in touch shortly.' : 'Your details are noted on this screen only. Contact delivery is not connected yet.'}
                  </p>
                  <button type="button" onClick={onClose} onPointerMove={glowAt} className="eq-done-copy tr-btn tr-btn--outline mn-glow mt-9">
                    Back to menu
                    <IcArrow size={15} className="tr-arrow" />
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="w-full max-w-[22rem]">
                  <span className="eq-label flex items-center gap-4">
                    <span className="tr-num">07</span>
                    <span className="tr-dash" />
                    <span className="tr-label">Enquire</span>
                  </span>
                  <h1 className="tr-display mt-5 text-[clamp(1.85rem,2.45vw,2.55rem)] short:mt-2 short:text-[1.5rem]">
                    <span className="eq-line block">Begin the</span>
                    <span className="eq-line block">conversation</span>
                  </h1>
                  <i className="eq-hair tr-hair mt-6 w-40 short:hidden" />

                  <div className="mt-7 space-y-2 short:mt-2 short:space-y-0">
                    <Field id="eq-name" label="Full name" error={errors.name}>
                      <input
                        id="eq-name"
                        className="tr-input"
                        placeholder="Your name"
                        value={values.name}
                        onChange={set('name')}
                        autoComplete="name"
                        aria-invalid={!!errors.name}
                        aria-describedby="eq-name-err"
                      />
                    </Field>
                    <Field id="eq-phone" label="Phone number" error={errors.phone}>
                      <input
                        id="eq-phone"
                        className="tr-input"
                        placeholder="+91"
                        type="tel"
                        inputMode="tel"
                        value={values.phone}
                        onChange={set('phone')}
                        autoComplete="tel"
                        aria-invalid={!!errors.phone}
                        aria-describedby="eq-phone-err"
                      />
                    </Field>
                  </div>

                  {status === 'failed' && <p className="mt-1 text-[0.75rem] text-alert">Something went wrong. Please try again.</p>}

                  <button type="submit" disabled={status === 'sending'} onPointerMove={glowAt} className="eq-row tr-btn tr-btn--gold mn-glow mt-3 w-full justify-between short:mt-1">
                    {status === 'sending' ? 'Sending…' : 'Send enquiry'}
                    <IcArrow size={15} className="tr-arrow" />
                  </button>
                </form>
              )}
            </div>
          </>
        }
      >
        <div className={`eq-top ${CORNER}`}>
          <BackControl onClick={onClose} />
        </div>
      </RibbonStage>
    </div>
  )
}

export default Enquiry
