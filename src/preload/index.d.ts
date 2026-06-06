import { ControllerHandler } from '../controllers/types'

interface Events {
  onFileTreeChanged: (cb: () => void) => () => void
}

interface WindowControls {
  minimize: () => void
  maximize: () => void
  close: () => void
}

declare global {
  interface Window {
    api: ControllerHandler & { events: Events }
    windowControls: WindowControls
  }
}
