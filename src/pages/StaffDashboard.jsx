/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../hooks/useAuth';
import {
    TrendingUp, DollarSign, ShoppingCart, ChevronDown, ChevronRight,
    Clock, Package, Calendar, Hash, Receipt
} from 'lucide-react';

const StaffDashboard = () => {
    const { sales } = useInventory();
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [expandedSaleId, setExpandedSaleId] = useState(null);
    const [dateFilter, setDateFilter] = useState('all'); // 'today', 'week', 'month', 'all'

    // Filter sales for the current staff user
    const mySales = useMemo(() => {
        return sales.filter(sale => sale.staffUserId === user?.id);
    }, [sales, user?.id]);

    // Date filtering
    const filteredSales = useMemo(() => {
        const now = new Date();
        const today = now.toDateString();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        switch (dateFilter) {
            case 'today':
                return mySales.filter(s => new Date(s.date).toDateString() === today);
            case 'week':
                return mySales.filter(s => new Date(s.date) >= weekAgo);
            case 'month':
                return mySales.filter(s => new Date(s.date) >= monthStart);
            default:
                return mySales;
        }
    }, [mySales, dateFilter]);

    // Metrics
    const now = new Date();
    const today = now.toDateString();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const todaysSales = mySales
        .filter(s => new Date(s.date).toDateString() === today)
        .reduce((acc, s) => acc + s.total, 0);

    const todaysCount = mySales
        .filter(s => new Date(s.date).toDateString() === today).length;

    const thisMonthSales = mySales
        .filter(s => {
            const d = new Date(s.date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        })
        .reduce((acc, s) => acc + s.total, 0);

    const thisMonthCount = mySales
        .filter(s => {
            const d = new Date(s.date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;

    const totalRevenue = mySales.reduce((acc, s) => acc + s.total, 0);

    const toggleExpand = (saleId) => {
        setExpandedSaleId(prev => prev === saleId ? null : saleId);
    };

    const filterOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                        My Dashboard
                    </h2>
                    <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                        Welcome back, <strong>{profile?.full_name || 'Staff'}</strong> — here's your sales summary.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                        {now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <button
                        className="btn btn-primary"
                        style={{ minHeight: '40px' }}
                        onClick={() => navigate('/sales')}
                    >
                        <ShoppingCart size={18} /> New Sale
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                gap: 'var(--space-4)'
            }}>
                <StaffMetricCard
                    title="Today's Sales"
                    value={`₵${todaysSales.toFixed(2)}`}
                    icon={DollarSign}
                    color="green"
                    subtext={`${todaysCount} transaction${todaysCount !== 1 ? 's' : ''}`}
                />
                <StaffMetricCard
                    title="This Month"
                    value={`₵${thisMonthSales.toFixed(2)}`}
                    icon={Calendar}
                    color="blue"
                    subtext={`${thisMonthCount} transaction${thisMonthCount !== 1 ? 's' : ''}`}
                />
                <StaffMetricCard
                    title="Total Transactions"
                    value={mySales.length}
                    icon={Receipt}
                    color="purple"
                    subtext="All-time sales count"
                />
                <StaffMetricCard
                    title="Total Revenue"
                    value={`₵${totalRevenue.toFixed(2)}`}
                    icon={TrendingUp}
                    color="teal"
                    subtext="All-time total"
                />
            </div>

            {/* Sales History */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)'
                }}>
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
                        My Sales History
                    </h3>
                    <div style={{ display: 'flex', gap: 'var(--space-1)', background: 'var(--color-bg-app)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
                        {filterOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setDateFilter(opt.value)}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 600,
                                    borderRadius: 'var(--radius-sm)',
                                    background: dateFilter === opt.value ? 'var(--color-primary)' : 'transparent',
                                    color: dateFilter === opt.value ? '#fff' : 'var(--color-text-muted)',
                                    transition: 'all var(--transition-fast)',
                                    cursor: 'pointer',
                                    border: 'none'
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredSales.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <ShoppingCart size={40} style={{ opacity: 0.15, marginBottom: 'var(--space-3)' }} />
                        <p>No sales found for this period.</p>
                        <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => navigate('/sales')}>
                            <ShoppingCart size={16} /> Make a Sale
                        </button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-app)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem 1rem', width: '36px' }}></th>
                                    <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Sale #</th>
                                    <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Date & Time</th>
                                    <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Customer</th>
                                    <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Items</th>
                                    <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.map(sale => (
                                    <React.Fragment key={sale.id}>
                                        <tr
                                            onClick={() => toggleExpand(sale.id)}
                                            style={{
                                                borderBottom: expandedSaleId === sale.id ? 'none' : '1px solid var(--color-border)',
                                                cursor: 'pointer',
                                                transition: 'background-color var(--transition-fast)',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '0.75rem 0.5rem 0.75rem 1rem', color: 'var(--color-text-muted)' }}>
                                                {expandedSaleId === sale.id
                                                    ? <ChevronDown size={16} />
                                                    : <ChevronRight size={16} />}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>#{sale.id}</td>
                                            <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Clock size={13} />
                                                    {new Date(sale.date).toLocaleString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                                                {sale.buyerDetails?.name || 'Cash Customer'}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>
                                                {sale.items} item{sale.items !== 1 ? 's' : ''}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                                ₵{sale.total.toFixed(2)}
                                            </td>
                                        </tr>

                                        {/* Expanded detail row */}
                                        {expandedSaleId === sale.id && sale.details && (
                                            <tr>
                                                <td colSpan="6" style={{ padding: 0 }}>
                                                    <SaleDetailPanel sale={sale} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};


/* ─── Expandable detail panel for a single sale ─── */
const SaleDetailPanel = ({ sale }) => (
    <div style={{
        margin: '0 1rem 0.75rem 1rem',
        padding: 'var(--space-4)',
        background: 'var(--color-bg-app)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        animation: 'slideDown 0.15s ease-out'
    }}>
        <p style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em', marginBottom: 'var(--space-3)' }}>
            <Package size={13} style={{ verticalAlign: '-2px', marginRight: '4px' }} />
            Items in Sale #{sale.id}
        </p>
        <table style={{ width: '100%', fontSize: 'var(--font-size-sm)', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>Product</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>Qty</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>Unit Price</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {sale.details.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 500 }}>{item.name}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--color-text-muted)' }}>₵{item.price.toFixed(2)}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)' }}>₵{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan="3" style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>Total:</td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 800, color: 'var(--color-primary)', fontSize: 'var(--font-size-base)' }}>₵{sale.total.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
    </div>
);


/* ─── Metric card component ─── */
const StaffMetricCard = ({ title, value, icon: Icon, color, subtext }) => {
    const colorMap = {
        blue: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6' },
        green: { bg: 'rgba(34, 197, 94, 0.12)', text: '#22c55e' },
        orange: { bg: 'rgba(249, 115, 22, 0.12)', text: '#f97316' },
        purple: { bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7' },
        teal: { bg: 'rgba(13, 148, 136, 0.12)', text: '#0d9488' },
    };
    const theme = colorMap[color] || colorMap.teal;

    return (
        <div
            className="card"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                minHeight: '110px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
            <div style={{ overflow: 'hidden', paddingRight: 'var(--space-2)' }}>
                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>{title}</p>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>{subtext}</p>
            </div>
            <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: theme.bg, color: theme.text, flexShrink: 0 }}>
                <Icon size={22} />
            </div>
        </div>
    );
};

export default StaffDashboard;
