import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState
} from 'react'

type ModulesVisibilityState = {
  masterVisibile: boolean
  setMasterVisible: Dispatch<SetStateAction<boolean>>
  toggleMasterVisible: VoidFunction
}

const context = createContext<ModulesVisibilityState>({})

export default function ModulesVisibilityProvider({ children }: PropsWithChildren) {
  const [masterVisibile, setMasterVisible] = useState(true)

  function toggleMasterVisible() {
    setMasterVisible((prev) => !prev)
  }

  return (
    <context.Provider value={{ masterVisibile, setMasterVisible, toggleMasterVisible }}>
      {children}
    </context.Provider>
  )
}

export function useModulesVisibility() {
  const state = useContext(context)
  return state
}
