import { CurrentLanguageHandler } from './currentLanguageController'
import { SessionHandler } from './sessionController'

export interface ControllerAPI {
  session: SessionHandler
  currentLanguage: CurrentLanguageHandler
}

// Тип для использования в renderer
export type ControllerHandler = ControllerAPI
export type GenericControllerHandler<S extends Record<string, any>> = {
  [key in keyof S]: (...args: Parameters<S[key]>) => Promise<ReturnType<S[key]>>
}
