import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import './ImmersiveLayout.css'

export default function ImmersiveLayout() {
  return (
    <div className="immersive-shell">
      <Header tone="immersive" />
      <Outlet />
    </div>
  )
}
