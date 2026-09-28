import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Marzipano from 'marzipano';
import { APP_DATA } from "../data"
import BackButton from './BackButton.jsx'
import '../sections/Menu.css'

const ViewsPage = ({ onClose, onHome }) => {

  // --- DATA MAPPING ---
  // We map the floors so we can easily look up the exact scene ID based on Time and Floor.

  const FLOOR_DATA = [
    { label: 'Terrace', short: 'TER', height: '108.9m', day: '18-day_0003_terrace---1089m', evening: '19-evening_0086_terrace---1089m', night: '38-night_0090_terrace---1089m' },
    { label: '17th Floor', short: '17', height: '104.7m', day: '17-day_0004_17th-floor---1047m', evening: '20-evening_0085_17th-floor---1047m', night: '39-night_0091_17th-floor---1047m' },
    { label: '16th Floor', short: '16', height: '100.5m', day: '16-day_0005_16th-floor-1005m', evening: '21-evening_0084_16th-floor---1005m', night: '40-night_0092_16th-floor---1005m' },
    { label: '15th Floor', short: '15', height: '96.6m', day: '15-day_0007_15th-floor---966m', evening: '22-evening_0083_15th-floor---966m', night: '41-night_0093_15th-floor---966m' },
    { label: '14th Floor', short: '14', height: '92.7m', day: '14-day_0008_14th-floor---927m', evening: '23-evening_0082_14th-floor---927m', night: '42-night_0094_14th-floor---927m' },
    { label: '13th Floor', short: '13', height: '88.8m', day: '13-day_0009_13th-floor---888', evening: '24-evening_0081_13th-floor---888m', night: '43-night_0095_13th-floor---888m' },
    { label: '12th Floor', short: '12', height: '84.9m', day: '12-day_0010_12th-floor---849m', evening: '25-evening_0080_12th-floor---849m', night: '44-night_0096_12th-floor---849m' },
    { label: '11th Floor', short: '11', height: '81m', day: '11-day_0011_11th-floor---81m', evening: '26-evening_0079_11th-floor---81m', night: '45-night_0097_11th-floor---81m' },
    { label: '10th Floor', short: '10', height: '77.1m', day: '10-day_0012_10th-floor---771m', evening: '27-evening_0078_10th-floor---771m', night: '46-night_0098_10th-floor---771m' },
    { label: '9th Floor', short: '9', height: '73.2m', day: '9-day_0013_9th-floor---732m', evening: '28-evening_0077_9th-floor---732m', night: '47-night_0099_9th-floor---732m' },
    { label: '8th Floor', short: '8', height: '69.3m', day: '8-day_0014_8th-floor---693m', evening: '29-evening_0076_8th-floor---693m', night: '48-night_0100_8th-floor--693m' },
    { label: '7th Floor', short: '7', height: '65.4m', day: '7-day_0016_7th-floor---654m', evening: '30-evening_0075_7th-floor---654m', night: '49-night_0101_7th-floor---654m' },
    { label: '6th Floor', short: '6', height: '61.5m', day: '6-day_0021_6th-floor---615m', evening: '31-evening_0074_6th-floor---615m', night: '50-night_0102_6th-floor---615m' },
    { label: '5th Floor', short: '5', height: '57.6m', day: '5-day_0022_5th-floor---576m', evening: '32-evening_0073_5th-floor---576m', night: '51-night_0103_5th-floor---576m' },
    { label: '4th Floor', short: '4', height: '53.7m', day: '4-day_0023_4th-floor---537m', evening: '33-evening_0072_4th-floor---537m', night: '52-night_0104_4th-floor---537m' },
    { label: '3rd Floor', short: '3', height: '49.8m', day: '3-day_0024_3rd-floor---498m', evening: '34-evening_0071_3rd-floor---498m', night: '53-night_0105_3rd-floor---498m' },
    { label: '2nd Floor', short: '2', height: '45.9m', day: '2-day_0025_2nd-floor----459m', evening: '35-evening_0070_2nd-floor---459m', night: '54-night_0106_2nd-floor---459m' },
    { label: '1st Floor', short: '1', height: '42m', day: '1-day_0026_1st-floor----42m', evening: '36-evening_0069_1st-floor---42m', night: '55-night_0107_1st-floor---42m' },
    { label: 'Podium', short: 'POD', height: '37.65m', day: '0-day_0027_podium-hight-3765m', evening: '37-evening_0068_podium-3765m', night: '56-night_0108_podium---3765m' }
  ];

  const TIMES_OF_DAY = ['day', 'evening', 'night'];
  const TILE_BASE_PATH = '/Fortune-panos/app-files/tiles';
  const SLIDER_HEIGHT = 'min(40vh, 300px)'; // shared by the slider track and its floor-number ruler

  const panoElementRef = useRef(null); // Connects to the HTML div
  const viewerRef = useRef(null);      // Stores the Marzipano Viewer instance
  const scenesRef = useRef({});        // Stores all our created scenes

  const autorotateRef = useRef(null);   // Ref to store the autorotate configuration
  const flashRef = useRef(null);        // Cinematic flash overlay fired on every scene change
  const toastRef = useRef(null);        // Transient "now viewing" toast
  const toastTimeoutRef = useRef(null);
  const dockRef = useRef(null);         // The bottom control dock — fades on idle
  const topLeftRef = useRef(null);      // Home/Back cluster — fades on idle
  const sliderRef = useRef(null);       // The draggable elevation slider track
  const sliderDraggingRef = useRef(false);
  const lastWheelRef = useRef(0);

  // Real elevation profile of the tower, so the slider represents the actual
  // roofline-to-podium travel rather than just a flat list index.
  const FLOOR_HEIGHTS = FLOOR_DATA.map((f) => parseFloat(f.height));
  const MIN_HEIGHT = Math.min(...FLOOR_HEIGHTS);
  const MAX_HEIGHT = Math.max(...FLOOR_HEIGHTS);
  // 0 at the roofline, 1 at the podium
  const railFractionFor = (idx) => (MAX_HEIGHT - FLOOR_HEIGHTS[idx]) / (MAX_HEIGHT - MIN_HEIGHT);

  // UI State
  const [currentTime, setCurrentTime] = useState('day');
  const [currentFloorIdx, setCurrentFloorIdx] = useState(0); // 0 is Terrace based on our array
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [currentSceneId, setCurrentSceneId] = useState(APP_DATA.scenes[0].id);

  useEffect(() => {
    // 1. Initialize Viewer
    const viewerOpts = { controls: { mouseViewMode: 'drag' } };
    viewerRef.current = new Marzipano.Viewer(panoElementRef.current, viewerOpts);

    //  Setup Autorotate movement
    autorotateRef.current = Marzipano.autorotate({
      yawSpeed: 0.05,        // Speed of rotation (adjust as needed)
      targetPitch: 0,        // Looks straight ahead while rotating
      targetFov: Math.PI / 2 // Standard zoom level
    });

    // 2. Create all scenes
    APP_DATA.scenes.forEach((sceneData) => {
      const source = Marzipano.ImageUrlSource.fromString(
        `${TILE_BASE_PATH}/${sceneData.id}/{z}/{f}/{y}/{x}.jpg`
      );
      const geometry = new Marzipano.CubeGeometry(sceneData.levels);
      const limiter = Marzipano.RectilinearView.limit.traditional(sceneData.faceSize, 100 * Math.PI / 180, 120 * Math.PI / 180);
      const view = new Marzipano.RectilinearView(sceneData.initialViewParameters, limiter);

      scenesRef.current[sceneData.id] = viewerRef.current.createScene({
        source, geometry, view, pinFirstLevel: true
      });
    });

    // 3. Show initial scene (Terrace Day)
    const initialSceneId = FLOOR_DATA[0].day;
    scenesRef.current[initialSceneId].switchTo();

    return () => {
      if (viewerRef.current) viewerRef.current.destroy();
    };
  }, []);

  // Idle system — the whole chrome breathes down to near-invisible after a few
  // seconds of stillness, then snaps back the instant the guest moves or touches
  // the screen, so the panorama itself stays the hero of the page.
  useEffect(() => {
    let timer;
    const wake = () => {
      setIsIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), 4200);
    };
    window.addEventListener('pointermove', wake);
    window.addEventListener('pointerdown', wake);
    window.addEventListener('wheel', wake);
    wake();
    return () => {
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('wheel', wake);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    gsap.to([dockRef.current, topLeftRef.current], {
      opacity: isIdle ? 0.16 : 1,
      y: isIdle ? 10 : 0,
      duration: 0.7,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }, [isIdle]);

  // A brief gold flash + punch-in zoom on the panorama itself, so every floor
  // or time-of-day change reads as a deliberate cinematic cut rather than a jump cut.
  const triggerSceneTransition = () => {
    if (flashRef.current) {
      gsap.fromTo(
        flashRef.current,
        { opacity: 0 },
        { opacity: 0.4, duration: 0.16, yoyo: true, repeat: 1, ease: 'power1.inOut' }
      );
    }
    if (panoElementRef.current) {
      gsap.fromTo(
        panoElementRef.current,
        { scale: 1.025, filter: 'brightness(1.35)' },
        { scale: 1, filter: 'brightness(1)', duration: 0.7, ease: 'power3.out' }
      );
    }
  };

  // A transient "now viewing" toast — feedback without permanent on-screen clutter.
  const showToast = (floorIdx, time) => {
    if (!toastRef.current) return;
    toastRef.current.textContent = `${FLOOR_DATA[floorIdx].label.toUpperCase()}  ·  ${time.toUpperCase()}  ·  ${FLOOR_DATA[floorIdx].height}`;
    gsap.killTweensOf(toastRef.current);
    gsap.fromTo(
      toastRef.current,
      { opacity: 0, y: -10, scale: 0.96, filter: 'blur(4px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power3.out' }
    );
    clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      gsap.to(toastRef.current, { opacity: 0, y: -8, duration: 0.5, ease: 'power2.in' });
    }, 1900);
  };

  // Sync function logic
  const switchSceneSynced = (newTime, newFloorIdx) => {
    const viewer = viewerRef.current;
    const oldScene = viewer.scene();

    // Look up the exact scene ID from our data array
    const targetSceneId = FLOOR_DATA[newFloorIdx][newTime];
    const newScene = scenesRef.current[targetSceneId];

    if (oldScene && newScene) {
      const oldView = oldScene.view();
      newScene.view().setParameters({
        yaw: oldView.yaw(),
        pitch: oldView.pitch(),
        fov: oldView.fov()
      });

      newScene.switchTo();
      triggerSceneTransition();
      showToast(newFloorIdx, newTime);
      setCurrentTime(newTime);
      setCurrentFloorIdx(newFloorIdx);
    }
  };

  const switchSceneById = (sceneId) => {
    const scene = scenesRef.current[sceneId];
    if (!scene) return;

    scene.switchTo();
    setCurrentSceneId(sceneId);
  };

  // Toggle Auto Rotate
  const toggleAutoRotate = () => {
    const viewer = viewerRef.current;
    if (isAutoRotating) {
      viewer.stopMovement();
      viewer.setIdleMovement(Infinity, null);
    } else {
      viewer.startMovement(autorotateRef.current);
      viewer.setIdleMovement(3000, autorotateRef.current);
      // Restarts auto-rotate 3 seconds after user stops dragging
    }
    setIsAutoRotating(!isAutoRotating);
  };

  const handleBackButtonClick = () => onClose?.();
  const handleHomeButtonClick = () => onHome?.();

  // Same cursor-tracked copper glow used by the Menu's list items
  const handleGlowMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const clampedX = Math.max(4, Math.min(96, x));
    e.currentTarget.style.setProperty('--mx', `${clampedX}%`);
  };
  const handleGlowLeave = (e) => {
    e.currentTarget.style.setProperty('--mx', '50%');
  };

  // --- Elevation Slider: a single continuous gold-fill track, dragged or
  // clicked directly — the building becomes something you physically scrub
  // through, roofline at the top, podium at the bottom.
  const floorFromPointer = (clientY) => {
    const el = sliderRef.current;
    if (!el) return currentFloorIdx;
    const rect = el.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    let best = 0;
    let bestDist = Infinity;
    FLOOR_DATA.forEach((_, idx) => {
      const dist = Math.abs(railFractionFor(idx) - fraction);
      if (dist < bestDist) {
        bestDist = dist;
        best = idx;
      }
    });
    return best;
  };

  const handleSliderPointerDown = (e) => {
    sliderDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const idx = floorFromPointer(e.clientY);
    if (idx !== currentFloorIdx) switchSceneSynced(currentTime, idx);
  };
  const handleSliderPointerMove = (e) => {
    if (!sliderDraggingRef.current) return;
    const idx = floorFromPointer(e.clientY);
    if (idx !== currentFloorIdx) switchSceneSynced(currentTime, idx);
  };
  const handleSliderPointerUp = () => {
    sliderDraggingRef.current = false;
  };
  const handleSliderWheel = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheelRef.current < 90) return;
    lastWheelRef.current = now;
    stepFloor(e.deltaY > 0 ? 1 : -1);
  };

  const stepFloor = (dir) => {
    const next = Math.min(FLOOR_DATA.length - 1, Math.max(0, currentFloorIdx + dir));
    if (next !== currentFloorIdx) switchSceneSynced(currentTime, next);
  };

  // Cinematic entrance for the surrounding chrome, once on mount — a soft
  // focus-pull (blur + scale) rather than a plain fade, so the controls feel
  // like they resolve out of the panorama itself.
  useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(
      '.views-chrome',
      { opacity: 0, y: 16, scale: 0.94, filter: 'blur(6px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.85, stagger: 0.1, clearProps: 'filter,scale' },
      0.2
    );
    return () => tl.kill();
  }, []);

  // Small line-icon set for the time-of-day picker
  const timeIcon = (time, size = 16) => {
    if (time === 'day') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    }
    if (time === 'evening') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 18a5 5 0 0 0-10 0" />
          <line x1="12" y1="9" x2="12" y2="2" />
          <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
          <line x1="1" y1="18" x2="3" y2="18" />
          <line x1="21" y1="18" x2="23" y2="18" />
          <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
          <line x1="23" y1="22" x2="1" y2="22" />
          <polyline points="16 5 12 9 8 5" />
        </svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#0a0908', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", overflow: 'hidden' }}>
      {/* The 360 Canvas */}
      <div
        ref={panoElementRef}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, transformOrigin: '50% 50%', willChange: 'transform, filter' }}
      />

      {/* Gold flash fired on every scene switch, for a deliberate cinematic cut */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 z-[6]"
        style={{ opacity: 0, background: 'radial-gradient(circle at 50% 50%, rgba(227,196,99,0.55) 0%, rgba(227,196,99,0) 70%)' }}
      />

      {/* Top-Left: Home + Back, unobtrusive, fades with the rest of the chrome on idle */}
      <div
        ref={topLeftRef}
        className="views-chrome absolute top-5 left-6 md:top-8 md:left-8 z-20 flex items-center gap-3"
      >
        <BackButton onClick={handleHomeButtonClick} label="Home" icon="home" />
        <BackButton onClick={handleBackButtonClick} label="Back" icon="arrow" />
      </div>

      {/* "Now viewing" toast — appears only when the scene actually changes */}
      <div
        ref={toastRef}
        className="pointer-events-none absolute z-20 whitespace-nowrap"
        style={{
          top: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0,
          padding: '9px 20px',
          borderRadius: '999px',
          backgroundColor: 'rgba(10, 9, 8, 0.8)',
          border: '1px solid rgba(201, 162, 39, 0.3)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(14px)',
          color: '#f3ecd9',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.14em',
        }}
      />

      {/* Right-Centre Dock — a single vertical control column: time of day,
          the elevation scrubber (a physical reel of the tower's floors), and
          auto-rotate, stacked top to bottom like a lift's own control panel. */}
      <div
        ref={dockRef}
        className="views-chrome absolute z-20"
        style={{ top: 'calc(50% - 320px)', right: '22px', transform: 'translateY(-50%)' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: '76px',
            padding: '14px 0',
            borderRadius: '30px',
            backgroundColor: 'rgba(10, 9, 8, 0.72)',
            border: '1px solid rgba(201, 162, 39, 0.25)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
            backdropFilter: 'blur(20px)',
            overflow: 'visible',
          }}
        >
          {/* Segmented time-of-day, stacked */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '999px', padding: '3px' }}>
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '3px',
                right: '3px',
                top: `calc(${TIMES_OF_DAY.indexOf(currentTime) * 33.333}% + 3px)`,
                height: 'calc(33.333% - 6px)',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #e9cf94, #b48a3e)',
                boxShadow: '0 4px 14px rgba(205, 168, 102, 0.45)',
                transition: 'top 0.4s cubic-bezier(0.65, 0, 0.35, 1)',
              }}
            />
            {TIMES_OF_DAY.map((time) => {
              const isActive = currentTime === time;
              return (
                <button
                  key={time}
                  onClick={() => switchSceneSynced(time, currentFloorIdx)}
                  aria-label={time}
                  className="relative flex items-center justify-center"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '999px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? '#1a1610' : 'rgba(227,196,99,0.65)',
                    transition: 'color 0.35s ease',
                  }}
                >
                  {timeIcon(time, 14)}
                </button>
              );
            })}
          </div>

          <div style={{ width: '32px', height: '1px', background: 'rgba(201, 162, 39, 0.2)' }} />

          <button
            onClick={toggleAutoRotate}
            onPointerMove={handleGlowMove}
            onPointerLeave={handleGlowLeave}
            aria-label={isAutoRotating ? 'Switch to manual view' : 'Auto-rotate'}
            className={`group relative flex items-center justify-center rounded-full border transition-colors duration-300 luxury-btn flex-shrink-0 ${
              isAutoRotating ? 'border-gold-light/70 bg-black/40' : 'border-white/15 bg-white/[0.03]'
            }`}
            style={{ width: '34px', height: '34px', color: isAutoRotating ? '#e3c463' : 'rgba(227,196,99,0.7)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isAutoRotating ? 'animate-spin-slow' : ''}>
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>

          <div style={{ width: '32px', height: '1px', background: 'rgba(201, 162, 39, 0.2)' }} />

          {/* The elevation slider — one continuous gold-fill track, dragged or
              tapped directly, with every floor number marked beside it so the
              guest can aim straight for the one they want. */}
          <div className="flex items-center" style={{ gap: '6px' }}>
            {/* Floor ruler — a static number beside every floor's true position */}
            <div style={{ position: 'relative', width: '20px', height: SLIDER_HEIGHT, flexShrink: 0 }}>
              {FLOOR_DATA.map((floor, idx) => {
                const isActive = currentFloorIdx === idx;
                return (
                  <button
                    key={floor.label}
                    onClick={() => switchSceneSynced(currentTime, idx)}
                    aria-label={`${floor.label} — ${floor.height}`}
                    className="absolute right-0"
                    style={{
                      bottom: `${(1 - railFractionFor(idx)) * 100}%`,
                      transform: 'translateY(50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px 3px',
                      fontSize: isActive ? '9.5px' : '7.5px',
                      fontWeight: isActive ? 800 : 500,
                      color: isActive ? '#f9e9c2' : 'rgba(227,196,99,0.4)',
                      textShadow: isActive ? '0 0 8px rgba(227,196,99,0.8)' : 'none',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {floor.short}
                  </button>
                );
              })}
            </div>

            <div
              ref={sliderRef}
              onPointerDown={handleSliderPointerDown}
              onPointerMove={handleSliderPointerMove}
              onPointerUp={handleSliderPointerUp}
              onPointerLeave={handleSliderPointerUp}
              onWheel={handleSliderWheel}
              style={{
                position: 'relative',
                width: '14px',
                flexShrink: 0,
                height: SLIDER_HEIGHT,
                borderRadius: '999px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                cursor: 'grab',
                touchAction: 'none',
              }}
            >
              {/* Gold fill — height mirrors the active floor's real elevation */}
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0"
                style={{
                  height: `${(1 - railFractionFor(currentFloorIdx)) * 100}%`,
                  borderRadius: '999px',
                  background: 'linear-gradient(180deg, #f9e9c2 0%, #e3c463 45%, #b48a3e 100%)',
                  boxShadow: '0 0 16px rgba(227,196,99,0.55)',
                  transition: sliderDraggingRef.current ? 'none' : 'height 0.5s cubic-bezier(0.65, 0, 0.35, 1)',
                }}
              />
              {/* Thumb marking the exact floor position */}
              <div
                className="pointer-events-none absolute left-1/2"
                style={{
                  bottom: `${(1 - railFractionFor(currentFloorIdx)) * 100}%`,
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  transform: 'translate(-50%, 50%)',
                  background: '#fdf6e3',
                  border: '2px solid #e3c463',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.4), 0 0 12px rgba(227,196,99,0.7)',
                  transition: sliderDraggingRef.current ? 'none' : 'bottom 0.5s cubic-bezier(0.65, 0, 0.35, 1)',
                }}
              />
            </div>
          </div>

          <button
            onClick={() => stepFloor(1)}
            disabled={currentFloorIdx === FLOOR_DATA.length - 1}
            aria-label="Next floor down"
            style={{
              width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none',
              color: currentFloorIdx === FLOOR_DATA.length - 1 ? 'rgba(227,196,99,0.25)' : 'rgba(227,196,99,0.75)',
              cursor: currentFloorIdx === FLOOR_DATA.length - 1 ? 'default' : 'pointer',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', paddingTop: '2px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e3c463" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
              <circle cx="12" cy="9.5" r="2.3" />
            </svg>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#e3c463', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {FLOOR_DATA[currentFloorIdx].height}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewsPage
