import { useState, useCallback } from 'react'
import axios from 'axios'
import { Upload as UploadIcon, FileText, X, CheckCircle, AlertCircle, Loader2, Menu } from 'lucide-react'
import AppSidebar from '../components/AppSidebar'

export default function Upload({ onNavigate }) {
    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [uploadResults, setUploadResults] = useState([])
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleDrag = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
        else if (e.type === 'dragleave') setDragActive(false)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
            file.name.match(/\.(pdf|txt|md|markdown|docx)$/i)
        )
        setFiles(prev => [...prev, ...droppedFiles])
    }, [])

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files)
        setFiles(prev => [...prev, ...selectedFiles])
    }

    const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index))

    const uploadFiles = async () => {
        setUploading(true)
        const results = []
        for (const file of files) {
            const formData = new FormData()
            formData.append('file', file)
            try {
                const response = await axios.post('/api/documents/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                results.push({ name: file.name, success: true, chunks: response.data.chunks_created })
            } catch (err) {
                results.push({ name: file.name, success: false, error: err.response?.data?.detail || 'Upload failed' })
            }
        }
        setUploadResults(results)
        setFiles([])
        setUploading(false)
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const getFileIcon = (name) => {
        if (name.endsWith('.pdf')) return '📄'
        if (name.endsWith('.docx')) return '📝'
        if (name.endsWith('.txt')) return '📃'
        if (name.match(/\.md$/i)) return '📋'
        return '📁'
    }

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#09090b', color: '#fafafa', fontFamily: "'Work Sans', system-ui, sans-serif", overflow: 'hidden' }}>
            <AppSidebar activePage="upload" onNavigate={onNavigate} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
                    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                        {/* Header */}
                        <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 600, margin: '0 0 8px', letterSpacing: '-0.02em', color: '#fafafa' }}>
                            Upload Documents
                        </h1>
                        <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '0 0 32px' }}>
                            Supported formats: PDF, DOCX, TXT, MD.
                        </p>

                        {/* Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            style={{
                                position: 'relative', borderRadius: '8px',
                                border: dragActive ? '2px dashed #fafafa' : '1px dashed #3f3f46',
                                background: dragActive ? '#18181b' : 'transparent',
                                padding: '48px 16px', textAlign: 'center',
                                transition: 'all 0.2s ease', cursor: 'pointer'
                            }}
                        >
                            <input
                                type="file" multiple accept=".pdf,.txt,.md,.markdown,.docx"
                                onChange={handleFileSelect}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            />
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '8px',
                                background: '#18181b', border: '1px solid #27272a',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px', color: '#fafafa'
                            }}>
                                <UploadIcon style={{ width: '20px', height: '20px' }} />
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 4px', color: '#fafafa' }}>
                                {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#71717a' }}>Maximum file size 50MB</p>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div style={{ marginTop: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#a1a1aa' }}>Files selected</h3>
                                    <span style={{ fontSize: '12px', color: '#52525b' }}>{files.length} files</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {files.map((file, index) => (
                                        <div key={index} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '12px 16px', borderRadius: '6px',
                                            background: '#18181b', border: '1px solid #27272a'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                                <span style={{ fontSize: '16px', flexShrink: 0 }}>{getFileIcon(file.name)}</span>
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ fontSize: '13px', fontWeight: 500, margin: 0, color: '#fafafa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                                                    <p style={{ fontSize: '11px', color: '#71717a', margin: '2px 0 0' }}>{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFile(index)} style={{
                                                background: 'transparent', border: 'none', cursor: 'pointer',
                                                color: '#71717a', padding: '4px', borderRadius: '4px', flexShrink: 0
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
                                            >
                                                <X style={{ width: '16px', height: '16px' }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={uploadFiles} disabled={uploading} style={{
                                    width: '100%', marginTop: '16px', padding: '10px', borderRadius: '6px',
                                    background: '#fafafa', border: '1px solid #fafafa',
                                    color: '#09090b', fontSize: '13px', fontWeight: 500,
                                    cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                                    opacity: uploading ? 0.7 : 1, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '8px', transition: 'all 0.15s'
                                }}>
                                    {uploading ? (
                                        <>
                                            <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 0.8s linear infinite' }} />
                                            Uploading...
                                        </>
                                    ) : (
                                        `Upload ${files.length} file${files.length > 1 ? 's' : ''}`
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Upload Results */}
                        {uploadResults.length > 0 && (
                            <div style={{ marginTop: '32px' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '12px' }}>Results</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {uploadResults.map((result, index) => (
                                        <div key={index} style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '12px 16px', borderRadius: '6px',
                                            background: result.success ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                            border: `1px solid ${result.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                        }}>
                                            {result.success ? (
                                                <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981', flexShrink: 0 }} />
                                            ) : (
                                                <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444', flexShrink: 0 }} />
                                            )}
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: '13px', fontWeight: 500, margin: 0, color: result.success ? '#d1fae5' : '#fca5a5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {result.name}
                                                </p>
                                                <p style={{ fontSize: '11px', margin: '2px 0 0', color: result.success ? '#6ee7b7' : '#f87171' }}>
                                                    {result.success ? `Success details: ${result.chunks} chunks` : result.error}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setUploadResults([])} style={{
                                    marginTop: '12px', background: 'transparent', border: 'none',
                                    color: '#71717a', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fafafa'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}
