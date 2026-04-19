import LocaleEditorHeader from './components/LocaleEditorHeader'
import LocaleEditor from './localeEditor'

export { LocaleEditorHeader, LocaleEditor }

export default function LocaleEditorPage() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <LocaleEditorHeader />
      <LocaleEditor />
    </div>
  )
}
