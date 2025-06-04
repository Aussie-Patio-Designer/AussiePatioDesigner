import { Suspense } from "react"
import GazeboFormWrapper from "@/components/gazebo-form-wrapper"
import Image from "next/image"

// Server-side loading component
function ServerFormLoading() {
  return (
    <div className="min-h-screen relative">
      {/* Loading Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading 3D Designer...</p>
          </div>
        </div>
      </div>

      {/* Loading Sidebar */}
      <div className="fixed left-0 top-0 z-10 w-96 h-screen bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col">
        <div className="flex-shrink-0 p-6 border-b border-gray-200/50">
          <h1 className="text-2xl font-bold text-gray-900">Aussie Patio Designer</h1>
          <p className="text-sm text-gray-600">Preparing design interface...</p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading components...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Aussie Patio Designer</h1>
                <p className="text-xs text-gray-500">Professional Patio Inquiry Form</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Image
                src="/images/landscape-logo.png"
                alt="Landscape Construction"
                width={80}
                height={24}
                className="h-6 w-auto object-contain opacity-80"
              />
              <div className="w-px h-6 bg-gray-300"></div>
              <Image
                src="/images/lockyer-sheds-logo.png"
                alt="Lockyer Sheds"
                width={80}
                height={24}
                className="h-6 w-auto object-contain opacity-80"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Suspense */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <Suspense fallback={<ServerFormLoading />}>
          <GazeboFormWrapper />
        </Suspense>
      </div>
    </main>
  )
}
