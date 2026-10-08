import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import BrandMark from '../components/BrandMark.jsx'
import BackButton from '../components/BackButton.jsx'
import bg from '../assets/gallery/exterior/fortune-evenin01-1.webp'
import waves from '../assets/decor/enquiry-waves.png'

// Set to a URL that accepts a JSON POST ({ name, phone, email, interest, message })
// to deliver enquiries. While empty, the form validates and confirms on screen
// but the details are NOT sent anywhere.
const ENQUIRY_ENDPOINT = ''

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const INTERESTS = ['4 BHK', '5 BHK', '6 BHK', 'Not sure yet']
const GOLD = '#f0b866'
const GOLD_LIGHT = '#ffd58a'

// Underlined fields on the dark panel - the line warms to gold on focus
const field =
  'w-full border-0 border-b border-[rgba(249,228,212,0.22)] bg-transparent px-0 py-2.5 text-[0.875rem] text-cream outline-none transition-colors duration-300 placeholder:text-[rgba(249,228,212,0.45)] focus:border-[#f0b866]'

function Enquiry({ onClose }) {
  const rootRef = useRef(null)
  const [values, setValues] = useState({ name: '', phone: '', email: '', interest: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | failed

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      tl.fromTo('.eq-photo', { scale: 1.08 }, { scale: 1, duration: 2.4 }, 0)
      tl.fromTo('.eq-waves', { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 1.4 }, 0.2)
      tl.fromTo('.eq-top', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.9 }, 0.5)
      tl.fromTo('.eq-line', { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, 0.8)
      tl.fromTo('.eq-fade', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 1.1)
      tl.fromTo('.eq-card > *', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07 }, 0.6)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (values.name.trim().length < 2) e.name = 'Please tell us your name'
    if (values.phone.replace(/\D/g, '').length < 7) e.phone = 'Please enter a valid phone number'
    if (!EMAIL_RE.test(values.email.trim())) e.email = 'Please enter a valid email address'
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

  const Err = ({ k }) => (errors[k] ? <span className="mt-1.5 block text-[0.6875rem] text-[#f0a0a8]">{errors[k]}</span> : null)

  return (
    <section ref={rootRef} className="relative flex min-h-svh w-full flex-col bg-[#0b0507] text-cream md:h-svh md:flex-row md:overflow-hidden">
      {/* Left: photograph under the gold waves */}
      <div className="relative min-h-[22rem] flex-1 overflow-hidden md:min-h-0">
        <img src={bg} alt="" className="eq-photo absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(10,4,6,0) 60%, rgba(10,4,6,0.85) 100%)' }} />
        <img src={waves} alt="" className="eq-waves pointer-events-none absolute bottom-0 left-0 h-full w-auto max-w-none select-none" />

        <button type="button" onClick={onClose} className="eq-top absolute left-5 top-5 z-10 border-none bg-transparent p-0 text-left sm:left-8 md:left-12 md:top-9">
          <BrandMark />
        </button>

        <div className="absolute bottom-8 left-5 z-10 sm:left-8 md:bottom-14 md:left-12">
          <span className="eq-fade flex items-center gap-4 text-[0.625rem] uppercase tracking-[0.4rem] text-cream/90">
            Enquiry <span className="h-px w-10" style={{ background: GOLD }} />
          </span>
          <h2 className="mt-5 font-serif text-[clamp(2.2rem,4vw,3.8rem)] font-normal leading-[1.08] text-cream">
            <span className="block overflow-hidden pb-1"><span className="eq-line block">Let&rsquo;s begin</span></span>
            <span className="block overflow-hidden pb-1"><span className="eq-line block italic" style={{ color: GOLD_LIGHT }}>a conversation.</span></span>
          </h2>
          <p className="eq-fade mt-4 max-w-[19rem] text-[0.875rem] leading-[1.75] text-cream/85">Discover a higher standard of living, above Mumbai Central.</p>
        </div>
      </div>

      {/* Right: the form on the site's near-black, with underlined fields */}
      <div className="relative flex w-full flex-col justify-center bg-[#0e0709] px-6 py-12 md:w-[40%] md:max-w-[34rem] md:overflow-y-auto md:px-12 md:pb-24 md:pt-24 lg:px-16" style={{ borderLeft: '1px solid rgba(240,184,102,0.18)' }}>
        <div className="eq-top absolute right-5 top-5 z-10 sm:right-8 md:right-12 md:top-9">
          <BackButton onClick={onClose} />
        </div>

        {status === 'done' ? (
          <div className="eq-card text-center">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto" aria-hidden="true">
              <circle cx="32" cy="32" r="29" stroke={GOLD} strokeWidth="1.2" />
              <path d="M20 33l8 8 16-17" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="mt-6 font-serif text-[2rem] font-normal text-cream">Thank you</h3>
            <p className="mx-auto mt-3 max-w-[18rem] text-[0.8125rem] leading-relaxed text-cream/70">
              {ENQUIRY_ENDPOINT ? 'We have your details and will be in touch shortly.' : 'Your details are noted on this screen only. Contact delivery is not connected yet.'}
            </p>
            <button type="button" onClick={onClose} className="lux-btn mt-8 rounded-full px-8 py-3 text-[0.625rem] uppercase tracking-[0.25rem]">Back to menu</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="eq-card mt-10 md:mt-0">
            <span className="flex items-center gap-4 text-[0.625rem] uppercase tracking-[0.4rem]" style={{ color: GOLD }}>
              Enquire now <span className="h-px w-10" style={{ background: GOLD }} />
            </span>
            <h3 className="mt-4 font-serif text-[clamp(1.4rem,2vw,2rem)] font-normal leading-tight text-cream">Take the next step towards your new address.</h3>

            <div className="mt-6 flex flex-col gap-3">
              <label className="block">
                <input className={field} placeholder="Full name" value={values.name} onChange={set('name')} autoComplete="name" aria-label="Full name" />
                <Err k="name" />
              </label>
              <label className="block">
                <input className={field} placeholder="Phone number" type="tel" value={values.phone} onChange={set('phone')} autoComplete="tel" aria-label="Phone number" />
                <Err k="phone" />
              </label>
              <label className="block">
                <input className={field} placeholder="Email address" type="email" value={values.email} onChange={set('email')} autoComplete="email" aria-label="Email address" />
                <Err k="email" />
              </label>

              <div className="pt-2">
                <span className="text-[0.5625rem] uppercase tracking-[0.25rem] text-cream/55">Interested in</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {INTERESTS.map((o) => {
                    const on = values.interest === o
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setValues((v) => ({ ...v, interest: on ? '' : o }))}
                        aria-pressed={on}
                        className="lux-btn rounded-full px-4 py-2 text-[0.625rem] uppercase tracking-[0.15rem]"
                        style={on ? { color: GOLD_LIGHT, borderColor: 'rgba(240,184,102,0.8)' } : undefined}
                      >
                        {o}
                      </button>
                    )
                  })}
                </div>
              </div>

              <textarea className={field + ' min-h-[4.5rem] resize-none'} placeholder="Message (optional)" value={values.message} onChange={set('message')} aria-label="Message" />
            </div>

            {status === 'failed' && <p className="mt-4 text-[0.75rem] text-[#f0a0a8]">Something went wrong. Please try again.</p>}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="lux-btn group mt-8 flex w-full items-center justify-between rounded-full px-7 py-4 text-[0.625rem] uppercase tracking-[0.3rem] disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Send enquiry'}
              <svg className="transition-transform duration-300 group-hover:translate-x-1" width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ color: GOLD }}><path d="M1 6h13M9 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default Enquiry
