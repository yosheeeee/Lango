import { Session } from 'src/domain/models/session'
import { create } from 'zustand'

type SessionState = {
  currentSession: Session | null
  sessions: Session[] | null
}

type SessionAcitons = {
  setSessions: (sessions: Session[] | ((prev: Session[]) => Session[])) => void
  setSession: (session: Session) => void
  clearSession: () => void
  clearState: () => void
}

type SessionStore = SessionState & SessionAcitons

const initialState: SessionState = {
  currentSession: null,
  sessions: null
}

export async function initializeSessionStore(): Promise<void> {
  try {
    const sessions = await window.api.session.getSessions()
    const currentSession = await window.api.session.getCurrentSession()
    useSessionStore.setState({ sessions: sessions ?? [], currentSession })
  } catch {
    useSessionStore.setState({ sessions: [], currentSession: null })
  }
}

export const useSessionStore = create<SessionStore>()((set) => ({
  ...initialState,
  setSession: (session) => set({ currentSession: session }),
  setSessions: (sessions) =>
    set((prev) => ({
      sessions: typeof sessions === 'function' ? sessions(prev.sessions ?? []) : sessions
    })),
  clearState: () => set({ ...initialState }),
  clearSession: () => set({ currentSession: null })
}))
