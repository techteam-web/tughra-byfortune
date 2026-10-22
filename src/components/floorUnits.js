import iso4 from '../assets/gallery/iso/Fortune_4BHK_ISO.jpeg'
import iso5 from '../assets/gallery/iso/Fortune_5BHK_ISO.jpeg'
import iso6 from '../assets/gallery/iso/Fortune_6BHK_ISO.jpg'

// Edit the figures here. null renders as "To be confirmed" - no numbers are
// invented. iso/plan2d null means that render isn't ready yet - the card
// shows an honest "coming soon" placeholder instead of a broken image.
// Drop 2D plan renders into /public/assets/plans/ and they appear automatically.
export const UNITS = [
  { id: '4bhk', label: '4 BHK', bedrooms: 4, iso: iso4, plan2d: null, carpetArea: null },
  { id: '5bhk', label: '5 BHK', bedrooms: 5, iso: iso5, plan2d: null, carpetArea: null },
  { id: '6bhk', label: '6 BHK', bedrooms: 6, iso: iso6, plan2d: null, carpetArea: null },
]
