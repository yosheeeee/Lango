import { FileJson2 } from 'lucide-react'

export default function DetailEmpty() {
  return (
    <div className="flex flex-col text-center gap-3 w-full h-full items-center justify-center">
      <FileJson2 className="text-gray-400 size-[70px]" />
      <h2 className="text-2xl">Select namespace in the Project Tree</h2>
    </div>
  )
}
