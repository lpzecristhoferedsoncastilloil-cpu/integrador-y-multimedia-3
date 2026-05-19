import Sidebar from './Sidebar'
import { Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children, titulo }) {
  const { usuario } = useAuth()

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-[260px] flex-1 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                {usuario?.nombre?.[0]}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">{usuario?.nombre}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
