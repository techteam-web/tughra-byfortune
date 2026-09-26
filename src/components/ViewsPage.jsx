import React, { useEffect, useLayoutEffect, useRef , useState } from 'react';
import { gsap } from 'gsap';
import Marzipano from 'marzipano';
import { APP_DATA } from "../data"
import '../sections/Menu.css'

const ViewsPage = ({ onClose }) => {

  // --- DATA MAPPING ---
// We map the floors so we can easily look up the exact scene ID based on Time and Floor.

const FLOOR_DATA = [
  { label: 'Terrace', height: '108.9m', day: '18-day_0003_terrace---1089m', evening: '19-evening_0086_terrace---1089m', night: '38-night_0090_terrace---1089m' },
  { label: '17th Floor', height: '104.7m', day: '17-day_0004_17th-floor---1047m', evening: '20-evening_0085_17th-floor---1047m', night: '39-night_0091_17th-floor---1047m' },
  { label: '16th Floor', height: '100.5m', day: '16-day_0005_16th-floor-1005m', evening: '21-evening_0084_16th-floor---1005m', night: '40-night_0092_16th-floor---1005m' },
  { label: '15th Floor', height: '96.6m', day: '15-day_0007_15th-floor---966m', evening: '22-evening_0083_15th-floor---966m', night: '41-night_0093_15th-floor---966m' },
  { label: '14th Floor', height: '92.7m', day: '14-day_0008_14th-floor---927m', evening: '23-evening_0082_14th-floor---927m', night: '42-night_0094_14th-floor---927m' },
  { label: '13th Floor', height: '88.8m', day: '13-day_0009_13th-floor---888', evening: '24-evening_0081_13th-floor---888m', night: '43-night_0095_13th-floor---888m' },
  { label: '12th Floor', height: '84.9m', day: '12-day_0010_12th-floor---849m', evening: '25-evening_0080_12th-floor---849m', night: '44-night_0096_12th-floor---849m' },
  { label: '11th Floor', height: '81m', day: '11-day_0011_11th-floor---81m', evening: '26-evening_0079_11th-floor---81m', night: '45-night_0097_11th-floor---81m' },
  { label: '10th Floor', height: '77.1m', day: '10-day_0012_10th-floor---771m', evening: '27-evening_0078_10th-floor---771m', night: '46-night_0098_10th-floor---771m' },
  { label: '9th Floor', height: '73.2m', day: '9-day_0013_9th-floor---732m', evening: '28-evening_0077_9th-floor---732m', night: '47-night_0099_9th-floor---732m' },
  { label: '8th Floor', height: '69.3m', day: '8-day_0014_8th-floor---693m', evening: '29-evening_0076_8th-floor---693m', night: '48-night_0100_8th-floor--693m' },
  { label: '7th Floor', height: '65.4m', day: '7-day_0016_7th-floor---654m', evening: '30-evening_0075_7th-floor---654m', night: '49-night_0101_7th-floor---654m' },
  { label: '6th Floor', height: '61.5m', day: '6-day_0021_6th-floor---615m', evening: '31-evening_0074_6th-floor---615m', night: '50-night_0102_6th-floor---615m' },
  { label: '5th Floor', height: '57.6m', day: '5-day_0022_5th-floor---576m', evening: '32-evening_0073_5th-floor---576m', night: '51-night_0103_5th-floor---576m' },
  { label: '4th Floor', height: '53.7m', day: '4-day_0023_4th-floor---537m', evening: '33-evening_0072_4th-floor---537m', night: '52-night_0104_4th-floor---537m' },
  { label: '3rd Floor', height: '49.8m', day: '3-day_0024_3rd-floor---498m', evening: '34-evening_0071_3rd-floor---498m', night: '53-night_0105_3rd-floor---498m' },
  { label: '2nd Floor', height: '45.9m', day: '2-day_0025_2nd-floor----459m', evening: '35-evening_0070_2nd-floor---459m', night: '54-night_0106_2nd-floor---459m' },
  { label: '1st Floor', height: '42m', day: '1-day_0026_1st-floor----42m', evening: '36-evening_0069_1st-floor---42m', night: '55-night_0107_1st-floor---42m' },
  { label: 'Podium', height: '37.65m', day: '0-day_0027_podium-hight-3765m', evening: '37-evening_0068_podium-3765m', night: '56-night_0108_podium---3765m' }
];

const TIMES_OF_DAY = ['day', 'evening', 'night'];
const TILE_BASE_PATH = '/Fortune-panos/app-files/tiles';

 const panoElementRef = useRef(null); // Connects to the HTML div
  const viewerRef = useRef(null);      // Stores the Marzipano Viewer instance
  const scenesRef = useRef({});        // Stores all our created scenes

  const autorotateRef = useRef(null); // Ref to store the autorotate configuration
  const backButtonRef = useRef(null); // Ref for the Back button (for future use)
  const panelRef = useRef(null); // Scopes the entrance animation to the settings panel

  // UI State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState('day');
  const [currentFloorIdx, setCurrentFloorIdx] = useState(0); // 0 is Terrace based on our array
  const [isAutoRotating, setIsAutoRotating] = useState(false); // Auto-rotate toggle
  const [hoveredTime, setHoveredTime] = useState(null); // Tracks which time button is hovered, like Menu's activeIndex
  const [hoveredFloorIdx, setHoveredFloorIdx] = useState(null); // Tracks which floor row is hovered, like Menu's activeIndex
  const [handleBackButton, setHandleBackButton] = useState(null); // Placeholder for back button logic


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
        `${TILE_BASE_PATH}/${sceneData.id}/{z}/{f}/{y}/{x}.jpg`,
        { cubeMapPreviewUrl: `${TILE_BASE_PATH}/${sceneData.id}/preview.jpg` }
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

  const handleBackButtonClick = () => {
    onClose?.();
  };

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

  // Same fade + slide-in stagger the Menu uses for its list items
  useLayoutEffect(() => {
    if (isCollapsed) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.panel-item',
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      );
    }, panelRef);
    return () => ctx.revert();
  }, [isCollapsed]);

  // Cinematic entrance for the surrounding chrome, once on mount.
  useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.fromTo(
      '.views-chrome',
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 },
      0.15
    );
    tl.fromTo(
      '.views-hint',
      { opacity: 0, y: 14 },
      { opacity: 0.7, y: 0, duration: 0.7, clearProps: 'opacity' },
      0.3
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

  // Leading icon for each row in the floor list - a rooftop glyph for the Terrace, a doorway glyph for every other floor
  const floorIcon = (label, size = 15) => {
    if (label === 'Terrace') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 21V10l8-6 8 6v11" />
          <path d="M9 21v-6h6v6" />
        </svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 21V7a5 5 0 0 1 10 0v14" />
        <path d="M7 21h10" />
        <path d="M12 21v-4" />
      </svg>
    );
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#0a0908', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* The 360 Canvas */}
      <div
        ref={panoElementRef}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      />

      {/* Top-Left: Back + Auto-Rotate combined pill */}
      <div
        id="top-controls"
        className="views-chrome absolute top-5 left-6 md:top-8 md:left-8 z-20 flex items-center rounded-full"
        style={{
          backgroundColor: 'rgba(10, 9, 8, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <button
          ref={backButtonRef}
          onClick={handleBackButtonClick}
          className="relative flex items-center gap-2.5 px-4 py-2.5 group"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <svg
            className="h-4 w-4 text-white group-hover:text-gold-light transition-colors duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="relative text-white text-xs uppercase tracking-[0.15em] group-hover:text-gold-light transition-colors duration-300 hidden sm:block font-medium">
            Back
            <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gold-light transition-transform duration-300 ease-out group-hover:scale-x-100" />
          </span>
        </button>

        <div id="autorotate" className="flex items-center">
          <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(201, 162, 39, 0.2)' }} />
          <button
            onClick={toggleAutoRotate}
            className="flex items-center gap-2.5 px-4 py-2.5"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isAutoRotating ? '#e3c463' : 'rgba(255,255,255,0.6)',
              transition: 'color 0.2s ease'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            <span className="text-xs uppercase tracking-[0.15em] font-medium hidden sm:block">
              {isAutoRotating ? 'Manual' : 'Auto-Rotate'}
            </span>
          </button>
        </div>
      </div>

      {/* Top-Center Dynamic Panel */}
      <div id="dynamic-panel" className="views-chrome absolute z-10 flex items-center" style={{
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(10, 9, 8, 0.75)',
        padding: '10px 24px',
        borderRadius: '30px',
        gap: '12px',
        border: '1px solid rgba(201, 162, 39, 0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        color: '#f3ecd9',
        backdropFilter: 'blur(16px)'
      }}>
        <span style={{ color: '#e3c463', display: 'flex', alignItems: 'center' }}>{timeIcon(currentTime, 14)}</span>
        <span style={{ fontSize: '12px', fontWeight: '500', letterSpacing: '0.15em', opacity: 0.9 }}>
          {currentTime.toUpperCase()}
          <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 12px' }}>|</span>
          {FLOOR_DATA[currentFloorIdx].label.toUpperCase()}
          <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 12px' }}>|</span>
          {FLOOR_DATA[currentFloorIdx].height}
        </span>
      </div>

      {/* Right Panel: View Settings */}
      {isCollapsed ? (
        /* --- COLLAPSED STATE (Vertical Stack) --- */
        <div className="absolute z-10 flex flex-col items-center rounded-full" style={{
          top: '30px',
          right: '20px',
          gap: '20px',
          backgroundColor: 'rgba(10, 9, 8, 0.82)',
          padding: '20px 15px',
          border: '1px solid rgba(201, 162, 39, 0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(16px)',
        }}>
          {/* Expand Button */}
          <button onClick={() => setIsCollapsed(false)} style={{ background: 'none', border: 'none', color: '#c9a227', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>

          {/* Floor Indicator */}
          <div style={{ color: '#e3c463', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>
            {currentFloorIdx === 0 ? 'TER' : currentFloorIdx === FLOOR_DATA.length - 1 ? 'POD' : `${18 - currentFloorIdx}F`}
          </div>

          {/* Time Indicator */}
          <div style={{ color: '#f3ecd9' }}>{timeIcon(currentTime, 16)}</div>

          {/* Auto-Rotate Icon */}
          <button onClick={toggleAutoRotate} style={{ background: 'none', border: 'none', color: isAutoRotating ? '#c9a227' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
          </button>
        </div>

      ) : (

  <div ref={panelRef} className="views-chrome absolute z-10" style={{ top: '24px', right: '24px', width: '330px' }}>
        {/* Menu Panel */}
        <div style={{
          backgroundColor: 'rgba(10, 9, 8, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '18px 18px 16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          maxHeight: 'calc(100vh - 150px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div className="panel-item" style={{ marginBottom: '16px' }}>
            <div className="flex items-center justify-between">
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontSize: '19px', color: '#f3ecd9', margin: 0 }}>
                View Settings
              </h3>
              {/* Collapse Toggle Button */}
              <button
                onClick={() => setIsCollapsed(true)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#c9a227',
                  color: '#0a0908',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <div style={{ width: '32px', height: '2px', backgroundColor: '#c9a227', marginTop: '8px', borderRadius: '2px' }} />
          </div>

          {/* TIME OF DAY SECTION */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: 'rgba(243,236,217,0.5)', fontSize: '9px', fontWeight: '600', letterSpacing: '0.15em', margin: '0 0 9px 0' }}>TIME OF DAY</h4>
            <div style={{ display: 'flex', gap: '6px' }}>
              {TIMES_OF_DAY.map((time) => {
                const isActive = currentTime === time;
                return (
                  <button
                    key={time}
                    onClick={() => switchSceneSynced(time, currentFloorIdx)}
                    onPointerMove={handleGlowMove}
                    onPointerLeave={handleGlowLeave}
                    onMouseEnter={() => setHoveredTime(time)}
                    onMouseLeave={() => setHoveredTime(null)}
                    className={`panel-item${!isActive && hoveredTime === time ? ' luxury-btn' : ''}`}
                    style={{
                      flex: 1,
                      padding: '7px 4px',
                      borderRadius: '11px',
                      backgroundColor: isActive ? '#cda866' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isActive ? '#e9cf94' : 'rgba(255,255,255,0.08)'}`,
                      color: isActive ? '#1a1610' : 'rgba(243,236,217,0.6)',
                      fontSize: '10px',
                      fontWeight: '500',
                      letterSpacing: '0.03em',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 4px 14px rgba(205, 168, 102, 0.4)' : 'none'
                    }}
                  >
                    {timeIcon(time, 13)}
                    {time === 'day' ? 'Day' : time === 'evening' ? 'Evening' : 'Night'}
                  </button>
                )
              })}
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(201, 162, 39, 0.15)', margin: '0 0 14px 0' }} />

          {/* FLOORS SECTION */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <h4 style={{ color: 'rgba(243,236,217,0.5)', fontSize: '9px', fontWeight: '600', letterSpacing: '0.15em', margin: '0 0 9px 0' }}>SELECT FLOOR</h4>
            {/* Scrollable list of floors */}
            <div style={{ overflowY: 'auto', overflowX: 'hidden', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {FLOOR_DATA.map((floor, idx) => {
                const isActive = currentFloorIdx === idx;
                return (
                  <button
                    key={floor.label}
                    onClick={() => switchSceneSynced(currentTime, idx)}
                    onPointerMove={handleGlowMove}
                    onPointerLeave={handleGlowLeave}
                    onMouseEnter={() => setHoveredFloorIdx(idx)}
                    onMouseLeave={() => setHoveredFloorIdx(null)}
                    className={`panel-item group${!isActive && hoveredFloorIdx === idx ? ' luxury-btn' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '6px 9px',
                      borderRadius: '11px',
                      backgroundColor: isActive ? 'rgba(180, 138, 62, 0.45)' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(227, 196, 99, 0.55)' : hoveredFloorIdx === idx ? 'rgba(227, 196, 99, 0.35)' : 'transparent'}`,
                      color: isActive ? '#f3ecd9' : 'rgba(243,236,217,0.55)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    {/* Icon */}
                    <span style={{
                      width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
                      backgroundColor: isActive ? 'rgba(227, 196, 99, 0.22)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isActive ? 'rgba(227, 196, 99, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isActive ? '#f3ecd9' : 'rgba(243,236,217,0.5)'
                    }}>
                      {floorIcon(floor.label, 12)}
                    </span>
                    {/* Floor Label */}
                    <span style={{ fontSize: '12px', fontWeight: isActive ? '600' : '400', flex: 1, marginLeft: '10px', letterSpacing: '0.01em' }}>
                      {floor.label}
                    </span>
                    {/* Height */}
                    <span style={{ fontSize: '10px', color: isActive ? '#e3c463' : 'rgba(243,236,217,0.4)', fontWeight: '400', letterSpacing: '0.03em' }}>
                      {floor.height}
                    </span>
                    {/* Trailing chevron, brighter on hover via the same luxury-arrow treatment as the Menu list */}
                    <span
                      className="luxury-arrow ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
                      style={{ color: isActive ? '#e3c463' : 'rgba(243,236,217,0.3)' }}
                    >
                      <svg width="9" height="7" viewBox="0 0 16 12" fill="none" aria-hidden="true">
                        <path d="M1 6h13M9 1l5 5-5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                )
              })}
              </div>
             </div>

      </div>
      {/* Collapsible Menu end */}

      </div>
        )}

      {/* Instructions Hint - Bottom Center */}
      <div className="views-hint absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 opacity-70 hover:opacity-95 transition-opacity duration-300 hidden sm:block">
        <div
          className="flex items-center gap-5 px-5 py-2.5 rounded-full"
          style={{
            background: 'rgba(10, 9, 8, 0.75)',
            border: '1px solid rgba(201, 162, 39, 0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span className="text-white/60 text-[10px] uppercase tracking-[0.15em] font-medium">
              Drag to look around
            </span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <span className="text-white/60 text-[10px] uppercase tracking-[0.15em] font-medium">
              Scroll to zoom
            </span>
          </div>
        </div>

      </div>



    </div>
  );
}

export default ViewsPage
