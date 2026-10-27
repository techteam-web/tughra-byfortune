import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { MenuControl, BrandCorner } from '../ui/controls.jsx'
import { CORNER } from '../ui/layout.js'
import { glowAt } from '../ui/glow.js'
import { IcArrow, IcBuilding, IcChat, IcDown, IcMail, IcPhone, IcUser } from '../ui/icons.jsx'
import tower from '../assets/render/menu-tower.webp'
import './Enquiry.css'

// Set to a URL that accepts a JSON POST ({ name, phone, email, residence, message }) to deliver
// enquiries. While empty, the form validates and confirms on screen but the details are
// NOT sent anywhere.
const ENQUIRY_ENDPOINT = ''

// the gold curve frame laid over the whole page (transparent PNG, 16:9)
const FRAME = '/assets/fortuneenquire.png'

const RESIDENCES = ['4 BHK', '5 BHK']

const isName = (v) => v.trim().length >= 2
const isPhone = (v) => v.replace(/\D/g, '').length >= 7
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

// a glass box with an icon, a hidden label and the field itself (placeholder as the visible label)
function Field({ id, label, icon: Icon, error, tall = false, children }) {
  return (
    <div className="eq-row">
      <label htmlFor={id} className={`eq-box ${tall ? 'is-tall' : ''} ${error ? 'is-invalid' : ''}`}>
        <span className="sr-only">{label}</span>
        <Icon size={15} strokeWidth={1.3} />
        {children}
        {/* the message sits inside the box, so the form never changes height */}
        {error && (
          <span id={`${id}-err`} className="shrink-0 text-right text-[max(0.8125rem,12px)] leading-[1.2] text-alert" aria-live="polite">
            {error}
          </span>
        )}
      </label>
    </div>
  )
}

// Enquire: the form on the left, the tower at dusk fading in from the right, and the gold curve
// frame laid over it all.
function Enquiry({ onClose }) {
  const rootRef = useRef(null)
  const [values, setValues] = useState({ name: '', phone: '', email: '', residence: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | failed

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.show('.eq-photo-wrap', { duration: 1.4 }), 0)
      if (REDUCED) tl.add(fx.show('.eq-frame', { duration: 0.3 }), 0.2)
      else {
        tl.fromTo('.eq-photo', { scale: 1.08 }, { scale: 1, duration: 2.8, ease: 'power2.out' }, 0)
        tl.fromTo('.eq-frame', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% -2% 0%)', duration: 2, ease: EASE.move }, 0.2)
      }
      tl.add(fx.fade('.eq-top', { y: -10 }), 0.4)
      tl.add(fx.fade('.eq-label', { y: 8, duration: 0.5 }), 0.7)
      tl.add(fx.heading('.eq-line'), 0.8)
      tl.add(fx.fade('.eq-lede', { y: 12 }), 1)
      tl.add(fx.fade('.eq-row', { stagger: 0.07 }), 1.05)
      tl.add(fx.fade('.eq-foot', { y: 10 }), 1.5)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // the thank-you: the ring and the tick draw on
  useLayoutEffect(() => {
    if (status !== 'done') return
    const ctx = gsap.context(() => {
      fx.draw('.eq-done path, .eq-done circle', { stagger: 0.25, duration: 1 })
      fx.fade('.eq-done-copy', { stagger: 0.1, delay: 0.3 })
    }, rootRef)
    return () => ctx.revert()
  }, [status])

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!isName(values.name)) e.name = 'Enter your name'
    if (!isPhone(values.phone)) e.phone = 'Enter a valid number'
    if (!isEmail(values.email)) e.email = 'Enter a valid email'
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

  const firstName = values.name.trim().split(/\s+/)[0]

  return (
    <div ref={rootRef}>
      <section aria-label="Enquire" className="relative isolate min-h-svh w-full overflow-hidden bg-espresso text-cream side:h-svh">
        {/* the photograph, edge to edge: no fade, no gradient anywhere. Wide screens set it a touch
            larger from the left so the tower stands clear of the form; phones get a flat dark tint */}
        <div className="eq-photo-wrap absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 side:origin-top-left side:scale-[1.28] short:origin-center short:scale-100">
            <img src={tower} alt="" draggable={false} fetchPriority="high" className="eq-photo absolute inset-0 h-full w-full select-none object-cover object-[50%_center]" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-espresso/60 side:hidden short:block short:bg-espresso/50" aria-hidden="true" />

        {/* the left of the photograph settles into a calm dusk-dark field behind the form */}
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[58%] backdrop-blur-[4px] [-webkit-mask-image:linear-gradient(90deg,#000_62%,transparent)] [mask-image:linear-gradient(90deg,#000_62%,transparent)] side:block short:w-[70%]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(16,15,22,0.86)_0%,rgba(16,15,22,0.72)_34%,rgba(16,15,22,0.3)_52%,rgba(16,15,22,0)_66%)] side:block" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[22%] bg-[linear-gradient(0deg,rgba(16,15,22,0.6),rgba(16,15,22,0))] side:block" aria-hidden="true" />

        {/* the gold curve frame */}
        <img
          src={FRAME}
          alt=""
          draggable={false}
          className="eq-frame pointer-events-none absolute inset-0 z-[5] h-full w-full select-none object-cover object-[left_bottom] side:object-fill"
        />

        {/* the logo where every page has it; the tagline and the menu top right */}
        <BrandCorner onClick={onClose} className="eq-top left-[5.25rem]! md:left-[7rem]!" />
        <div className={`eq-top ${CORNER}`}>
          <span className="mr-2 hidden items-center gap-4 side:flex short:hidden">
            <span className="font-sans text-[max(0.75rem,12px)] font-light uppercase tracking-[0.34em] text-gold-pale/90">A higher perspective</span>
            <i className="block h-px w-14 bg-gold-pale/70" />
          </span>
          <MenuControl onClick={onClose} />
        </div>

        {/* the form */}
        <div className="eq-col relative z-10 flex min-h-svh flex-col px-6 pb-14 pt-[9.5rem] sm:px-10 side:h-full side:min-h-0 side:w-[47%] side:pb-[5.5rem] side:pl-[clamp(8.5rem,18vw,19rem)] side:pr-0 side:pt-[7rem] short:w-[66%] short:pb-3 short:pl-6 short:pt-[5rem]">
          <div className="my-auto w-full max-w-[20.5rem]">
            {status === 'done' ? (
              <div className="eq-done" role="status">
                <svg width="68" height="68" viewBox="0 0 64 64" fill="none" className="text-gold" aria-hidden="true">
                  <circle cx="32" cy="32" r="29" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
                  <path d="M20 33l8 8 16-17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h2 className="eq-done-copy mt-7 font-serif text-[clamp(2.1rem,3.4vw,3.2rem)] leading-[1.04] text-gold-pale short:mt-3 short:text-[1.6rem]">
                  Thank you{firstName ? `, ${firstName}` : ''}
                </h2>
                <p className="eq-done-copy mt-4 max-w-[26rem] text-[max(1rem,14px)] leading-relaxed text-cream/85">
                  {ENQUIRY_ENDPOINT ? 'We have your details and will be in touch shortly.' : 'Your details are noted on this screen only. Contact delivery is not connected yet.'}
                </p>
                <button type="button" onClick={onClose} onPointerMove={glowAt} className="eq-done-copy tr-btn tr-btn--outline mn-glow mt-9 short:mt-4">
                  Back to menu
                  <IcArrow size={15} className="tr-arrow" />
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <span className="eq-label flex items-center gap-6 short:hidden">
                  <span className="font-sans text-[max(0.8125rem,12px)] font-light uppercase tracking-[0.34em] text-gold-pale/90">Get in touch</span>
                  <i className="block h-px w-20 bg-gold-pale/70" />
                </span>
                <h1 className="mt-3 font-serif text-[clamp(1.85rem,3.1vw,2.9rem)] font-normal uppercase leading-[1.05] tracking-[0.2em] text-gold-pale short:mt-0 short:text-[1.5rem] short:tracking-[0.14em]">
                  <span className="eq-line block">Enquiry</span>
                </h1>
                <p className="eq-lede mt-4 max-w-[19rem] font-sans text-[max(0.875rem,14px)] font-light leading-[1.6] tracking-[0.06em] text-cream short:hidden">
                  Fill in your details and our team will get back to you shortly.
                </p>

                <div className="mt-5 grid gap-2 short:mt-2 short:grid-cols-2 short:gap-x-3 short:gap-y-2">
                  <Field id="eq-name" label="Full name" icon={IcUser} error={errors.name}>
                    <input id="eq-name" className="eq-input" placeholder="Full Name *" value={values.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'eq-name-err' : undefined} />
                  </Field>
                  <Field id="eq-phone" label="Phone number" icon={IcPhone} error={errors.phone}>
                    <input id="eq-phone" className="eq-input" placeholder="Phone Number *" type="tel" inputMode="tel" value={values.phone} onChange={set('phone')} autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'eq-phone-err' : undefined} />
                  </Field>
                  <Field id="eq-email" label="Email address" icon={IcMail} error={errors.email}>
                    <input id="eq-email" className="eq-input" placeholder="Email Address *" type="email" inputMode="email" value={values.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'eq-email-err' : undefined} />
                  </Field>
                  <Field id="eq-unit" label="Preferred unit type" icon={IcBuilding}>
                    <select id="eq-unit" className={`eq-input ${values.residence ? '' : 'is-empty'}`} value={values.residence} onChange={set('residence')}>
                      <option value="">Preferred Unit Type</option>
                      {RESIDENCES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <IcDown size={18} strokeWidth={1.5} className="eq-chevron" />
                  </Field>
                  <div className="short:col-span-2">
                    <Field id="eq-msg" label="Your message (optional)" icon={IcChat} tall>
                      <textarea id="eq-msg" className="eq-input" rows={2} placeholder="Your Message (Optional)" value={values.message} onChange={set('message')} />
                    </Field>
                  </div>
                </div>

                {status === 'failed' && (
                  <p className="mt-4 text-[max(0.875rem,13px)] text-alert" role="alert">
                    Something went wrong. Please try again.
                  </p>
                )}

                <button type="submit" disabled={status === 'sending'} className="eq-row eq-send mt-4 touch-manipulation short:mt-3">
                  {status === 'sending' ? 'Sending…' : 'Submit enquiry'}
                  <IcArrow size={16} />
                </button>
                <p className="eq-row mt-3.5 mx-auto max-w-[19rem] text-center font-sans text-[max(0.75rem,12px)] font-light leading-[1.6] tracking-[0.03em] text-cream/70 short:hidden">
                  By submitting, you agree to be contacted by Tughra Royale regarding your enquiry.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* the address, centred at the foot of the page */}
        <div className="eq-foot pointer-events-none absolute inset-x-0 bottom-[1.9rem] z-10 hidden items-center justify-center gap-6 side:flex short:hidden" aria-hidden="true">
          <i className="block h-px w-12 bg-gold-pale/50" />
          <span className="font-sans text-[max(0.75rem,12px)] font-light uppercase tracking-[0.34em] text-gold-pale/90">Mumbai Central, Mumbai</span>
          <i className="block h-px w-12 bg-gold-pale/50" />
        </div>
      </section>
    </div>
  )
}

export default Enquiry
