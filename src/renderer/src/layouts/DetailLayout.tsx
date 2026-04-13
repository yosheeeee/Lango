import { Outlet } from 'react-router-dom'

export default function DetailLayout() {
  return (
    <section className="w-full h-full">
      <Outlet />
    </section>
  )
}
