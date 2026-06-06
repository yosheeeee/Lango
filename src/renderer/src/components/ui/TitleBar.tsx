import { Minus, Square, X } from 'lucide-react'

const isMac = navigator.platform.startsWith('Mac')

export function TitleBar(): React.JSX.Element | null {
  return (
    <div
      className="flex items-center h-10 shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {!isMac && <WindowControls />}
    </div>
  )
}

function WindowControls(): React.JSX.Element {
  return (
    <div
      className="ml-auto flex h-full"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <button
        onClick={() => window.windowControls.minimize()}
        className="px-4 h-full flex items-center justify-center hover:bg-gray-700 transition-colors"
      >
        <Minus className="size-4" />
      </button>
      <button
        onClick={() => window.windowControls.maximize()}
        className="px-4 h-full flex items-center justify-center hover:bg-gray-700 transition-colors"
      >
        <Square className="size-3.5" />
      </button>
      <button
        onClick={() => window.windowControls.close()}
        className="px-4 h-full flex items-center justify-center hover:bg-red-500 transition-colors"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
