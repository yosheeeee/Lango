import Store from 'electron-store'
import { AppStore } from './models/appStore'

export default new Store<AppStore>({
  defaults: {
    currentSession: null,
    sessions: []
  }
})
