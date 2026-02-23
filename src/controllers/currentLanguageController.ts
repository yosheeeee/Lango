import { ipcMain } from 'electron/main'
import currentLanguageService from '../services/currentLanguageService'
import { Language } from '../domain/models/currentLanguage'
import { GenericControllerHandler } from './types'

ipcMain.handle('getCurrentLanguage', () => currentLanguageService.getCurrentLanguage())
ipcMain.handle('setCurrentLanguage', (_, lang: Language) =>
  currentLanguageService.setCurrentLanguage(lang)
)
export type CurrentLanguageHandler = GenericControllerHandler<typeof currentLanguageService>
