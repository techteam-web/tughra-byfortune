import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import BrandMark from '../components/BrandMark.jsx'
import BackButton from '../components/BackButton.jsx'
import { Specks } from '../components/Ornaments.jsx'
import tower from '../assets/gallery/exterior/cam-8-goldenhour-01-wm.webp'
import waves from '../assets/decor/enquiry-waves.png'

// Set to a URL that accepts a JSON POST ({ name, phone }) to deliver enquiries.
// While empty, the form validates and confirms on screen but the details are
// NOT sent anywhere.
const ENQUIRY_ENDPOINT = ''

// The dark pages' palette: black with a warm cast, gold for every fine detail.
const GOLD = '#f0b866'
const GOLD_LIGHT = '#ffd58a'
const INK = '#14090b'
const ERR = '#ff9a8a'
const GOLD_BTN = 'linear-gradient(135deg,#ffd58a,#e0a24e)'

const isName = (v) => v.trim().length >= 2
const isPhone = (v) => v.replace(/\D/g, '').length >= 7

const input =
  'mt-1.5 w-full border-0 border-b border-[rgba(249,228,212,0.22)] bg-transparent px-0 pb-3 pt-1.5 text-[1rem] text-[#f9e4d4] outline-none transition-colors duration-300 placeholder:text-[rgba(249,228,212,0.3)] focus:border-[#f0b866] [&:-webkit-autofill]:[-webkit-text-fill-color:#f9e4d4] [&:-webkit-autofill]:shadow-[inset_0_0_0_40px_#561430]'

const caption = 'flex items-center gap-1.5 text-[0.5625rem] font-medium uppercase tracking-[0.28rem] text-[rgba(249,228,212,0.6)]'

function Field({ label, error, children }) {
  return (
    <label className="eq-row group block">
      <span className={`${caption} transition-colors duration-300 group-focus-within:text-[#f0b866]`}>
        {label}
        <span style={{ color: GOLD }}>*</span>
      </span>
      {children}
      <span className="mt-1.5 block min-h-[0.875rem] text-[0.6875rem] leading-[0.875rem]" style={{ color: ERR }}>{error}</span>
    </label>
  )
}

const Arrow = () => (
  <svg className="transition-transform duration-300 group-hover:translate-x-1" width="14" height="10" viewBox="0 0 16 12" fill="none" aria-hidden="true">
    <path d="M1 6h13M9 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// The slanted cut. The photo owns the left 62% of the page on desktop and its right edge runs from
// the top corner down and in to 82% of its width; on phones the photo sits on top and its bottom
// edge slants instead. The gold double rule follows the same cut.

function Enquiry({ onClose }) {
  const rootRef = useRef(null)
  const [values, setValues] = useState({ name: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | failed

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      tl.fromTo('.eq-media', { xPercent: -6, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.4, ease: 'power3.inOut' }, 0)
      tl.fromTo('.eq-photo', { scale: 1.16 }, { scale: 1, duration: 2.6, ease: 'power2.out' }, 0)
      tl.fromTo('.eq-waves', { opacity: 0 }, { opacity: 1, duration: 2 }, 0.3)
      tl.fromTo('.eq-rule', { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.8)
      tl.fromTo('.eq-cap', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.9)
      tl.fromTo('.eq-line', { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'power4.out' }, 0.5)
      tl.fromTo('.eq-fade', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.6)
      tl.fromTo('.eq-row', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.85)
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
    <section
      ref={rootRef}
      className="relative flex min-h-svh w-full flex-col overflow-hidden text-cream lg:h-svh lg:flex-row"
      style={{ background: 'radial-gradient(60rem 40rem at 95% 0%, rgba(240,184,102,0.1) 0%, transparent 62%), radial-gradient(52rem 40rem at 75% 45%, rgba(128,30,66,0.5) 0%, transparent 72%), #470d21' }}
    >
      {/* Black marble with flowing gold lines, mirrored into the right-hand corner */}
      <img
        src={waves}
        alt=""
        draggable={false}
        className="eq-waves pointer-events-none absolute -right-[6%] bottom-0 h-[26%] w-auto max-w-none -scale-x-100 select-none opacity-60 mix-blend-screen lg:h-[78%] lg:opacity-70"
        style={{ WebkitMaskImage: 'radial-gradient(120% 105% at 100% 100%, #000 40%, transparent 80%)', maskImage: 'radial-gradient(120% 105% at 100% 100%, #000 40%, transparent 80%)' }}
      />
      <Specks className="z-[1]" />

      {/* ---------- The photograph, cut on a slant ---------- */}
      <div className="eq-media relative z-[2] h-[22rem] w-full shrink-0 sm:h-[26rem] lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[62%]">
        <div className="absolute inset-0 overflow-hidden bg-[#0a0607] [clip-path:polygon(0_0,100%_0,100%_88%,0_100%)] lg:[clip-path:polygon(0_0,100%_0,82%_100%,0_100%)]">
          <img src={tower} alt="Tughra Royale at golden hour" className="eq-photo absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 30%' }} draggable={false} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(8,4,5,0.9) 0%, rgba(8,4,5,0.45) 28%, rgba(8,4,5,0) 56%), linear-gradient(180deg, rgba(8,4,5,0.55) 0%, rgba(8,4,5,0) 24%)' }} />
        </div>

        {/* gold double rule along the cut */}
        <svg className="eq-rule pointer-events-none absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="100" y1="0" x2="82" y2="100" stroke={GOLD} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
          <line x1="101.6" y1="0" x2="83.6" y2="100" stroke={GOLD} strokeOpacity="0.4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <svg className="eq-rule pointer-events-none absolute inset-0 h-full w-full lg:hidden" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="100" x2="100" y2="88" stroke={GOLD} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="103.5" x2="100" y2="91.5" stroke={GOLD} strokeOpacity="0.4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* caption, bottom-left of the photograph */}
        <div className="absolute bottom-0 left-0 px-6 pb-10 sm:px-10 lg:pb-12 lg:pl-14 xl:pl-[4.5rem]">
          <span className="eq-cap flex items-center gap-3 text-[0.5625rem] uppercase tracking-[0.35rem]" style={{ color: GOLD_LIGHT }}>
            <i className="block h-px w-8" style={{ background: GOLD }} />
            Tughra Royale
          </span>
          <p className="eq-cap mt-3 hidden font-serif text-[clamp(1.5rem,2.2vw,2.1rem)] font-normal leading-[1.14] text-cream sm:block">
            The Emperor&rsquo;s Seal,
            <br />
            <span style={{ color: GOLD_LIGHT }}>above Mumbai Central.</span>
          </p>
        </div>
      </div>

      {/* Top bar */}
      <button type="button" onClick={onClose} className="absolute left-5 top-5 z-20 border-none bg-transparent p-0 text-left sm:left-8 md:left-12 md:top-9">
        <BrandMark />
      </button>
      <div className="absolute right-5 top-5 z-20 sm:right-8 md:right-12 md:top-9">
        <BackButton onClick={onClose} />
      </div>

      {/* ---------- The form: just name, phone and send ---------- */}
      <div className="relative z-10 flex flex-1 items-center px-6 pb-12 pt-10 sm:px-10 lg:ml-[62%] lg:px-0 lg:pb-0 lg:pt-0">
        <div className="mx-auto w-full max-w-[26rem] lg:max-w-[24rem] xl:max-w-[26rem]">
          {status === 'done' ? (
            <div className="text-center">
              <svg width="66" height="66" viewBox="0 0 64 64" fill="none" className="mx-auto" aria-hidden="true">
                <circle cx="32" cy="32" r="29" stroke={GOLD} strokeWidth="1.2" />
                <path d="M20 33l8 8 16-17" stroke={GOLD_LIGHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="mt-6 font-serif text-[2.4rem] font-normal text-cream">Thank you</h3>
              <p className="mx-auto mt-3 max-w-[20rem] text-[0.8125rem] leading-relaxed text-cream/70">
                {ENQUIRY_ENDPOINT ? 'We have your details and will be in touch shortly.' : 'Your details are noted on this screen only. Contact delivery is not connected yet.'}
              </p>
              <button type="button" onClick={onClose} className="lux-btn group mx-auto mt-8 flex items-center gap-3 rounded-full px-8 py-3.5 text-[0.625rem] font-medium uppercase tracking-[0.22rem]">
                Back to menu
                <Arrow />
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <span className="eq-fade flex items-center gap-4 text-[0.625rem] uppercase tracking-[0.4rem] text-cream/80">
                <i className="block h-px w-10" style={{ background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
                Enquire
              </span>
              <div className="mt-4 overflow-hidden pb-1.5">
                <h1 className="eq-line font-serif text-[clamp(2.1rem,3.3vw,3.3rem)] font-normal leading-[1.08] text-cream">
                  Begin the
                  <br />
                  <span className="italic" style={{ color: GOLD_LIGHT }}>conversation.</span>
                </h1>
              </div>

              <div className="mt-8 space-y-4">
                <Field label="Full name" error={errors.name}>
                  <input className={input} placeholder="Your name" value={values.name} onChange={set('name')} autoComplete="name" />
                </Field>
                <Field label="Phone number" error={errors.phone}>
                  <input className={input} placeholder="+91" type="tel" value={values.phone} onChange={set('phone')} autoComplete="tel" />
                </Field>
              </div>

              {status === 'failed' && <p className="mt-2 text-[0.75rem]" style={{ color: ERR }}>Something went wrong. Please try again.</p>}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="eq-row group mt-5 flex w-full items-center justify-between rounded-full px-8 py-4 text-[0.6875rem] font-semibold uppercase tracking-[0.25rem] transition-all duration-300 hover:brightness-110 disabled:opacity-60"
                style={{ background: GOLD_BTN, color: INK, boxShadow: '0 0.75rem 2rem rgba(240,184,102,0.25)' }}
              >
                {status === 'sending' ? 'Sending…' : 'Send enquiry'}
                <Arrow />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default Enquiry
