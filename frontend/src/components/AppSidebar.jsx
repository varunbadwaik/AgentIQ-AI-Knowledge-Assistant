import { Brain, Plus, Upload, LayoutDashboard, Settings, HelpCircle } from 'lucide-react'

/**
 * Shared sidebar used by Dashboard, Upload, and Admin pages.
 * Responsive: fixed panel on desktop, slide-in drawer on mobile.
 */
export default function AppSidebar({ activePage, onNavigate, isOpen, onClose }) {
    const navItems = [
        { icon: Plus, label: 'New Chat', page: 'dashboard', accent: true },
        { icon: Upload, label: 'Upload Docs', page: 'upload' },
        { icon: LayoutDashboard, label: 'Analytics', page: 'admin' },
    ]

    const bottomItems = [
        { icon: Settings, label: 'Settings' },
        { icon: HelpCircle, label: 'Help & Support' },
    ]

    const handleNav = (page) => {
        onNavigate(page)
        if (onClose) onClose()
    }

    return (
        <>
            {/* Backdrop overlay (mobile only, controlled by CSS) */}
            {isOpen && (
                <div className="sidebar-backdrop" onClick={onClose} />
            )}

            <aside
                className={`sidebar-desktop ${isOpen ? 'open' : ''}`}
                style={{
                    width: '260px', minWidth: '260px', background: '#09090b',
                    borderRight: '1px solid #27272a',
                    flexDirection: 'column', overflow: 'hidden'
                }}
            >
                {/* Logo */}
                <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => handleNav('landing')} style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: '#18181b',
                        border: '1px solid #27272a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0
                    }}>
                        <Brain style={{ width: '16px', height: '16px', color: '#fafafa' }} />
                    </button>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em', color: '#fafafa' }}>AgentIQ</div>
                        <div style={{ fontSize: '11px', color: '#52525b', fontWeight: 500 }}>Knowledge Assistant</div>
                    </div>
                </div>

                {/* Nav */}
                <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navItems.map((item, i) => {
                        const isActive = activePage === item.page
                        return (
                            <button key={i} onClick={() => handleNav(item.page)} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '8px 12px', borderRadius: '6px', border: 'none',
                                background: isActive ? '#f4f4f5' : 'transparent',
                                color: isActive ? '#09090b' : '#a1a1aa',
                                cursor: 'pointer', fontSize: '13px', fontWeight: isActive ? 600 : 500,
                                fontFamily: 'inherit', textAlign: 'left', width: '100%',
                                transition: 'all 0.15s ease'
                            }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = '#18181b'
                                        e.currentTarget.style.color = '#e4e4e7'
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.color = '#a1a1aa'
                                    }
                                }}
                            >
                                <item.icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Bottom */}
                <div style={{ borderTop: '1px solid #27272a', padding: '8px 8px' }}>
                    {bottomItems.map((item, i) => (
                        <button key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 12px', borderRadius: '6px', border: 'none',
                            background: 'transparent', color: '#71717a', cursor: 'pointer',
                            fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', textAlign: 'left', width: '100%'
                        }}
                            onMouseEnter={e => e.currentTarget.style.color = '#a1a1aa'}
                            onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
                        >
                            <item.icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                    <div style={{ padding: '8px 12px 4px', fontSize: '10px', color: '#3f3f46', fontFamily: 'monospace' }}>v1.2.0</div>
                </div>
            </aside>
        </>
    )
}
