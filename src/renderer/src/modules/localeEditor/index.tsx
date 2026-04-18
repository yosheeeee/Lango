import LocaleEditorHeader from './localeEditorHeader'
import LocaleEditor from './localeEditor'

export default function LocaleEditorPage() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <LocaleEditorHeader />
      <LocaleEditor />
    </div>
  )
}
