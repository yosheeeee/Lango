import { ControllerHandler } from '../controllers/types'

interface Events {
  onFileTreeChanged: (cb: () => void) => () => void
}

declare global {
  interface Window {
    api: ControllerHandler & { events: Events }
  }
}
