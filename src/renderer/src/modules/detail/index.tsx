import DetailEditor from './detailEditor'
import DetailHeader from './detailHeader'

export default function DetailPage() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <DetailHeader />
      <DetailEditor />
    </div>
  )
}
