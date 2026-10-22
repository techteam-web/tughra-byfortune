import iso4 from '../assets/gallery/iso/Fortune_4BHK_ISO.jpeg'
import iso5 from '../assets/gallery/iso/Fortune_5BHK_ISO.jpeg'
import iso6 from '../assets/gallery/iso/Fortune_6BHK_ISO.jpg'

// Edit the figures here. null renders as "To be confirmed" - no numbers are
// invented. iso/plan2d null means that render isn't ready yet - the card
// shows an honest "coming soon" placeholder instead of a broken image.
// Drop 2D plan renders into /public/assets/plans/ and they appear automatically.
//
// isoFrames is the turntable: the frames in /public/isoframes/<id>/, which the
// isometric view spins through as you drag. `iso` stays as the still shown
// while those frames load, and as the fallback if they are missing.
const frames = (id, count) => Array.from({ length: count }, (_, i) => `/isoframes/${id}/frame_${String(i + 1).padStart(3, '0')}.webp`)

export const UNITS = [
  { id: '4bhk', label: '4 BHK', bedrooms: 4, iso: iso4, isoFrames: frames('4bhk', 15), plan2d: null, carpetArea: null },
  { id: '5bhk', label: '5 BHK', bedrooms: 5, iso: iso5, isoFrames: frames('5bhk', 15), plan2d: null, carpetArea: null },
  { id: '6bhk', label: '6 BHK', bedrooms: 6, iso: iso6, isoFrames: frames('6bhk', 15), plan2d: null, carpetArea: null },
]
