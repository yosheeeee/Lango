import { Session } from 'src/models/session'
import { create } from 'zustand'
import { createJSONStorage } from 'zustand/middleware'
import { persist } from 'zustand/middleware'

type SessionState = {
  currentSession: Session | null
  sessions: Session[] | null
}

type SessionAcitons = {
  setSessions: (sessions: Session[]) => void
  setSession: (session: Session) => void
  clearSession: () => void
  clearState: () => void
}

type SessionStore = SessionState & SessionAcitons

const initialState: SessionState = {
  currentSession: null,
  sessions: null
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (session) => set({ currentSession: session }),
      setSessions: (sessions) => set({ sessions }),
      clearState: () => set({ ...initialState }),
      clearSession: () => set({ currentSession: null })
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => sessionStore)
    }
  )
)
