import { useModulesVisibility } from '@renderer/providers/ModulesVisibilityProvider'
import { FC } from 'react'

interface MasterLayoutProps {}

const MasterLayout: FC<MasterLayoutProps> = () => {
  const { masterVisibile } = useModulesVisibility()

  if (!masterVisibile) return null

  return <section id="master" className="w-[400px] border-r-gray-700 border-r h-full"></section>
}

export default MasterLayout
