import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">OpenMindPlus Admin Panel</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/admin/agents"
            className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 transition group"
          >
            <div className="text-3xl mb-3">🤖</div>
            <h2 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition">Agents</h2>
            <p className="text-gray-500 text-sm mt-1">Visual map of all AI agents. Send commands directly.</p>
          </Link>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 opacity-50">
            <div className="text-3xl mb-3">👥</div>
            <h2 className="font-bold text-gray-900 text-lg">Team</h2>
            <p className="text-gray-500 text-sm mt-1">Manage team members. Coming soon.</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 opacity-50">
            <div className="text-3xl mb-3">🚀</div>
            <h2 className="font-bold text-gray-900 text-lg">Projects</h2>
            <p className="text-gray-500 text-sm mt-1">Manage projects. Coming soon.</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 opacity-50">
            <div className="text-3xl mb-3">✉️</div>
            <h2 className="font-bold text-gray-900 text-lg">Messages</h2>
            <p className="text-gray-500 text-sm mt-1">Contact form submissions. Coming soon.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
