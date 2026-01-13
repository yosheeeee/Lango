import { ElectronAPI } from '@electron-toolkit/preload'
import { ControllerHandler } from '../controllers/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: ControllerHandler
  }
}
