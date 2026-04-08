import { CurrentLanguageHandler } from './currentLanguageController'
import { SessionHandler } from './sessionController'
import { ProjectHandler } from './projectController'

export interface ControllerAPI {
  session: SessionHandler
  currentLanguage: CurrentLanguageHandler
  project: ProjectHandler
}

// Тип для использования в renderer
export type ControllerHandler = ControllerAPI
export type GenericControllerHandler<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R
    ? R extends Promise<unknown>
      ? (...args: P) => R
      : (...args: P) => Promise<R>
    : T[K]
}
