// One icon language: 24-unit grid, 1.4 stroke, round joins, currentColor.
export function Icon({ size = 18, children, className, strokeWidth = 1.4 }) {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function IcBack(props) {
  return <Icon {...props}><path d="M19 12H5M11 6l-6 6 6 6" /></Icon>
}
export function IcMenu(props) {
  return <Icon {...props}><path d="M5 8h14M5 12h14M5 16h14" /></Icon>
}
export function IcArrow(props) {
  return <Icon {...props}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
}
export function IcPrev(props) {
  return <Icon {...props}><path d="M15 18l-6-6 6-6" /></Icon>
}
export function IcNext(props) {
  return <Icon {...props}><path d="M9 6l6 6-6 6" /></Icon>
}
export function IcUp(props) {
  return <Icon {...props}><path d="M6 15l6-6 6 6" /></Icon>
}
export function IcDown(props) {
  return <Icon {...props}><path d="M6 9l6 6 6-6" /></Icon>
}
export function IcClose(props) {
  return <Icon {...props}><path d="M6 6l12 12M18 6L6 18" /></Icon>
}
export function IcHome(props) {
  return <Icon {...props}><path d="M3.5 11 12 4l8.5 7M5.5 9.5V19a1 1 0 0 0 1 1H10v-5.5h4V20h3.5a1 1 0 0 0 1-1V9.5" /></Icon>
}
export function IcExpand(props) {
  return <Icon {...props}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Icon>
}
export function IcCollapse(props) {
  return <Icon {...props}><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></Icon>
}
export function IcGrid(props) {
  return <Icon {...props}><path d="M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z" /></Icon>
}
export function IcRotate(props) {
  return <Icon {...props}><path d="M20 12a8 8 0 1 1-2.35-5.65M20 4v4.5h-4.5" /></Icon>
}
export function IcSun(props) {
  return <Icon {...props}><>
    <circle cx="12" cy="12" r="3.6" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
  </></Icon>
}
export function IcDusk(props) {
  return <Icon {...props}><path d="M17 17a5 5 0 0 0-10 0M12 4v5M4.9 10.4l1.4 1.4M19.1 10.4l-1.4 1.4M2 17h2M20 17h2M3 20.5h18M9 6.5l3-2.5 3 2.5" /></Icon>
}
export function IcMoon(props) {
  return <Icon {...props}><path d="M20 13.2A8 8 0 1 1 10.8 4 6.3 6.3 0 0 0 20 13.2z" /></Icon>
}

// Floor plan glyphs
export function IcArea(props) {
  return <Icon {...props}><path d="M4 9V4h5M4 4l6 6M20 15v5h-5M20 20l-6-6M15 4h5v5M9 20H4v-5" /></Icon>
}
export function IcSea(props) {
  return <Icon {...props}><path d="M2.5 15.5c1.6 1.3 3.2 1.3 4.8 0s3.2-1.3 4.8 0 3.2 1.3 4.8 0 3.2-1.3 4.6 0M2.5 10.5c1.6 1.3 3.2 1.3 4.8 0s3.2-1.3 4.8 0 3.2 1.3 4.8 0 3.2-1.3 4.6 0" /></Icon>
}
export function IcBed(props) {
  return <Icon {...props}><path d="M3.5 18.5V7.5M3.5 13.5h17v5M20.5 13.5v-2a2.5 2.5 0 0 0-2.5-2.5h-7.5v4.5M6.5 11.5a1.6 1.6 0 1 0 0-.01" /></Icon>
}
export function IcLayers(props) {
  return <Icon {...props}><path d="M12 3.5 21 8.5l-9 5-9-5zM3 13l9 5 9-5" /></Icon>
}
export function IcUnit(props) {
  return <Icon {...props}><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></Icon>
}
export function IcCompass(props) {
  return <Icon {...props}><>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M15.5 8.5l-2 5-5 2 2-5z" />
  </></Icon>
}
export function IcKey(props) {
  return <Icon {...props}><>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l8.5-8.5M16.5 6.5l2 2M14.5 8.5l1.5 1.5" />
  </></Icon>
}
export function IcLiving(props) {
  return <Icon {...props}><path d="M3.5 20V9.5L12 4.5l8.5 5V20M9 20v-6h6v6" /></Icon>
}
export function IcView(props) {
  return <Icon {...props}><>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
  </></Icon>
}
export function IcCheck(props) {
  return <Icon {...props}><path d="M5 12.5l4.5 4.5L19 7.5" /></Icon>
}

// Amenity glyphs
export function IcPool(props) {
  return <Icon {...props}><path d="M2.5 18c1.6 1.2 3.2 1.2 4.8 0s3.2-1.2 4.8 0 3.2 1.2 4.8 0 3.2-1.2 4.6 0M2.5 14c1.6 1.2 3.2 1.2 4.8 0s3.2-1.2 4.8 0 3.2 1.2 4.8 0 3.2-1.2 4.6 0M8 12V5.5a2 2 0 0 1 4 0M16 12V5.5a2 2 0 0 0-4 0M8 8h8" /></Icon>
}
export function IcGym(props) {
  return <Icon {...props}><path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11" /></Icon>
}
export function IcStudio(props) {
  return <Icon {...props}><>
    <circle cx="12" cy="4.8" r="1.8" />
    <path d="M12 7v6M7 10.5l5 2.5 5-2.5M8.5 21l3.5-8 3.5 8M3 21h18" />
  </></Icon>
}
export function IcBanquet(props) {
  return <Icon {...props}><path d="M8 3.5h3l-.3 4.2a1.6 1.6 0 0 1-2.4 0zM13 3.5h3l-.3 4.2a1.6 1.6 0 0 1-2.4 0zM9.5 9v8M14.5 9v8M7 17.5h5M12 17.5h5M3.5 20.5h17" /></Icon>
}
export function IcHall(props) {
  return <Icon {...props}><path d="M3 20.5h18M4.5 8.5h15M12 3.5l8 5H4zM6.5 8.5v12M10 8.5v12M14 8.5v12M17.5 8.5v12" /></Icon>
}
export function IcTheatre(props) {
  return <Icon {...props}><path d="M3.5 5.5h17v10h-17zM8 20h8M12 15.5V20M10 8.5l4 2.5-4 2.5z" /></Icon>
}
export function IcChess(props) {
  return <Icon {...props}><path d="M8 20.5h8M9 17.5h6l-1-4.5h-4zM10 13l-.5-3c-1.5-.8-1.5-3.6.8-4.6.9-1.5 3.1-1.5 3.4 0 1.8 1.3 1.6 4-.2 4.6L13 13" /></Icon>
}
export function IcPaddle(props) {
  return <Icon {...props}><>
    <circle cx="9.5" cy="9.5" r="5.5" />
    <path d="M13.4 13.4l6 6M17.5 5.5a1.6 1.6 0 1 0 0-.01" />
  </></Icon>
}
export function IcLeaf(props) {
  return <Icon {...props}><path d="M5 19c0-8 5-13.5 14.5-14.5C19 14 13.5 19 5.5 19zM5 19 13 11" /></Icon>
}
export function IcDeck(props) {
  return <Icon {...props}><path d="M3.5 20.5h17M5 17.5l4-9h9M9 8.5l-1.5-4M12.5 8.5l-2 9M16.5 8.5l1.5 9" /></Icon>
}
export function IcDiamond(props) {
  return <Icon {...props}><path d="M12 6.5 17.5 12 12 17.5 6.5 12z" /></Icon>
}

// form fields (Enquire)
export function IcUser(props) {
  return <Icon {...props}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 19.5c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></Icon>
}
export function IcPhone(props) {
  return <Icon {...props}><path d="M6.6 4h3l1.4 3.8-1.9 1.3a10.5 10.5 0 0 0 4.8 4.8l1.3-1.9 3.8 1.4v3c0 .9-.7 1.6-1.6 1.6C10.7 18 6 13.3 6 5.6 6 4.7 6.2 4 6.6 4z" /></Icon>
}
export function IcMail(props) {
  return <Icon {...props}><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></Icon>
}
export function IcChat(props) {
  return <Icon {...props}><path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 16H11l-4.5 3.5V16H5a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 5 5z" /><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" /></Icon>
}
export function IcBuilding(props) {
  return <Icon {...props}><path d="M4 9.5 12 5l8 4.5M5 9.5h14M6.5 9.5v8M10 9.5v8M14 9.5v8M17.5 9.5v8M4.5 17.5h15M3.5 20h17" /></Icon>
}
