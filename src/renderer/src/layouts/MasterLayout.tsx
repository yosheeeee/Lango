import { useEditorStore } from '@renderer/stores/visibilityStore'
import { FC } from 'react'

interface MasterLayoutProps {}

const MasterLayout: FC<MasterLayoutProps> = () => {
  const { masterPanel } = useEditorStore()

  if (!masterPanel) return null

  return <section id="master" className="w-[400px] border-r-gray-700 border-r h-full"></section>
}

export default MasterLayout
