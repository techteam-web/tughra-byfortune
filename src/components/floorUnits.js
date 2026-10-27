// Edit the figures here. null renders as "To be confirmed" - no numbers are
// invented. iso/plan2d null means that render isn't ready yet - the card
// shows an honest "coming soon" placeholder instead of a broken image.
// Drop 2D plan renders into /public/assets/plans/ and they appear automatically.
//
// isoFrames is the turntable: the frames in /public/isoframes/<id>/ (001.webp ... 120.webp),
// which the isometric view spins through as you drag. They are made from the full render
// sequences, every 5th of 600 frames as WebP. `iso` is the turntable's own first frame, shown
// while the rest load, so the picture does not change when it starts to turn.
const FRAME_COUNT = 120
const frames = (id, count) => Array.from({ length: count }, (_, i) => `/isoframes/${id}/${String(i + 1).padStart(3, '0')}.webp`)
const unit = (id, label, bedrooms) => {
  const isoFrames = frames(id, FRAME_COUNT)
  return { id, label, bedrooms, iso: isoFrames[0], isoFrames, plan2d: null, carpetArea: null }
}

export const UNITS = [unit('4bhk', '4 BHK', 4), unit('5bhk', '5 BHK', 5)]
