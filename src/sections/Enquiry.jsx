import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import BackButton from '../components/BackButton.jsx'
import BrandMark from '../components/BrandMark.jsx'
import bg from '../assets/gallery/exterior/fortune-evenin01-1.webp'

// Set to a URL that accepts a JSON POST ({ name, phone, email }) to deliver
// enquiries. While empty, the form validates and confirms on screen but the
// details are NOT sent anywhere.
const ENQUIRY_ENDPOINT = ''

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const validate = (v) => {
  const e = {}
  if (v.name.trim().length < 2) e.name = 'Please enter your name'
  if (v.phone.replace(/\D/g, '').length < 7) e.phone = 'Please enter a valid contact number'
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address'
  return e
}

const ICONS = {
  name: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  email: <path d="M3 6h18v12H3zM3 7l9 7 9-7" />,
}

function Field({ id, label, type = 'text', value, error, onChange, autoComplete, inputMode }) {
  return (
    <div className="enq-field relative">
      <svg className="pointer-events-none absolute left-0 top-[1.55rem] text-gold/80" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[id]}
      </svg>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={label}
        aria-invalid={!!error}
        className="peer w-full border-0 border-b bg-transparent pb-3 pl-8 pr-0 pt-6 text-base text-cream outline-none transition-colors duration-300 placeholder-transparent focus:border-gold"
        style={{ borderColor: error ? '#d96b5f' : 'rgba(243,236,217,0.3)' }}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-8 top-6 origin-left text-base text-cream/60 transition-all duration-300 peer-focus:-translate-x-8 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-x-8 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75"
      >
        {label}
      </label>
      <p className="mt-1.5 h-4 text-[0.6875rem] text-[#f0968c]">{error || ''}</p>
    </div>
  )
}

function Enquiry({ onClose }) {
  const rootRef = useRef(null)
  const parRef = useRef(null)
  const imgRef = useRef(null)
  const [values, setValues] = useState({ name: '', phone: '', email: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | failed

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 })
      tl.fromTo('.enq-line', { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, 0.3)
      tl.fromTo('.enq-in', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.5)
      tl.fromTo('.enq-field', { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.1 }, 0.9)
      gsap.fromTo(imgRef.current, { scale: 1 }, { scale: 1.1, duration: 24, ease: 'none' })
    }, rootRef)

    const el = parRef.current
    const qx = gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' })
    const qy = gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' })
    const onMove = (e) => {
      qx((0.5 - e.clientX / window.innerWidth) * 36)
      qy((0.5 - e.clientY / window.innerHeight) * 24)
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      ctx.revert()
    }
  }, [])

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setStatus('sending')
    try {
      if (ENQUIRY_ENDPOINT) {
        const res = await fetch(ENQUIRY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
        if (!res.ok) throw new Error('bad status')
      } else {
        console.warn('ENQUIRY_ENDPOINT is not set in Enquiry.jsx - this enquiry was not sent.', values)
      }
      setStatus('done')
      gsap.fromTo('.enq-done > *', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' })
    } catch {
      setStatus('failed')
    }
  }

  return (
    <section ref={rootRef} className="relative min-h-svh w-full overflow-x-hidden bg-[#14110f] text-cream">
      {/* Full-bleed photo, drifting with the pointer */}
      <div ref={parRef} className="fixed -inset-[3%]">
        <img ref={imgRef} src={bg} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(10,8,7,0.75)_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(14,11,10,0.9)_0%,rgba(14,11,10,0.55)_45%,rgba(14,11,10,0.35)_100%),linear-gradient(0deg,rgba(14,11,10,0.8)_0%,transparent_40%),linear-gradient(180deg,rgba(14,11,10,0.65)_0%,transparent_22%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(201,162,39,0.2)_0%,transparent_40%)] mix-blend-screen" />

      <div className="relative z-10 flex min-h-svh flex-col">
        <div className="enq-in flex items-start justify-between px-7 py-7 md:px-14 md:py-9">
          <button type="button" onClick={onClose} className="border-none bg-transparent p-0 text-left">
            <BrandMark />
          </button>
          <BackButton onClick={onClose} />
        </div>

        <div className="mx-auto flex w-full max-w-[85rem] flex-1 flex-col justify-center gap-12 px-7 pb-14 pt-4 md:px-14 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          {/* Copy */}
          <div className="lg:max-w-[34rem]">
            <span className="enq-in mb-5 flex items-center gap-3 text-[0.6875rem] uppercase tracking-[0.25rem] text-gold">
              <span className="h-px w-10 bg-gold/70" />
              Enquire
            </span>
            <div className="overflow-hidden pb-2">
              <h2 className="enq-line font-serif text-[clamp(2.5rem,5.8vw,5.5rem)] font-medium leading-[1.02] text-cream">Your seat</h2>
            </div>
            <div className="overflow-hidden pb-2">
              <h2 className="enq-line font-serif text-[clamp(2.5rem,5.8vw,5.5rem)] font-medium italic leading-[1.02] text-gold-light">above the city</h2>
            </div>
            <p className="enq-in mt-6 max-w-md text-[0.9375rem] leading-relaxed text-cream/75">
              Share your details and our team will reach out with plans, availability and a private walkthrough of Tughra Royale.
            </p>
            <ul className="enq-in mt-8 flex flex-col gap-3 text-[0.75rem] uppercase tracking-[0.18rem] text-cream/80">
              {['Private walkthrough', 'Floor plans & availability', 'Personal advisor'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Form */}
          <div className="enq-in w-full lg:w-[28rem] xl:w-[31rem]">
            <div className="rounded-3xl border border-white/15 bg-black/45 p-7 shadow-[0_2rem_5rem_rgba(0,0,0,0.5)] backdrop-blur-2xl md:p-10">
              {status === 'done' ? (
                <div className="enq-done flex flex-col items-center gap-4 py-10 text-center" role="status">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold text-gold-light">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  </span>
                  <h3 className="font-serif text-3xl">Thank you, {values.name.trim().split(' ')[0]}</h3>
                  <p className="max-w-xs text-sm text-cream/70">We have received your enquiry and will be in touch shortly.</p>
                  <button type="button" onClick={onClose} className="mt-3 rounded-full border border-gold/60 bg-transparent px-7 py-3 text-xs uppercase tracking-[0.2rem] text-cream transition-colors hover:bg-gold/15">
                    Back to menu
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="flex flex-col gap-2">
                  <div className="mb-3">
                    <h3 className="font-serif text-3xl font-medium">Request a callback</h3>
                    <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.18rem] text-muted">It takes ten seconds</p>
                  </div>
                  <Field id="name" label="Name" value={values.name} error={errors.name} onChange={set('name')} autoComplete="name" />
                  <Field id="phone" label="Contact Number" type="tel" inputMode="tel" value={values.phone} error={errors.phone} onChange={set('phone')} autoComplete="tel" />
                  <Field id="email" label="Email Address" type="email" value={values.email} error={errors.email} onChange={set('email')} autoComplete="email" />
                  {status === 'failed' && (
                    <p className="text-sm text-[#f0968c]" role="alert">Something went wrong sending your enquiry. Please try again.</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="group mt-4 flex items-center justify-between rounded-full border-none py-2 pl-8 pr-2 text-xs font-semibold uppercase tracking-[0.25rem] text-[#1d1816] transition-all duration-300 hover:brightness-110 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#e3c463,#c9a227)' }}
                  >
                    {status === 'sending' ? 'Sending...' : 'Submit Enquiry'}
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1d1816] text-gold-light transition-transform duration-300 group-hover:translate-x-1">
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 6h13M9 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Enquiry
