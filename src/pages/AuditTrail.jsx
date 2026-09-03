/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import * as XLSX from 'xlsx';
import { Shield, Search, Filter, RefreshCw, ChevronDown, ChevronUp, Download } from 'lucide-react';

const ACTION_COLORS = {
    ADD_PRODUCT: { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', label: 'Add Product' },
    UPDATE_PRODUCT: { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', label: 'Update Product' },
    DELETE_PRODUCT: { bg: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', label: 'Delete Product' },
    ADD_SUPPLIER: { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', label: 'Add Supplier' },
    DELETE_SUPPLIER: { bg: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', label: 'Delete Supplier' },
    RECORD_SALE: { bg: 'rgba(168, 85, 247, 0.12)', color: '#7c3aed', label: 'Sale Recorded' },
};

const AuditTrail = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');
    const [expandedId, setExpandedId] = useState(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('audit_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000);
        if (!error && data) setLogs(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleDownloadXLSX = () => {
        if (logs.length === 0) return;

        const ACTION_LABELS = {
            ADD_PRODUCT: 'Add Product', UPDATE_PRODUCT: 'Update Product', DELETE_PRODUCT: 'Delete Product',
            ADD_SUPPLIER: 'Add Supplier', DELETE_SUPPLIER: 'Delete Supplier', RECORD_SALE: 'Sale Recorded'
        };

        const rows = logs.map(log => ({
            'Timestamp': new Date(log.created_at).toLocaleString('en-GB'),
            'User Email': log.user_email || 'Unknown',
            'Action': ACTION_LABELS[log.action] || log.action,
            'Entity': log.entity,
            'Entity ID': log.entity_id || '',
            'Description': log.description || '',
            'Details': log.details ? JSON.stringify(log.details) : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const colWidths = [
            { wch: 22 }, { wch: 28 }, { wch: 18 }, { wch: 12 },
            { wch: 12 }, { wch: 55 }, { wch: 50 }
        ];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Trail');

        const filename = `Audit_Trail_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, filename);
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.description?.toLowerCase().includes(search.toLowerCase()) ||
            log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
            log.action?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filterAction === 'ALL' || log.action === filterAction;
        return matchesSearch && matchesFilter;
    });

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const actions = ['ALL', ...Object.keys(ACTION_COLORS)];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Shield size={22} color="var(--color-primary)" />
                        </div>
                        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, margin: 0 }}>Audit Trail</h2>
                    </div>
                    <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Complete immutable log of all system actions and modifications.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <button onClick={handleDownloadXLSX} className="btn btn-outline" style={{ minHeight: '40px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                        <Download size={16} /> Export Excel
                    </button>
                    <button onClick={fetchLogs} className="btn btn-outline" style={{ minHeight: '40px' }}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: 'var(--space-3)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <div className="search-bar" style={{ flex: '1 1 240px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
                        <Search size={18} className="text-muted" />
                        <input
                            type="search"
                            placeholder="Search by user, action, or description..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: '0 1 200px' }}>
                        <Filter size={18} className="text-muted" />
                        <select
                            className="input-field"
                            style={{ minHeight: '40px' }}
                            value={filterAction}
                            onChange={e => setFilterAction(e.target.value)}
                        >
                            {actions.map(a => (
                                <option key={a} value={a}>{a === 'ALL' ? 'All Actions' : (ACTION_COLORS[a]?.label || a)}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 'var(--space-3)' }}>
                {[
                    { label: 'Total Events', value: logs.length },
                    { label: 'Sales Logged', value: logs.filter(l => l.action === 'RECORD_SALE').length },
                    { label: 'Items Added', value: logs.filter(l => l.action === 'ADD_PRODUCT').length },
                    { label: 'Items Deleted', value: logs.filter(l => l.action?.startsWith('DELETE')).length },
                ].map(({ label, value }) => (
                    <div key={label} className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{value}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2, fontWeight: 600 }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Log Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>Activity Log</h3>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>{filteredLogs.length} records</span>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading audit logs...</div>
                ) : filteredLogs.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No audit records found matching your filters.</div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-bg-app)', borderBottom: '1px solid var(--color-border)' }}>
                                    {['Timestamp', 'User', 'Action', 'Description', 'Details'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log, i) => {
                                    const actionStyle = ACTION_COLORS[log.action] || { bg: 'var(--color-bg-surface)', color: 'var(--color-text-muted)', label: log.action };
                                    const isExpanded = expandedId === log.id;
                                    return (
                                        <React.Fragment key={log.id}>
                                            <tr style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'var(--color-bg-app)' }}>
                                                <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                                                    {formatTime(log.created_at)}
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 500 }}>
                                                    {log.user_email || <span style={{ color: 'var(--color-text-muted)' }}>Unknown</span>}
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, background: actionStyle.bg, color: actionStyle.color, whiteSpace: 'nowrap' }}>
                                                        {actionStyle.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', maxWidth: 320 }}>
                                                    {log.description}
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    {log.details && (
                                                        <button
                                                            onClick={() => setExpandedId(isExpanded ? null : log.id)}
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, background: 'var(--color-primary-light)', padding: '4px 10px', borderRadius: 'var(--radius-full)', cursor: 'pointer' }}
                                                        >
                                                            {isExpanded ? <><ChevronUp size={14} /> Hide</> : <><ChevronDown size={14} /> View</>}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {isExpanded && log.details && (
                                                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-app)' }}>
                                                    <td colSpan={5} style={{ padding: '0.75rem 1rem 1rem 1rem' }}>
                                                        <pre style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--color-bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', overflowX: 'auto', margin: 0, color: 'var(--color-text-main)', border: '1px solid var(--color-border)' }}>
                                                            {JSON.stringify(log.details, null, 2)}
                                                        </pre>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditTrail;
