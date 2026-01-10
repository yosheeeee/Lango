import { SessionHandler } from './sessionController'

export interface ControllerAPI {
  session: SessionHandler
}

// Тип для использования в renderer
export type ControllerHandler = ControllerAPI
