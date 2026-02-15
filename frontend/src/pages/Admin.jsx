import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, FileText, Search, AlertTriangle, TrendingUp, ThumbsUp, Clock, Loader2, Trash2, X, RefreshCw, Menu } from 'lucide-react'
import AppSidebar from '../components/AppSidebar'

export default function Admin({ onNavigate }) {
    const [stats, setStats] = useState(null)
    const [topSources, setTopSources] = useState([])
    const [knowledgeGaps, setKnowledgeGaps] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [deletingGap, setDeletingGap] = useState(null)
    const [confirmDeleteGap, setConfirmDeleteGap] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [statsRes, sourcesRes, gapsRes] = await Promise.all([
                axios.get('/api/analytics/stats'),
                axios.get('/api/analytics/top-sources'),
                axios.get('/api/analytics/low-confidence')
            ])
            setStats(statsRes.data)
            setTopSources(sourcesRes.data.top_sources || [])
            setKnowledgeGaps(gapsRes.data.knowledge_gaps || [])
        } catch (err) { console.error('Failed to fetch analytics', err) }
        finally { setLoading(false) }
    }

    const handleDelete = async (sourceName) => {
        setDeleting(sourceName)
        try {
            await axios.delete(`/api/documents/by-source/${encodeURIComponent(sourceName)}`)
            setTopSources(prev => prev.filter(s => s.source !== sourceName))
            setConfirmDelete(null)
            try {
                const statsRes = await axios.get('/api/analytics/stats')
                setStats(statsRes.data)
            } catch (e) { /* best-effort */ }
        } catch (err) {
            console.error('Failed to delete document', err)
            alert('Failed to delete document: ' + (err.response?.data?.detail || err.message))
        } finally { setDeleting(null) }
    }

    const handleDeleteGap = async (gapId) => {
        setDeletingGap(gapId)
        try {
            await axios.delete(`/api/analytics/query/${gapId}`)
            setKnowledgeGaps(prev => prev.filter(g => g.id !== gapId))
            setConfirmDeleteGap(null)
        } catch (err) {
            console.error('Failed to delete query', err)
            alert('Failed to delete query: ' + (err.response?.data?.detail || err.message))
        } finally { setDeletingGap(null) }
    }

    const statCards = [
        { label: 'Documents', value: stats?.total_documents || 0, icon: FileText },
        { label: 'Chunks', value: stats?.total_chunks || 0, icon: BarChart3 },
        { label: 'Queries', value: stats?.total_queries || 0, icon: Search },
        { label: 'Confidence', value: `${stats?.average_confidence || 0}%`, icon: TrendingUp },
        { label: 'Helpful', value: `${stats?.helpful_rate || 0}%`, icon: ThumbsUp },
    ]

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#09090b', color: '#fafafa', fontFamily: "'Work Sans', system-ui, sans-serif", overflow: 'hidden' }}>
            <AppSidebar activePage="admin" onNavigate={onNavigate} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 24px', borderBottom: '1px solid #27272a'
                }}>
                    <button className="sidebar-mobile-toggle" onClick={() => setSidebarOpen(true)}>
                        <Menu style={{ width: '18px', height: '18px' }} />
                    </button>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: '#f4f4f5', color: '#09090b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 600
                    }}>AI</div>
                </div>

                {/* Content */}
                <div className="content-padding" style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <Loader2 style={{ width: '20px', height: '20px', color: '#a1a1aa', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                                <p style={{ fontSize: '13px', color: '#52525b' }}>Loading analytics…</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.02em', color: '#fafafa' }}>
                                        Analytics
                                    </h1>
                                    <p style={{ fontSize: '14px', color: '#a1a1aa', margin: 0 }}>
                                        Overview of knowledge base performance.
                                    </p>
                                </div>
                                <button onClick={fetchData} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                                    background: '#18181b', border: '1px solid #27272a',
                                    color: '#71717a', cursor: 'pointer', fontFamily: 'inherit'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#fafafa'; e.currentTarget.style.borderColor = '#3f3f46' }}
                                    onMouseLeave={e => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.borderColor = '#27272a' }}
                                >
                                    <RefreshCw style={{ width: '12px', height: '12px' }} /> Refresh
                                </button>
                            </div>

                            {/* Stat Cards */}
                            <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '28px' }}>
                                {statCards.map((stat, i) => (
                                    <div key={i} style={{
                                        padding: '16px', borderRadius: '8px',
                                        background: '#18181b', border: '1px solid #27272a'
                                    }}>
                                        <div style={{ color: '#a1a1aa', marginBottom: '12px' }}>
                                            <stat.icon style={{ width: '16px', height: '16px' }} />
                                        </div>
                                        <p style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 2px', color: '#fafafa' }}>{stat.value}</p>
                                        <p style={{ fontSize: '12px', color: '#52525b', margin: 0 }}>{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Two-column grid */}
                            <div className="grid-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {/* Most Used Documents */}
                                <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', overflow: 'hidden' }}>
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText style={{ width: '14px', height: '14px', color: '#a1a1aa' }} />
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#fafafa' }}>Top Documents</span>
                                    </div>
                                    <div style={{ padding: '8px' }}>
                                        {topSources.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                {topSources.slice(0, 8).map((source, i) => (
                                                    <div key={i} style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '8px 10px', borderRadius: '6px',
                                                        transition: 'background 0.15s'
                                                    }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                                            <span style={{
                                                                width: '18px', height: '18px', borderRadius: '4px',
                                                                background: '#27272a', color: '#a1a1aa',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '10px', fontWeight: 600, flexShrink: 0
                                                            }}>{i + 1}</span>
                                                            <span style={{ fontSize: '13px', color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {source.source}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                                            <span style={{ fontSize: '12px', color: '#52525b' }}>{source.usage_count}</span>
                                                            {confirmDelete === source.source ? (
                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                    <button onClick={() => handleDelete(source.source)} disabled={deleting === source.source} style={{
                                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500,
                                                                        background: '#ef4444', border: 'none',
                                                                        color: '#fff', cursor: 'pointer', fontFamily: 'inherit'
                                                                    }}>
                                                                        {deleting === source.source ? <Loader2 style={{ width: '10px', height: '10px', animation: 'spin 0.8s linear infinite' }} /> : 'Confirm'}
                                                                    </button>
                                                                    <button onClick={() => setConfirmDelete(null)} style={{
                                                                        padding: '4px', borderRadius: '4px', border: '1px solid #3f3f46',
                                                                        background: 'transparent', color: '#a1a1aa', cursor: 'pointer'
                                                                    }}>
                                                                        <X style={{ width: '10px', height: '10px' }} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => setConfirmDelete(source.source)} style={{
                                                                    padding: '4px', borderRadius: '4px', background: 'transparent',
                                                                    border: 'none', color: '#52525b', cursor: 'pointer', opacity: 0,
                                                                    transition: 'all 0.15s'
                                                                }}
                                                                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#ef4444' }}
                                                                    onMouseLeave={e => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.color = '#52525b' }}
                                                                    ref={el => {
                                                                        if (el) {
                                                                            const parent = el.closest('[style]')
                                                                            if (parent) {
                                                                                parent.addEventListener('mouseenter', () => el.style.opacity = '1')
                                                                                parent.addEventListener('mouseleave', () => el.style.opacity = '0')
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 style={{ width: '12px', height: '12px' }} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ fontSize: '12px', color: '#52525b', textAlign: 'center', padding: '24px 0' }}>
                                                No documents indexed yet.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Knowledge Gaps */}
                                <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', overflow: 'hidden' }}>
                                    <div style={{
                                        padding: '12px 16px', borderBottom: '1px solid #27272a',
                                        display: 'flex', alignItems: 'center', gap: '8px'
                                    }}>
                                        <AlertTriangle style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#fafafa' }}>Low Confidence Queries</span>
                                    </div>
                                    <div style={{ padding: '8px' }}>
                                        {knowledgeGaps.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {knowledgeGaps.slice(0, 6).map((gap, i) => (
                                                    <div key={gap.id || i} style={{
                                                        padding: '12px', borderRadius: '6px',
                                                        background: '#27272a', border: '1px solid #3f3f46'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                                            <p style={{ fontSize: '13px', fontWeight: 500, color: '#e4e4e7', margin: '0 0 4px', wordBreak: 'break-word' }}>
                                                                "{gap.query}"
                                                            </p>
                                                            {confirmDeleteGap === gap.id ? (
                                                                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                                    <button onClick={() => handleDeleteGap(gap.id)} disabled={deletingGap === gap.id} style={{
                                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px',
                                                                        background: '#ef4444', border: 'none',
                                                                        color: '#fff', cursor: 'pointer', fontFamily: 'inherit'
                                                                    }}>
                                                                        {deletingGap === gap.id ? <Loader2 style={{ width: '10px', height: '10px', animation: 'spin 0.8s linear infinite' }} /> : 'Delete'}
                                                                    </button>
                                                                    <button onClick={() => setConfirmDeleteGap(null)} style={{
                                                                        padding: '4px', borderRadius: '4px', border: '1px solid #52525b',
                                                                        background: 'transparent', color: '#a1a1aa', cursor: 'pointer'
                                                                    }}>
                                                                        <X style={{ width: '10px', height: '10px' }} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => setConfirmDeleteGap(gap.id)} style={{
                                                                    padding: '4px', borderRadius: '4px', background: 'transparent',
                                                                    border: 'none', color: '#71717a', cursor: 'pointer', flexShrink: 0
                                                                }}
                                                                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                                                    onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
                                                                >
                                                                    <Trash2 style={{ width: '12px', height: '12px' }} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                            <span style={{ fontSize: '11px', fontWeight: 500, color: '#f59e0b' }}>
                                                                {gap.confidence?.toFixed(0)}% confidence
                                                            </span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#71717a' }}>
                                                                <Clock style={{ width: '11px', height: '11px' }} />
                                                                {new Date(gap.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                                <p style={{ fontSize: '12px', fontWeight: 500, margin: '0 0 4px', color: '#fafafa' }}>No obvious gaps.</p>
                                                <p style={{ fontSize: '11px', color: '#52525b', margin: 0 }}>System is answering confidently.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}
