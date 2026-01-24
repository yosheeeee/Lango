import { ElectronAPI } from '@electron-toolkit/preload'
import { ControllerHandler } from '../controllers/types'
import { Language } from 'src/domain/models/currentLanguage'

declare global {
  interface Window {
    electron: ElectronAPI
    api: ControllerHandler
    currentLanguage: Language
  }
}
