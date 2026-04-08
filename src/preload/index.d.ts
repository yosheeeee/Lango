import { ElectronAPI } from '@electron-toolkit/preload'
import { ControllerHandler } from '../controllers/types'
import { Language } from 'src/domain/models/currentLanguage'
import { Session } from 'src/domain/models/session'
import { FileTreeGroup, FileTreeItem } from 'src/domain/models/fileTree'

declare global {
  interface Window {
    electron: ElectronAPI
    api: ControllerHandler
    currentLanguage: Language
    currentSession: Session
    sessions: Session[]
  }
}
