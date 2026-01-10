import { ElectronAPI } from '@electron-toolkit/preload'
import { SessionHandler } from '../controllers/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      session: SessionHandler
    }
  }
}
