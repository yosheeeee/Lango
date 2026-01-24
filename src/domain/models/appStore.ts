import { Language } from './currentLanguage'
import { Session } from './session'

export type AppStore = {
  sessions: Session[]
  currentSession: Session | null
  currentLanguage: Language
}
