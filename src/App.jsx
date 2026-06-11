import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Briefcase, LogOut, Plus, Trash2, TrendingUp, CheckCircle2, Clock, XCircle, Target, Zap, BarChart3 } from 'lucide-react'
import { extractJobDetails } from './gemini'
function App() {
  const [session, setSession] = useState(null)
  const [applications, setApplications] = useState([])
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('Applied')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [editingId, setEditingId] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => authListener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) fetchApplications()
    else setApplications([])
  }, [session])

  const fetchApplications = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('applications').select('*').order('date_added', { ascending: false })
    if (!error) setApplications(data)
    setLoading(false)
  }

  const handleAuth = async () => {
    if (!authEmail || !authPassword) return alert('Please enter email and password')
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword })
      if (error) alert('Signup failed: ' + error.message)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
      if (error) alert('Login failed: ' + error.message)
    }
    setAuthEmail('')
    setAuthPassword('')
  }

  const handleLogout = async () => await supabase.auth.signOut()
const handleExtractWithAI = async () => {
  if (!notes) return alert('Please paste a job description in the notes field first')
  
  setAiLoading(true)
  try {
    const result = await extractJobDetails(notes)
    setCompany(result.company)
    setRole(result.role)
  } catch (error) {
    alert('AI extraction failed. Please check your API key or try again.')
    console.error(error)
  }
  setAiLoading(false)
}
  const handleAddApplication = async () => {
    if (!company || !role) return alert('Please fill in company and role')
    const { data, error } = await supabase.from('applications').insert([{ company, role, status, notes, user_id: session.user.id }]).select()
    if (error) return alert('Failed: ' + error.message)
    setApplications([data[0], ...applications])
    setCompany('')
    setRole('')
    setStatus('Applied')
    setNotes('')
  }

  const handleDeleteApplication = async (id) => {
    const { error } = await supabase.from('applications').delete().eq('id', id)
    if (!error) setApplications(applications.filter((app) => app.id !== id))
  }

  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', id)
    if (error) {
      alert('Failed to update: ' + error.message)
      return
    }
    setApplications(applications.map(app => app.id === id ? { ...app, status: newStatus } : app))
    setEditingId(null)
  }

  const getStatusStyle = (s) => {
    const styles = {
      Applied: 'bg-blue-100 text-blue-800 border-blue-200',
      Interviewing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Offer: 'bg-green-100 text-green-800 border-green-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200',
    }
    return styles[s] || styles.Applied
  }
 const filtered = applications.filter((app) =>
  app.company.toLowerCase().includes(searchTerm.toLowerCase())
)
  const stats = {
    total: applications.length,
    interviewing: applications.filter(a => a.status === 'Interviewing').length,
    offers: applications.filter(a => a.status === 'Offer').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Briefcase className="text-blue-700" size={28} />
              <span className="text-xl font-bold text-slate-900">TrackMyApps</span>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
              Land your dream job, <span className="text-blue-700">organized.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              A focused dashboard to manage every application, interview, and offer, all in one place. Built for serious job seekers.
            </p>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 size={18} className="text-green-600" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 size={18} className="text-green-600" />
                <span>Private & secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 size={18} className="text-green-600" />
                <span>Built for job seekers</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {authMode === 'login' ? 'Welcome back' : 'Get started free'}
            </h2>
            <p className="text-slate-600 mb-6">
              {authMode === 'login' ? 'Log in to your dashboard' : 'Create your account in seconds'}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <button
                onClick={handleAuth}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {authMode === 'login' ? 'Log In' : 'Create Account'}
              </button>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="w-full text-blue-700 hover:underline text-sm"
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-slate-200 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">Why TrackMyApps?</h2>
            <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
              Built by a job seeker, for job seekers. Every feature is designed to save you time.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="text-blue-700" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Stay Organized</h3>
                <p className="text-slate-600 text-sm">Track every application in one place. No more lost spreadsheets or forgotten follow-ups.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="text-green-700" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">See Your Progress</h3>
                <p className="text-slate-600 text-sm">Visual stats show your interviews, offers, and application count at a glance.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-purple-700" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Update Instantly</h3>
                <p className="text-slate-600 text-sm">Click any status badge to update it. Watch your dashboard reflect changes in real time.</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="bg-slate-900 text-slate-400 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm">
              Built by <span className="text-white font-medium">[Gopichand Jetti]</span>
            </p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="text-blue-700" size={28} />
            <span className="text-xl font-bold text-slate-900">TrackMyApps</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:inline">{session.user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 text-sm font-medium"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
          <p className="text-slate-600">Track and manage all your job applications in one place.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <TrendingUp className="text-slate-400" size={18} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Interviewing</span>
              <Clock className="text-yellow-500" size={18} />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.interviewing}</div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Offers</span>
              <CheckCircle2 className="text-green-500" size={18} />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.offers}</div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Rejected</span>
              <XCircle className="text-red-500" size={18} />
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-blue-700" />
                Add Application
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Google"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Description / Notes</label>
                  <textarea
                    placeholder="Paste the job description here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                </div>
                <button
        onClick={handleExtractWithAI}
          disabled={aiLoading}
      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-2.5 rounded-lg transition"
>
       {aiLoading ? 'Extracting...' : '✨ Extract with AI'}
         </button>
                <button
                  onClick={handleAddApplication}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  Add Application
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200">
<div className="px-6 py-4 border-b border-slate-200">
  <div className="flex justify-between items-center mb-3">
    <h2 className="text-lg font-semibold text-slate-900">Your Applications</h2>
    <span className="text-sm text-slate-500">{filtered.length} total</span>
  </div>
  <input
    type="text"
    placeholder="Search by company..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
  />
</div>              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading...</div>
              ) : applications.length === 0 ? (
                <div className="p-12 text-center">
                  <Briefcase className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="text-slate-500 font-medium">No applications yet</p>
                  <p className="text-slate-400 text-sm mt-1">Add your first job application using the form on the left.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-200">
                 {filtered.map((app) => (
                    <li key={app.id} className="p-5 hover:bg-slate-50 transition flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-900">{app.company}</h3>
                          {editingId === app.id ? (
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                              onBlur={() => setEditingId(null)}
                              autoFocus
                              className="text-xs font-medium px-2 py-0.5 rounded-full border border-blue-400"
                            >
                              <option value="Applied">Applied</option>
                              <option value="Interviewing">Interviewing</option>
                              <option value="Offer">Offer</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          ) : (
                            <button
                              onClick={() => setEditingId(app.id)}
                              className={`text-xs font-medium px-2 py-0.5 rounded-full border cursor-pointer hover:opacity-80 ${getStatusStyle(app.status)}`}
                              title="Click to change status"
                            >
                              {app.status}
                            </button>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm">{app.role}</p>
                        <p className="text-slate-400 text-xs mt-1">Added {new Date(app.date_added).toLocaleDateString()}</p>
                        {Math.floor((new Date() - new Date(app.date_added)) / (1000 * 60 * 60 * 24)) >= 7 && app.status === 'Applied' && (
  <p className="text-amber-600 text-xs mt-1 font-medium">⚠️ No update in {Math.floor((new Date() - new Date(app.date_added)) / (1000 * 60 * 60 * 24))} days. Consider following up.</p>
)}
                        {app.notes && (
                          <p className="text-slate-500 text-sm mt-2 line-clamp-2 bg-slate-50 p-2 rounded">{app.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="text-slate-400 hover:text-red-600 transition p-2 ml-2"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 py-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500">
          Built by <span className="text-slate-700 font-medium">[Gopichand Jetti]</span>
        </div>
      </footer>
    </div>
  )
}

export default App