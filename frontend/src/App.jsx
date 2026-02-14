import { useState, useEffect } from 'react'
import axios from 'axios'
import { supabase } from './lib/supabase'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Upload from './pages/Upload'

function App() {
    const [currentPage, setCurrentPage] = useState('landing')
    const [session, setSession] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)

    useEffect(() => {
        // Check current session on load
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setAuthLoading(false)
            if (session) setCurrentPage('dashboard')
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (!session) setCurrentPage('landing')
        })

        return () => subscription.unsubscribe()
    }, [])

    // Set up axios interceptor to include auth token
    useEffect(() => {
        const interceptor = axios.interceptors.request.use((config) => {
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`
            }
            return config
        })

        return () => axios.interceptors.request.eject(interceptor)
    }, [session])

    const handleAuthSuccess = (newSession) => {
        setSession(newSession)
        setCurrentPage('dashboard')
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setSession(null)
        setCurrentPage('landing')
    }

    const handleNavigate = (page) => {
        // If trying to access protected pages without auth, redirect to login
        if (['dashboard', 'upload', 'admin'].includes(page) && !session) {
            setCurrentPage('login')
            return
        }
        setCurrentPage(page)
    }

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
            </div>
        )
    }

    // Public pages
    if (currentPage === 'landing') {
        return <LandingPage onNavigate={handleNavigate} />
    }

    if (currentPage === 'login') {
        return <LoginPage onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />
    }

    // Protected pages — require session
    if (!session) {
        return <LoginPage onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />
    }

    if (currentPage === 'dashboard') {
        return <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} user={session.user} />
    }

    if (currentPage === 'upload') {
        return <Upload onNavigate={handleNavigate} onLogout={handleLogout} user={session.user} />
    }

    if (currentPage === 'admin') {
        return <Admin onNavigate={handleNavigate} onLogout={handleLogout} user={session.user} />
    }

    return <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} user={session.user} />
}

export default App
