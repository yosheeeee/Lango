import { vi } from 'vitest'

// Глобальные mock данные для electron-store
const mockStoreData: Record<string, unknown> = {}

// Mock для electron-store - должен быть конструктором
class MockStore {
  constructor(options?: { defaults?: Record<string, unknown> }) {
    if (options?.defaults) {
      Object.entries(options.defaults).forEach(([key, value]) => {
        if (!(key in mockStoreData)) {
          mockStoreData[key] = value
        }
      })
    }
  }

  get<T>(key: string, defaultValue?: T): T {
    return (mockStoreData[key] ?? defaultValue) as T
  }

  set<T>(key: string, value: T): void {
    mockStoreData[key] = value
  }

  delete(key: string): void {
    delete mockStoreData[key]
  }

  clear(): void {
    Object.keys(mockStoreData).forEach((key) => {
      delete mockStoreData[key]
    })
  }

  // Метод для сброса данных между тестами
  static _reset(): void {
    Object.keys(mockStoreData).forEach((key) => {
      delete mockStoreData[key]
    })
  }
}

vi.mock('electron-store', () => ({
  default: MockStore
}))

// Mock для electron
vi.mock('electron', () => ({
  dialog: {
    showOpenDialog: vi.fn()
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(() => null)
  }
}))
