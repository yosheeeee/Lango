import { routerPaths } from '@renderer/router/routerPaths'
import { FileJson2, X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

export default function DetailHeader() {
  const { filePath } = useParams()
  return (
    <section
      id="detail-header"
      className="py-1 px-3 flex itesm-center text-sm justify-between [&_svg]:size-[16px] border-b border-b-gray-700"
    >
      <div className="flex items-center gap-2">
        <FileJson2 />
        <p>{filePath}</p>
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
