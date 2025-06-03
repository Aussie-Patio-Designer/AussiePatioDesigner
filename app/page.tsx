import GazeboInquiryForm from "@/components/gazebo-inquiry-form"
import Image from "next/image"

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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <GazeboInquiryForm />
      </div>
    </main>
  )
}
