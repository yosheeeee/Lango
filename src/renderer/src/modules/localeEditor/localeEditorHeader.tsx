import { routerPaths } from '@renderer/router/routerPaths'
import { X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import LocaleIcon from '@renderer/components/localeIcon'

export default function LocaleEditorHeader() {
  const { localeName } = useParams<{ localeName: string }>()
  return (
    <section
      id="locale-editor-header"
      className="py-1 px-3 flex items-center text-sm justify-between [&_svg]:size-[16px] border-b border-b-gray-700"
    >
      <div className="flex items-center gap-2">
        <LocaleIcon locale={localeName ?? ''} className="size-[16px] rounded-sm" />
        <p>{localeName}</p>
      </div>
      <Link
        to={routerPaths.editor}
        className="aspect-square h-full cursor-pointer hover:bg-gray-700 items-center flex justify-center rounded-sm text-center transition-colors"
      >
        <X />
      </Link>
    </section>
  )
}
