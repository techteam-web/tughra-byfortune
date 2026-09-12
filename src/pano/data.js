export const APP_DATA = {
  scenes: [
    {
      id: '0-dji_0086_terrace---1089m_new',
      name: 'DJI_0086_Terrace - 108.9M_new',
      levels: [
        {
          tileSize: 256,
          size: 256,
          fallbackOnly: true,
        },
        {
          tileSize: 512,
          size: 512,
        },
        {
          tileSize: 512,
          size: 1024,
        },
        {
          tileSize: 512,
          size: 2048,
        },
        {
          tileSize: 512,
          size: 4096,
        },
      ],
      faceSize: 3600,
      initialViewParameters: {
        pitch: 0,
        yaw: 0,
        fov: Math.PI / 2,
      },
      linkHotspots: [],
      infoHotspots: [],
    },
  ],
  name: 'Project Title',
  settings: {
    mouseViewMode: 'drag',
    autorotateEnabled: true,
    fullscreenButton: false,
    viewControlButtons: false,
  },
}
