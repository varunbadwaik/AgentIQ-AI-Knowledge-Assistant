import { useState } from 'react'
import {
    Brain, Sparkles, Zap, BarChart3,
    Shield, MessageSquare, Search, FileText, CheckCircle, ArrowRight,
    Layers, BookOpen, Menu, X
} from 'lucide-react'

export default function LandingPage({ onNavigate }) {
    const [activeDashTab, setActiveDashTab] = useState('overview')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div style={{ background: '#09090b', minHeight: '100vh', color: '#fafafa', fontFamily: "'Work Sans', system-ui, sans-serif", position: 'relative', scrollBehavior: 'smooth' }}>
            {/* Minimal Grid Background */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                pointerEvents: 'none', zIndex: 0,
                backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
                backgroundSize: '32px 32px', opacity: 0.15
            }} />

            {/* =========== NAVBAR =========== */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                borderBottom: '1px solid #27272a', background: 'rgba(9, 9, 11, 0.8)',
                backdropFilter: 'blur(12px)'
            }}>
                <div className="nav-inner" style={{
                    maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 24px', height: '64px'
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '24px', height: '24px', borderRadius: '4px',
                            background: '#fafafa', color: '#09090b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Brain style={{ width: '14px', height: '14px' }} />
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em', color: '#fafafa' }}>AgentIQ</span>
                    </div>

                    {/* Desktop buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="nav-desktop-links">
                        <button
                            onClick={() => onNavigate('login')}
                            style={{
                                fontSize: '13px', fontWeight: 500, color: '#a1a1aa',
                                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                                padding: '6px 12px', transition: 'color 0.15s'
                            }}
                            onMouseEnter={e => e.target.style.color = '#fafafa'}
                            onMouseLeave={e => e.target.style.color = '#a1a1aa'}
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => onNavigate('dashboard')}
                            style={{
                                padding: '6px 14px', fontSize: '13px', fontWeight: 500, border: '1px solid #27272a',
                                color: '#fafafa', cursor: 'pointer', borderRadius: '6px',
                                background: '#18181b', fontFamily: 'inherit',
                                transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.color = '#09090b' }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#18181b'; e.currentTarget.style.color = '#fafafa' }}
                        >
                            Open App
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="nav-mobile-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{
                            display: 'none', background: 'transparent', border: '1px solid #27272a',
                            borderRadius: '6px', padding: '6px', color: '#a1a1aa', cursor: 'pointer'
                        }}
                    >
                        {mobileMenuOpen ? <X style={{ width: '18px', height: '18px' }} /> : <Menu style={{ width: '18px', height: '18px' }} />}
                    </button>
                </div>

                {/* Mobile dropdown menu */}
                {mobileMenuOpen && (
                    <div className="nav-mobile-dropdown" style={{
                        padding: '8px 16px 16px', borderTop: '1px solid #27272a',
                        display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                        <button
                            onClick={() => { onNavigate('login'); setMobileMenuOpen(false) }}
                            style={{
                                width: '100%', padding: '10px 12px', fontSize: '14px', fontWeight: 500,
                                color: '#a1a1aa', background: '#18181b', border: '1px solid #27272a',
                                borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
                            }}
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false) }}
                            style={{
                                width: '100%', padding: '10px 12px', fontSize: '14px', fontWeight: 500,
                                color: '#09090b', background: '#fafafa', border: '1px solid #fafafa',
                                borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
                            }}
                        >
                            Open App
                        </button>
                    </div>
                )}
            </nav>

            {/* =========== HERO =========== */}
            <main style={{ position: 'relative', zIndex: 10, paddingTop: '120px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 12px', borderRadius: '9999px',
                        background: '#18181b', border: '1px solid #27272a',
                        fontSize: '12px', color: '#a1a1aa', fontWeight: 500, marginBottom: '24px'
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fafafa' }} />
                        <span>v1.2 Now Available</span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 700,
                        lineHeight: '1.1', letterSpacing: '-0.03em', margin: '0 0 24px',
                        color: '#fafafa'
                    }}>
                        Instant answers from <br />
                        <span style={{ color: '#a1a1aa' }}>your own documents.</span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(15px, 3vw, 18px)', lineHeight: '1.6', color: '#71717a',
                        maxWidth: '560px', margin: '0 auto 40px'
                    }}>
                        AgentIQ turns your company's scattered PDFs, docs, and notes into an intelligent knowledge base. Ask anything, get cited answers instantly.
                    </p>

                    <div className="hero-buttons" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={() => onNavigate('login')}
                            style={{
                                padding: '10px 24px', fontSize: '14px', fontWeight: 500,
                                borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                                background: '#fafafa', border: '1px solid #fafafa', color: '#09090b',
                                transition: 'all 0.15s'
                            }}
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                padding: '10px 24px', fontSize: '14px', fontWeight: 500,
                                borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                                background: '#18181b', border: '1px solid #27272a', color: '#fafafa',
                                transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#52525b'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#27272a'}
                        >
                            Read the docs
                        </button>
                    </div>
                </div>

                {/* =========== PREVIEW =========== */}
                <div style={{ marginTop: '80px', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto', position: 'relative' }}>
                    <div style={{
                        background: '#09090b', borderRadius: '12px',
                        border: '1px solid #27272a', padding: '16px',
                        boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        {/* Fake Browser UI */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', paddingLeft: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27272a' }} />
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27272a' }} />
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27272a' }} />
                        </div>
                        {/* Fake Dashboard */}
                        <div className="landing-preview-main" style={{ display: 'flex', height: '500px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #27272a' }}>
                            {/* Sidebar - hidden on mobile via CSS class */}
                            <div className="landing-preview-container" style={{ width: '200px', background: '#09090b', borderRight: '1px solid #27272a', padding: '16px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#27272a', marginBottom: '24px' }} />
                                <div style={{ height: '8px', width: '60%', background: '#27272a', borderRadius: '4px', marginBottom: '16px' }} />
                                <div style={{ height: '8px', width: '80%', background: '#27272a', borderRadius: '4px', marginBottom: '8px' }} />
                                <div style={{ height: '8px', width: '70%', background: '#27272a', borderRadius: '4px', marginBottom: '8px' }} />
                            </div>
                            {/* Main */}
                            <div style={{ flex: 1, background: '#09090b', padding: 'clamp(16px, 4vw, 40px)' }}>
                                <div style={{ margin: '0 auto', maxWidth: '400px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 600, color: '#fafafa', marginBottom: '8px' }}>Good morning, Human.</div>
                                    <div style={{ fontSize: '13px', color: '#52525b', marginBottom: '32px' }}>What would you like to know?</div>
                                    <div style={{ height: '48px', borderRadius: '8px', border: '1px solid #27272a', background: '#09090b', display: 'flex', alignItems: 'center', padding: '0 16px', color: '#52525b', fontSize: '13px' }}>
                                        Ask about your Q3 sales...
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                                        {[1, 2].map(i => (
                                            <div key={i} style={{ height: '80px', borderRadius: '6px', border: '1px solid #27272a', background: '#18181b' }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* =========== FEATURES =========== */}
            <section id="features" style={{ padding: '80px 16px', maxWidth: '1000px', margin: '0 auto', borderTop: '1px solid #27272a' }}>
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <h2 style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 600, marginBottom: '16px', letterSpacing: '-0.02em' }}>
                        Built for focus.
                    </h2>
                    <p style={{ color: '#a1a1aa', maxWidth: '500px', margin: '0 auto', fontSize: '16px' }}>
                        No distractions, just the information you need, when you need it.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {[
                        { icon: Zap, title: 'Instant Indexing', desc: 'Upload documents and query them in milliseconds.' },
                        { icon: Shield, title: 'Secure by Default', desc: 'Your data never leaves your private instance.' },
                        { icon: Layers, title: 'Source Citations', desc: 'Every answer links back to the original text.' },
                        { icon: BarChart3, title: 'Usage Analytics', desc: 'Track what your team is searching for.' },
                        { icon: FileText, title: 'Multi-Format', desc: 'Support for PDF, DOCX, TXT, and Markdown.' },
                        { icon: CheckCircle, title: 'High Accuracy', desc: 'Powered by advanced RAG pipelines.' },
                    ].map((feature, i) => (
                        <div key={i} style={{ padding: '24px', borderRadius: '8px', border: '1px solid #27272a', background: '#18181b' }}>
                            <feature.icon style={{ width: '20px', height: '20px', color: '#fafafa', marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fafafa', marginBottom: '8px' }}>{feature.title}</h3>
                            <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.6' }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* =========== FOOTER =========== */}
            <footer style={{ borderTop: '1px solid #27272a', padding: '40px 16px' }}>
                <div className="footer-inner" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '2px', background: '#52525b' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#a1a1aa' }}>AgentIQ</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#52525b' }}>
                        &copy; 2026 AgentIQ. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* Mobile nav styles */}
            <style>{`
                @media (max-width: 768px) {
                    .nav-desktop-links { display: none !important; }
                    .nav-mobile-toggle { display: flex !important; }
                    .nav-mobile-dropdown { display: flex !important; }
                }
                @media (min-width: 769px) {
                    .nav-mobile-toggle { display: none !important; }
                    .nav-mobile-dropdown { display: none !important; }
                }
            `}</style>
        </div>
    )
}
