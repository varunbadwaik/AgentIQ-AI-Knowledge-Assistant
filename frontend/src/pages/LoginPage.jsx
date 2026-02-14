import { useState } from 'react'
import { Brain, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function LoginPage({ onNavigate, onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            if (isLogin) {
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (authError) throw authError
                if (onAuthSuccess) onAuthSuccess(data.session)
            } else {
                const { data, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (authError) throw authError
                // Check if email confirmation is required
                if (data.user && !data.session) {
                    setSuccess('Account created! Check your email for a confirmation link.')
                } else if (data.session) {
                    if (onAuthSuccess) onAuthSuccess(data.session)
                }
            }
        } catch (err) {
            setError(err.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6"
            style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)',
            }}>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }} />

            <div className="w-full max-w-md relative z-10">
                {/* Back button */}
                <button
                    onClick={() => onNavigate('landing')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-10"
                >
                    <ArrowLeft size={16} />
                    <span className="text-sm">Back</span>
                </button>

                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-zinc-800 flex items-center justify-center">
                        <Brain size={20} className="text-zinc-300" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">AgentIQ</h1>
                        <p className="text-xs text-zinc-500 tracking-wide">Knowledge Assistant</p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8">
                    <h2 className="text-lg font-semibold text-zinc-100 mb-1">
                        {isLogin ? 'Welcome back' : 'Create account'}
                    </h2>
                    <p className="text-sm text-zinc-500 mb-6">
                        {isLogin ? 'Sign in to your account' : 'Start your knowledge journey'}
                    </p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700/80 text-zinc-200 rounded-lg
                                focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30
                                placeholder:text-zinc-600 text-sm transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2.5 pr-10 bg-zinc-900 border border-zinc-700/80 text-zinc-200 rounded-lg
                                    focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30
                                    placeholder:text-zinc-600 text-sm transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-white text-zinc-900 font-semibold text-sm rounded-lg
                            hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-5 pt-5 border-t border-zinc-800/80 text-center">
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null) }}
                            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
