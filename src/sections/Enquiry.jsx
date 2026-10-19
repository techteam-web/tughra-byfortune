import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, PAGE_IN } from '../motion/index.js'
import { TopBar, BackControl } from '../ui/controls.jsx'
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
        <span className="text-gold" aria-hidden="true">*</span>
      </label>
      {children}
      <span id={`${id}-err`} className="mt-1.5 block min-h-[1rem] text-[0.75rem] leading-4 text-alert" aria-live="polite">
        {error}
      </span>
    </div>
  )
}

// The slanted cut: the photo owns the left 62% of the page on desktop and its right edge runs
// from the top corner down and in to 82% of its width; on phones the photo sits on top and its
// bottom edge slants instead. A bronze double rule draws itself along the cut.
function Enquiry({ onClose }) {
  const rootRef = useRef(null)
  const [values, setValues] = useState({ name: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | failed

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.show('.eq-media', { duration: 1.2 }), 0)
      tl.fromTo('.eq-photo', { scale: 1.04 }, { scale: 1, duration: 2.6, ease: 'power2.out' }, 0)
      tl.add(fx.fade('.tb-anim, .eq-back', { y: -10 }), 0.1)
      tl.add(fx.draw('.eq-rule line', { stagger: 0.15, duration: 1.3 }), 0.4)
      tl.add(fx.fade('.eq-cap', { stagger: 0.1 }), 0.7)
      tl.add(fx.fade('.eq-label'), 0.4)
      tl.add(fx.heading('.eq-line', { stagger: 0.08 }), 0.5)
      tl.add(fx.fade('.eq-row', { stagger: 0.08 }), 0.75)
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
    <section ref={rootRef} className="relative flex min-h-svh w-full flex-col bg-espresso text-cream side:h-svh side:flex-row side:overflow-hidden">
      {/* ---------- The photograph, cut on a slant ---------- */}
      <div className="eq-media relative z-[2] h-[22rem] w-full shrink-0 sm:h-[26rem] side:absolute side:inset-y-0 side:left-0 side:h-auto side:w-[62%] short:w-[56%]">
        <div className="absolute inset-0 overflow-hidden bg-cocoa [clip-path:polygon(0_0,100%_0,100%_88%,0_100%)] side:[clip-path:polygon(0_0,100%_0,82%_100%,0_100%)]">
          <img src={tower} alt="Tughra Royale at golden hour" className="eq-photo absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 30%' }} draggable={false} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, var(--espresso) 0%, var(--scrim) 22%, transparent 56%), linear-gradient(180deg, var(--scrim) 0%, transparent 26%)' }} />
        </div>

        {/* bronze double rule along the cut */}
        <svg className="eq-rule pointer-events-none absolute inset-0 hidden h-full w-full text-bronze side:block" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="100" y1="0" x2="82" y2="100" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="101.6" y1="0" x2="83.6" y2="100" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <svg className="eq-rule pointer-events-none absolute inset-0 h-full w-full text-bronze side:hidden" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="100" x2="100" y2="88" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="103.5" x2="100" y2="91.5" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* caption, bottom-left of the photograph */}
        <div className="absolute bottom-0 left-0 px-6 pb-12 sm:px-10 side:pb-12 side:pl-12 xl:pl-[4.5rem] short:pb-4 short:pl-5">
          <span className="eq-cap tr-label flex items-center gap-3">
            <i className="tr-hair is-pale block w-8" />
            Tughra Royale
          </span>
          <p className="eq-cap mt-3 hidden font-serif text-[clamp(1.6rem,2.3vw,2.2rem)] font-normal leading-[1.14] text-cream sm:block short:hidden">
            The Emperor&rsquo;s Seal,
            <br />
            <span className="text-gold-pale">above Mumbai Central.</span>
          </p>
        </div>
      </div>

      <TopBar onBrand={onClose} sticky fixed>
        <span className="eq-back">
          <BackControl onClick={onClose} />
        </span>
      </TopBar>

      {/* ---------- The form: just name, phone and send ---------- */}
      <div className="relative z-10 flex flex-1 items-center px-6 pb-[max(3rem,var(--safe-b))] pt-10 sm:px-10 side:ml-[62%] side:px-0 side:pb-0 side:pt-0 short:ml-[56%] short:px-5 short:pb-2 short:pt-12">
        <div className="mx-auto w-full max-w-[26rem] side:max-w-[24rem] xl:max-w-[26rem] short:max-w-none">
          {status === 'done' ? (
            <div className="eq-done text-center">
              <svg width="68" height="68" viewBox="0 0 64 64" fill="none" className="mx-auto text-gold" aria-hidden="true">
                <circle cx="32" cy="32" r="29" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1" />
                <path d="M20 33l8 8 16-17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="eq-done-copy mt-7 font-serif text-[2.6rem] font-normal leading-none text-cream">Thank you</h3>
              <p className="eq-done-copy mx-auto mt-4 max-w-[20rem] text-[0.875rem] leading-relaxed text-parchment/85">
                {ENQUIRY_ENDPOINT ? 'We have your details and will be in touch shortly.' : 'Your details are noted on this screen only. Contact delivery is not connected yet.'}
              </p>
              <button type="button" onClick={onClose} className="eq-done-copy tr-btn tr-btn--outline mx-auto mt-9">
                Back to menu
                <IcArrow size={15} className="tr-arrow" />
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="relative">
              <span className="eq-label tr-label flex items-center gap-4">
                Enquire
                <i className="tr-hair block w-10" />
              </span>
              <h1 className="mt-4 font-serif text-[clamp(2.2rem,3.3vw,3.3rem)] font-normal leading-[1.08] text-cream short:mt-2 short:text-[1.7rem]">
                <span className="eq-line block">Begin the</span>
                <span className="eq-line block text-gold-pale">conversation.</span>
              </h1>

              <div className="mt-8 space-y-3 short:mt-3 short:space-y-0">
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

              <button type="submit" disabled={status === 'sending'} className="eq-row tr-btn tr-btn--gold mt-4 w-full justify-between short:mt-1">
                {status === 'sending' ? 'Sending…' : 'Send enquiry'}
                <IcArrow size={15} className="tr-arrow" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default Enquiry
