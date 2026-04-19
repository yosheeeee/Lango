import DetailEditor from './detailEditor'
import DetailEmpty from './emply'
import DetailHeader from './components/DetailHeader'
import { ActiveLocalizationSwitcher } from './activeLocalizationSwitcher'
import { NamespaceCtx } from './namespaceContext'

export { DetailEditor, DetailEmpty, DetailHeader, ActiveLocalizationSwitcher, NamespaceCtx }

export default function DetailPage() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <DetailHeader />
      <DetailEditor />
    </div>
  )
}
