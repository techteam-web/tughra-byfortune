import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import BrandMark from '../components/BrandMark.jsx'
import BackButton from '../components/BackButton.jsx'
import bg from '../assets/gallery/exterior/fortune-evenin01-1.webp'

// Set to a URL that accepts a JSON POST ({ name, phone, email, interest, message })
// to deliver enquiries. While empty, the form validates and confirms on screen
// but the details are NOT sent anywhere.
const ENQUIRY_ENDPOINT = ''

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const INTERESTS = ['4 BHK', '5 BHK', '6 BHK', 'Not sure yet']
const GOLD = '#f0b866'
const GOLD_LIGHT = '#ffd58a'
const HAIR = 'rgba(240,184,102,0.3)'

// The form is set on a sheet of cream paper: wine ink, brass rules
const PAPER = '#f6e8d8'
const INK = '#3a0a1b'
const BRASS = '#a9762f'
const FAINT = 'rgba(58,10,27,0.22)'
const ERR = '#a3232f'

const field =
  'w-full border-0 border-b border-[rgba(58,10,27,0.22)] bg-transparent px-0 pb-2.5 pt-1.5 text-[0.9375rem] text-[#3a0a1b] outline-none transition-colors duration-300 placeholder:text-[rgba(58,10,27,0.32)] focus:border-[#a9762f]'

const isName = (v) => v.trim().length >= 2
const isPhone = (v) => v.replace(/\D/g, '').length >= 7
const isEmail = (v) => EMAIL_RE.test(v.trim())

function Err({ message }) {
  return message ? <span className="mt-1.5 block text-[0.6875rem]" style={{ color: ERR }}>{message}</span> : null
}

function Label({ n, children }) {
  return (
    <span className="flex items-baseline gap-3 text-[0.5625rem] font-medium uppercase tracking-[0.3rem] text-[rgba(58,10,27,0.55)] transition-colors duration-300 group-focus-within:text-[#a9762f]">
      <span className="text-[0.6875rem] font-medium tracking-[0.1rem]" style={{ color: BRASS }}>{n}</span>
      {children}
    </span>
  )
}

function Enquiry({ onClose }) {
  const rootRef = useRef(null)
  const [values, setValues] = useState({ name: '', phone: '', email: '', interest: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | failed

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      tl.fromTo('.eq-photo', { scale: 1.08 }, { scale: 1, duration: 2.6 }, 0)
      tl.fromTo('.eq-top', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.9 }, 0.4)
      tl.fromTo('.eq-line', { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, 0.6)
      tl.fromTo('.eq-fade', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.9)
      tl.fromTo('.eq-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.1 }, 0.5)
      tl.fromTo('.eq-row', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07 }, 0.9)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!isName(values.name)) e.name = 'Please tell us your name'
    if (!isPhone(values.phone)) e.phone = 'Please enter a valid phone number'
    if (!isEmail(values.email)) e.email = 'Please enter a valid email address'
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

  const done = [isName(values.name), isPhone(values.phone), isEmail(values.email)]
  const doneCount = done.filter(Boolean).length

  return (
    <section ref={rootRef} className="relative w-full overflow-x-hidden bg-[#1c040d] text-cream md:h-svh md:overflow-y-auto">
      {/* The tower stays visible: a wine veil that deepens only at the edges */}
      <img src={bg} alt="" className="eq-photo pointer-events-none fixed inset-0 h-full w-full object-cover object-center md:absolute" />
      <div
        className="pointer-events-none fixed inset-0 md:absolute"
        style={{ background: 'linear-gradient(90deg, rgba(28,4,13,0.9) 0%, rgba(28,4,13,0.5) 42%, rgba(28,4,13,0.62) 100%)' }}
      />

      <button type="button" onClick={onClose} className="eq-top absolute left-5 top-5 z-20 border-none bg-transparent p-0 text-left sm:left-8 md:left-12 md:top-9">
        <BrandMark />
      </button>
      <div className="eq-top absolute right-5 top-5 z-20 sm:right-8 md:right-12 md:top-9">
        <BackButton onClick={onClose} />
      </div>

      <div className="relative z-10 mx-auto grid min-h-svh w-full max-w-[80rem] items-center gap-12 px-5 pb-14 pt-32 sm:px-8 md:px-12 md:pb-16 md:pt-28 lg:grid-cols-[1fr_minmax(0,36rem)] lg:gap-20">
        {/* Left: the invitation */}
        <div>
          <span className="eq-fade flex items-center gap-4 text-[0.625rem] uppercase tracking-[0.4rem] text-cream/80">
            Enquire <span className="h-px w-12" style={{ background: GOLD }} />
          </span>
          <h2 className="mt-6 font-serif text-[clamp(2.8rem,5.4vw,5rem)] font-normal leading-[1.02] text-cream">
            <span className="block overflow-hidden pb-1"><span className="eq-line block">Let&rsquo;s begin</span></span>
            <span className="block overflow-hidden pb-1"><span className="eq-line block italic" style={{ color: GOLD_LIGHT }}>a conversation.</span></span>
          </h2>
          <p className="eq-fade mt-6 max-w-[24rem] text-[0.9375rem] leading-[1.8] text-cream/80">
            Discover a higher standard of living, above Mumbai Central.
          </p>

          <dl className="eq-fade mt-12 flex max-w-[32rem] items-stretch">
            {[
              ['Floors', '24'],
              ['Residences', '4 · 5 · 6 BHK'],
              ['Address', 'Mumbai Central'],
            ].map(([k, v], i) => (
              <div key={k} className="flex-1 whitespace-nowrap py-1 pr-5" style={{ borderLeft: i ? `1px solid ${HAIR}` : 'none', paddingLeft: i ? '1.25rem' : 0 }}>
                <dt className="text-[0.5625rem] uppercase tracking-[0.25rem] text-cream/50">{k}</dt>
                <dd className="mt-2 text-[1.0625rem] font-medium leading-none text-cream">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: the form, on a sheet of paper */}
        <div
          className="eq-card relative w-full px-6 py-8 sm:px-10 sm:py-9"
          style={{ background: PAPER, color: INK, boxShadow: '0 2.5rem 6rem -1.5rem rgba(10,2,6,0.7)' }}
        >
          <span className="pointer-events-none absolute inset-2 sm:inset-2.5" style={{ border: `1px solid ${BRASS}`, opacity: 0.4 }} />

          {status === 'done' ? (
            <div className="relative py-10 text-center">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto" aria-hidden="true">
                <circle cx="32" cy="32" r="29" stroke={BRASS} strokeWidth="1.2" />
                <path d="M20 33l8 8 16-17" stroke={BRASS} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="mt-6 font-serif text-[2.2rem] font-normal">Thank you</h3>
              <p className="mx-auto mt-3 max-w-[20rem] text-[0.875rem] leading-relaxed" style={{ color: 'rgba(58,10,27,0.7)' }}>
                {ENQUIRY_ENDPOINT ? 'We have your details and will be in touch shortly.' : 'Your details are noted on this screen only. Contact delivery is not connected yet.'}
              </p>
              <button type="button" onClick={onClose} className="mt-8 px-8 py-3.5 text-[0.625rem] font-medium uppercase tracking-[0.25rem] transition-colors duration-300 hover:bg-[#a9762f]" style={{ background: INK, color: GOLD_LIGHT }}>Back to menu</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="relative">
              <div className="eq-row flex items-center justify-between gap-6">
                <span className="text-[0.5625rem] font-medium uppercase tracking-[0.35rem]" style={{ color: BRASS }}>Private enquiry</span>
                <span className="flex items-center gap-3 text-[0.5625rem] uppercase tracking-[0.2rem] text-[rgba(58,10,27,0.5)]">
                  <span className="flex gap-1" aria-hidden="true">
                    {done.map((ok, i) => (
                      <i key={i} className="block h-[3px] w-6 transition-colors duration-500" style={{ background: ok ? BRASS : FAINT }} />
                    ))}
                  </span>
                  {doneCount} of 3
                </span>
              </div>

              <h3 className="eq-row mt-5 font-serif text-[clamp(1.6rem,2.2vw,2rem)] font-normal leading-[1.1]">
                Take the next step towards <span className="italic" style={{ color: BRASS }}>your new address.</span>
              </h3>

              <div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <label className="eq-row group block sm:col-span-2">
                  <Label n="i.">Full name</Label>
                  <input className={field} placeholder="Your name" value={values.name} onChange={set('name')} autoComplete="name" />
                  <Err message={errors.name} />
                </label>
                <label className="eq-row group block">
                  <Label n="ii.">Phone</Label>
                  <input className={field} placeholder="+91" type="tel" value={values.phone} onChange={set('phone')} autoComplete="tel" />
                  <Err message={errors.phone} />
                </label>
                <label className="eq-row group block">
                  <Label n="iii.">Email</Label>
                  <input className={field} placeholder="you@email.com" type="email" value={values.email} onChange={set('email')} autoComplete="email" />
                  <Err message={errors.email} />
                </label>

                <div className="eq-row sm:col-span-2">
                  <span className="flex items-baseline gap-3 text-[0.5625rem] font-medium uppercase tracking-[0.3rem] text-[rgba(58,10,27,0.55)]">
                    <span className="text-[0.6875rem] font-medium tracking-[0.1rem]" style={{ color: BRASS }}>iv.</span>
                    Interested in
                  </span>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {INTERESTS.map((o) => {
                      const on = values.interest === o
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setValues((v) => ({ ...v, interest: on ? '' : o }))}
                          aria-pressed={on}
                          className="px-2 py-3 text-[0.6875rem] font-medium uppercase tracking-[0.12rem] transition-colors duration-300 hover:border-[#a9762f]"
                          style={{
                            border: `1px solid ${on ? INK : 'rgba(58,10,27,0.25)'}`,
                            background: on ? INK : 'transparent',
                            color: on ? GOLD_LIGHT : INK,
                          }}
                        >
                          {o}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <label className="eq-row group block sm:col-span-2">
                  <Label n="v.">Message <span className="normal-case tracking-normal opacity-60">(optional)</span></Label>
                  <textarea className={field + ' min-h-[2.75rem] resize-none'} placeholder="Anything you would like us to know" value={values.message} onChange={set('message')} />
                </label>
              </div>

              {status === 'failed' && <p className="mt-4 text-[0.75rem]" style={{ color: ERR }}>Something went wrong. Please try again.</p>}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="eq-row group mt-7 flex w-full items-center justify-between px-7 py-4 text-[0.6875rem] font-medium uppercase tracking-[0.3rem] transition-colors duration-300 hover:bg-[#a9762f] disabled:opacity-60"
                style={{ background: INK, color: GOLD_LIGHT }}
              >
                {status === 'sending' ? 'Sending…' : 'Send enquiry'}
                <svg className="transition-transform duration-300 group-hover:translate-x-1" width="18" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 6h13M9 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default Enquiry
