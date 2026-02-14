import { useState, useEffect } from 'react'
import axios from 'axios'
import {
    Brain, Search, Sparkles, FileText, ThumbsUp, ThumbsDown,
    AlertCircle, Loader2, Plus, MessageSquare, Upload,
    BarChart3, Settings, HelpCircle, Mic, Send, ChevronRight,
    Pin, Clock, Trash2, BookOpen, Zap, LayoutDashboard, Copy
} from 'lucide-react'
import AppSidebar from '../components/AppSidebar'

export default function Dashboard({ onNavigate }) {
    const [query, setQuery] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [feedback, setFeedback] = useState(null)
    const [history, setHistory] = useState([])
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    useEffect(() => {
        const savedHistory = localStorage.getItem('agentIQ_history')
        if (savedHistory) setHistory(JSON.parse(savedHistory))
    }, [])

    const handleQuery = async (e) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setError(null)
        setResult(null)
        setFeedback(null)

        try {
            const response = await axios.post('/api/query', { query: query })
            const data = response.data
            setResult(data)

            const newHistoryItem = { query, answer: data.answer, timestamp: new Date().toISOString() }
            const updatedHistory = [newHistoryItem, ...history].slice(50) // Fix slice to keep recent
            setHistory(updatedHistory)
            localStorage.setItem('agentIQ_history', JSON.stringify(updatedHistory))
        } catch (err) {
            console.error(err)
            const detail = err.response?.data?.detail
            const errorMessage = typeof detail === 'string' ? detail :
                Array.isArray(detail) ? detail.map(e => e.msg).join(', ') :
                    'Something went wrong. Please check your connection.'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleFeedback = async (isPositive) => {
        if (!result?.query_id) return
        try {
            await axios.post('/api/feedback', {
                query_id: result.query_id,
                was_helpful: isPositive
            })
            setFeedback(isPositive ? 'positive' : 'negative')
        } catch (err) {
            console.error('Feedback failed to send', err)
        }
    }

    const handleHistoryClick = (item) => {
        setQuery(item.query)
        setResult({ answer: item.answer, sources: [] }) // Simplified for history view
    }

    const handleClearHistory = () => {
        setHistory([])
        localStorage.removeItem('agentIQ_history')
    }

    const getConfidenceColor = (c) => {
        if (c >= 80) return '#10b981' // Emerald 500
        if (c >= 50) return '#f59e0b' // Amber 500
        return '#ef4444' // Red 500
    }

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    const pinnedHistory = history.filter((_, i) => i < 3)
    const todayHistory = history.filter((_, i) => i >= 3 && i < 8)

    const quickActions = [
        { icon: BookOpen, title: 'Search Documents', desc: 'Find answers in your knowledge base.', nav: null },
        { icon: Upload, title: 'Upload & Index', desc: 'Add new files to the system.', nav: 'upload' },
        { icon: BarChart3, title: 'View Analytics', desc: 'See what users are asking.', nav: 'admin' },
    ]

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#09090b', color: '#fafafa', fontFamily: "'Work Sans', system-ui, sans-serif", overflow: 'hidden' }}>
            <AppSidebar activePage="dashboard" onNavigate={onNavigate} />

            {/* MAIN CONTENT */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {/* Top bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    padding: '12px 24px', borderBottom: '1px solid #27272a'
                }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: '#f4f4f5', color: '#09090b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 600
                    }}>AI</div>
                </div>

                {/* Scrollable content */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', scrollBehavior: 'smooth' }}>
                    {/* Empty State */}
                    {!result && !loading && !error && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 20px' }}>
                            {/* Greeting */}
                            <h1 style={{ fontSize: '32px', fontWeight: 600, textAlign: 'center', margin: '0 0 12px', color: '#fafafa', letterSpacing: '-0.02em' }}>
                                {greeting}, <span style={{ color: '#a1a1aa' }}>human.</span>
                            </h1>

                            {/* Query input */}
                            <div style={{ width: '100%', maxWidth: '640px', marginTop: '32px' }}>
                                <form onSubmit={handleQuery} style={{ position: 'relative' }}>
                                    <div style={{
                                        background: '#09090b', borderRadius: '12px',
                                        border: '1px solid #27272a', padding: '16px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        transition: 'all 0.2s ease'
                                    }}
                                        onFocus={e => e.currentTarget.style.borderColor = '#52525b'}
                                        onBlur={e => e.currentTarget.style.borderColor = '#27272a'}
                                    >
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={e => setQuery(e.target.value)}
                                            placeholder="Ask a question..."
                                            style={{
                                                width: '100%', background: 'transparent', border: 'none',
                                                outline: 'none', color: '#fafafa', fontSize: '15px',
                                                fontFamily: 'inherit', padding: 0, margin: '0 0 16px'
                                            }}
                                            autoFocus
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button type="button" onClick={() => onNavigate('upload')} style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    padding: '6px 10px', borderRadius: '6px',
                                                    background: '#18181b', border: '1px solid #27272a',
                                                    color: '#a1a1aa', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit'
                                                }}>
                                                    <FileText style={{ width: '13px', height: '13px' }} /> Data Sources
                                                </button>
                                            </div>
                                            <button type="submit" disabled={!query.trim()} style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                padding: '6px 12px', borderRadius: '6px',
                                                background: query.trim() ? '#fafafa' : '#27272a',
                                                color: query.trim() ? '#09090b' : '#52525b',
                                                fontSize: '13px', fontWeight: 500, border: 'none',
                                                cursor: query.trim() ? 'pointer' : 'not-allowed',
                                                transition: 'all 0.15s'
                                            }}>
                                                <span>Ask AI</span>
                                                <ArrowRightIcon />
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Quick Actions */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%', maxWidth: '640px', marginTop: '24px' }}>
                                {quickActions.map((action, i) => (
                                    <button key={i} onClick={() => action.nav && onNavigate(action.nav)} style={{
                                        textAlign: 'left', padding: '16px', borderRadius: '8px',
                                        background: 'transparent', border: '1px solid #27272a',
                                        color: '#fafafa', cursor: 'pointer', fontFamily: 'inherit',
                                        transition: 'all 0.15s ease'
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#18181b'; e.currentTarget.style.borderColor = '#3f3f46' }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#27272a' }}
                                    >
                                        <div style={{ marginBottom: '12px', color: '#a1a1aa' }}>
                                            <action.icon style={{ width: '20px', height: '20px' }} />
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{action.title}</div>
                                        <div style={{ fontSize: '12px', color: '#71717a' }}>{action.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Style UI */}
                    {(result || loading || error) && (
                        <div style={{ maxWidth: '768px', margin: '0 auto', width: '100%', padding: '40px 24px 100px' }}>
                            {/* User Query */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                                <div style={{
                                    background: '#18181b', padding: '12px 18px', borderRadius: '20px 20px 4px 20px',
                                    color: '#fafafa', fontSize: '15px', lineHeight: '1.5', border: '1px solid #27272a',
                                    maxWidth: '80%'
                                }}>
                                    {query}
                                </div>
                            </div>

                            {/* Loading */}
                            {loading && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%', background: '#fafafa', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Sparkles style={{ width: '16px', height: '16px', color: '#09090b' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                        <div style={{ width: '6px', height: '6px', background: '#52525b', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                                        <div style={{ width: '6px', height: '6px', background: '#52525b', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
                                        <div style={{ width: '6px', height: '6px', background: '#52525b', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
                                    </div>
                                </div>
                            )}

                            {/* Result */}
                            {result && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', animation: 'fadeIn 0.3s ease-out' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%', background: '#fafafa', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Brain style={{ width: '18px', height: '18px', color: '#09090b' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#e4e4e7', whiteSpace: 'pre-wrap' }}>
                                            {result.answer}
                                        </div>

                                        {/* Sources */}
                                        {result.sources && result.sources.length > 0 && (
                                            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #27272a' }}>
                                                <p style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                                                    Sources
                                                </p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                                                    {result.sources.map((source, i) => (
                                                        <div key={i} style={{
                                                            padding: '10px', borderRadius: '6px', background: '#18181b',
                                                            border: '1px solid #27272a', fontSize: '12px'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                <span style={{ fontWeight: 500, color: '#e4e4e7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {source.source}
                                                                </span>
                                                                {source.similarity && (
                                                                    <span style={{
                                                                        fontSize: '10px', fontWeight: 600,
                                                                        color: getConfidenceColor(source.similarity)
                                                                    }}>
                                                                        {source.similarity.toFixed(0)}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ color: '#71717a', fontSize: '11px', height: '32px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                                {source.text}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Feedback */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                                            <button onClick={() => handleFeedback(true)} disabled={feedback !== null} style={{
                                                background: 'transparent', border: 'none', cursor: feedback ? 'default' : 'pointer',
                                                color: feedback === 'positive' ? '#10b981' : '#52525b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px'
                                            }}>
                                                <ThumbsUp style={{ width: '14px', height: '14px' }} /> Helpful
                                            </button>
                                            <button onClick={() => handleFeedback(false)} disabled={feedback !== null} style={{
                                                background: 'transparent', border: 'none', cursor: feedback ? 'default' : 'pointer',
                                                color: feedback === 'negative' ? '#ef4444' : '#52525b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px'
                                            }}>
                                                <ThumbsDown style={{ width: '14px', height: '14px' }} /> Not helpful
                                            </button>
                                            <button onClick={() => navigator.clipboard.writeText(result.answer)} style={{
                                                marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer',
                                                color: '#52525b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px'
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#a1a1aa'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#52525b'}
                                            >
                                                <Copy style={{ width: '13px', height: '13px' }} /> Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div style={{
                                    marginTop: '24px', padding: '12px 16px', borderRadius: '8px',
                                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                    color: '#f87171', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px'
                                }}>
                                    <AlertCircle style={{ width: '18px', height: '18px' }} />
                                    {error}
                                </div>
                            )}

                            {/* Reset Button (when valid result exists) */}
                            {result && (
                                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                    <button onClick={() => { setResult(null); setQuery(''); }} style={{
                                        background: '#fafafa', color: '#09090b', border: 'none',
                                        padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                                        cursor: 'pointer'
                                    }}>
                                        Start New Chat
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Input Animation Styles */}
            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    )
}

function ArrowRightIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
}
