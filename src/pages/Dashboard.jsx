/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import {
    TrendingUp, AlertTriangle, Package, DollarSign, Activity,
    Users, ChevronDown, ChevronRight, Clock, ArrowLeft, Eye
} from 'lucide-react';

const Dashboard = () => {
    const { inventory, sales } = useInventory();
    const navigate = useNavigate();

    // ─── Staff drill-down state ───
    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [expandedSaleId, setExpandedSaleId] = useState(null);

    // ─── Inventory Metrics ───
    const totalProducts = inventory.length;
    const lowStockItems = inventory.filter(item => item.stock <= item.minStock);
    const totalValue = inventory.reduce((acc, item) => acc + (item.price * item.stock), 0);

    // ─── Sales Calculations ───
    const now = new Date();
    const today = now.toDateString();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const todaysSales = sales
        .filter(sale => new Date(sale.date).toDateString() === today)
        .reduce((acc, sale) => acc + sale.total, 0);

    const thisMonthSales = sales
        .filter(sale => {
            const date = new Date(sale.date);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        })
        .reduce((acc, sale) => acc + sale.total, 0);

    const lastMonthSales = sales
        .filter(sale => {
            const date = new Date(sale.date);
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        })
        .reduce((acc, sale) => acc + sale.total, 0);

    const ytdSales = sales
        .filter(sale => new Date(sale.date).getFullYear() === thisYear)
        .reduce((acc, sale) => acc + sale.total, 0);

    // ─── Product Movement ───
    const productSalesMap = {};
    sales.forEach(sale => {
        if (sale.details) {
            sale.details.forEach(item => {
                productSalesMap[item.productId] = (productSalesMap[item.productId] || 0) + item.quantity;
            });
        }
    });

    const sortedMovement = Object.entries(productSalesMap)
        .sort(([, a], [, b]) => b - a);

    const fastestMovingId = sortedMovement[0]?.[0];
    const leastMovingId = sortedMovement[sortedMovement.length - 1]?.[0];
    const fastestProduct = fastestMovingId ? inventory.find(p => p.id === Number(fastestMovingId)) : null;
    const leastProduct = leastMovingId ? inventory.find(p => p.id === Number(leastMovingId)) : null;

    const momGrowth = lastMonthSales === 0
        ? (thisMonthSales > 0 ? 100 : 0)
        : ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100;

    // ─── Sales grouped by staff ───
    const staffSalesSummary = useMemo(() => {
        const staffMap = {};
        sales.forEach(sale => {
            const staffId = sale.staffUserId || '_unattributed';
            const staffName = sale.staffName || 'Unattributed';
            if (!staffMap[staffId]) {
                staffMap[staffId] = {
                    staffId,
                    staffName,
                    totalSales: 0,
                    transactionCount: 0,
                    todaySales: 0,
                    todayCount: 0,
                    monthSales: 0,
                    sales: []
                };
            }
            staffMap[staffId].totalSales += sale.total;
            staffMap[staffId].transactionCount += 1;
            staffMap[staffId].sales.push(sale);

            const saleDate = new Date(sale.date);
            if (saleDate.toDateString() === today) {
                staffMap[staffId].todaySales += sale.total;
                staffMap[staffId].todayCount += 1;
            }
            if (saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear) {
                staffMap[staffId].monthSales += sale.total;
            }
        });

        return Object.values(staffMap).sort((a, b) => b.totalSales - a.totalSales);
    }, [sales, today, thisMonth, thisYear]);

    const selectedStaff = selectedStaffId
        ? staffSalesSummary.find(s => s.staffId === selectedStaffId)
        : null;

    const toggleExpand = (saleId) => {
        setExpandedSaleId(prev => prev === saleId ? null : saleId);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Dashboard</h2>
                    <p className="text-muted">Overview of your pharmacy's performance.</p>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', paddingTop: 'var(--space-1)' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* ─── Key Metrics Grid ─── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: 'var(--space-4)'
            }}>
                <MetricCard title="Total Inventory" value={totalProducts} icon={Package} color="blue" subtext="Items in stock" onClick={() => navigate('/inventory')} />
                <MetricCard title="Low Stock Alert" value={lowStockItems.length} icon={AlertTriangle} color="orange" isAlert={lowStockItems.length > 0} subtext="Items need attention" onClick={() => navigate('/inventory')} />
                <MetricCard title="Today's Sales" value={`₵${todaysSales.toFixed(2)}`} icon={DollarSign} color="green" subtext="Revenue recorded today" onClick={() => navigate('/sales')} />
                <MetricCard title="Fastest Moving" value={fastestProduct?.name || 'N/A'} icon={TrendingUp} color="green" subtext={fastestMovingId ? `${productSalesMap[fastestMovingId]} units sold` : 'No sales yet'} onClick={() => navigate('/sales')} />
                <MetricCard title="Least Moving" value={leastProduct?.name || 'N/A'} icon={Activity} color="orange" subtext={leastMovingId ? `${productSalesMap[leastMovingId]} units sold` : 'No sales yet'} onClick={() => navigate('/sales')} />
                <MetricCard title="Monthly Sales" value={`₵${thisMonthSales.toFixed(2)}`} icon={TrendingUp} color="blue" subtext={`${momGrowth >= 0 ? '+' : ''}${momGrowth.toFixed(1)}% vs last month`} onClick={() => navigate('/sales')} />
                <MetricCard title="YTD Revenue" value={`₵${ytdSales.toFixed(2)}`} icon={Activity} color="purple" subtext={`Total sales in ${thisYear}`} onClick={() => navigate('/sales')} />
                <MetricCard title="Inventory Value" value={`₵${totalValue.toLocaleString()}`} icon={DollarSign} color="green" subtext="Total asset value" onClick={() => navigate('/inventory')} />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
                gap: 'var(--space-6)',
                alignItems: 'start'
            }}>
                {/* Low Stock Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-4) var(--space-5)',
                        borderBottom: '1px solid var(--color-border)'
                    }}>
                        <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-base)' }}>Low Stock Warnings</h3>
                        <button
                            className="text-primary"
                            style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}
                            onClick={() => navigate('/inventory')}
                        >
                            View All
                        </button>
                    </div>

                    {lowStockItems.length === 0 ? (
                        <div className="text-muted" style={{ padding: '2.5rem', textAlign: 'center' }}>All stock levels are healthy.</div>
                    ) : (
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-app)', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Medicine</th>
                                        <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Category</th>
                                        <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Stock</th>
                                        <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockItems.slice(0, 5).map(item => (
                                        <tr
                                            key={item.id}
                                            onClick={() => navigate('/inventory')}
                                            style={{
                                                borderBottom: '1px solid var(--color-border)',
                                                cursor: 'pointer',
                                                transition: 'background-color var(--transition-fast)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{item.name}</td>
                                            <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{item.category}</td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-error)' }}>{item.stock} {item.unit || 'pcs'}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{
                                                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                                    color: 'var(--color-error)',
                                                    padding: '3px 8px',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700
                                                }}>
                                                    Low
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-4)' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <button className="btn btn-primary" style={{ justifyContent: 'flex-start', minHeight: '44px' }} onClick={() => navigate('/sales')}>
                            <TrendingUp size={18} /> New POS Sale
                        </button>
                        <button className="btn btn-outline" style={{ justifyContent: 'flex-start', minHeight: '44px' }} onClick={() => navigate('/inventory')}>
                            <Package size={18} /> Add New Medicine
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                SALES BY STAFF — Admin drill-down section
            ═══════════════════════════════════════════════════════ */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: '1px solid var(--color-border)',
                    background: 'var(--color-bg-app)'
                }}>
                    {selectedStaff ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <button
                                onClick={() => { setSelectedStaffId(null); setExpandedSaleId(null); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600,
                                    fontSize: 'var(--font-size-sm)', background: 'none', border: 'none'
                                }}
                            >
                                <ArrowLeft size={16} /> Back
                            </button>
                            <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
                                Sales by {selectedStaff.staffName}
                            </h3>
                            <span style={{
                                background: 'var(--color-primary-light)',
                                color: 'var(--color-primary)',
                                padding: '2px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: 700
                            }}>
                                {selectedStaff.transactionCount} transaction{selectedStaff.transactionCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    ) : (
                        <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={18} /> Sales by Staff
                        </h3>
                    )}
                </div>

                {/* Staff summary cards (overview) */}
                {!selectedStaff && (
                    staffSalesSummary.length === 0 ? (
                        <div className="text-muted" style={{ padding: '2.5rem', textAlign: 'center' }}>
                            No sales recorded yet.
                        </div>
                    ) : (
                        <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                                gap: 'var(--space-4)'
                            }}>
                                {staffSalesSummary.map(staff => (
                                    <StaffSummaryCard
                                        key={staff.staffId}
                                        staff={staff}
                                        onClick={() => { setSelectedStaffId(staff.staffId); setExpandedSaleId(null); }}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                )}

                {/* Drill-down: individual staff sales table */}
                {selectedStaff && (
                    <div>
                        {/* Mini metrics for this staff */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-4) var(--space-5)',
                            borderBottom: '1px solid var(--color-border)'
                        }}>
                            <MiniStat label="Today" value={`₵${selectedStaff.todaySales.toFixed(2)}`} sub={`${selectedStaff.todayCount} sale${selectedStaff.todayCount !== 1 ? 's' : ''}`} />
                            <MiniStat label="This Month" value={`₵${selectedStaff.monthSales.toFixed(2)}`} />
                            <MiniStat label="All Time" value={`₵${selectedStaff.totalSales.toFixed(2)}`} sub={`${selectedStaff.transactionCount} total`} />
                        </div>

                        {/* Sales rows */}
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
                                    {selectedStaff.sales
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map(sale => (
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
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                            <Clock size={13} />
                                                            {new Date(sale.date).toLocaleString('en-US', {
                                                                month: 'short', day: 'numeric', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
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

                                                {expandedSaleId === sale.id && sale.details && (
                                                    <tr>
                                                        <td colSpan="6" style={{ padding: 0 }}>
                                                            <AdminSaleDetailPanel sale={sale} />
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


/* ─── Staff Summary Card (for overview grid) ─── */
const StaffSummaryCard = ({ staff, onClick }) => (
    <div
        className="card"
        onClick={onClick}
        style={{
            padding: 'var(--space-4)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.borderColor = 'var(--color-primary)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 'var(--font-size-base)',
                    flexShrink: 0
                }}>
                    {staff.staffName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{staff.staffName}</p>
                    <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                        {staff.transactionCount} sale{staff.transactionCount !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
            <Eye size={16} className="text-muted" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            <div style={{ background: 'var(--color-bg-app)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Today</p>
                <p style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>₵{staff.todaySales.toFixed(2)}</p>
            </div>
            <div style={{ background: 'var(--color-bg-app)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>All Time</p>
                <p style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>₵{staff.totalSales.toFixed(2)}</p>
            </div>
        </div>
    </div>
);


/* ─── Mini stat display for drill-down header ─── */
const MiniStat = ({ label, value, sub }) => (
    <div style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px'
    }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontWeight: 800, fontSize: 'var(--font-size-base)', color: 'var(--color-primary)' }}>{value}</p>
        {sub && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{sub}</p>}
    </div>
);


/* ─── Expanded item detail panel ─── */
const AdminSaleDetailPanel = ({ sale }) => (
    <div style={{
        margin: '0 1rem 0.75rem 1rem',
        padding: 'var(--space-4)',
        background: 'var(--color-bg-app)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        animation: 'slideDown 0.15s ease-out'
    }}>
        <p style={{
            fontWeight: 600, fontSize: 'var(--font-size-xs)',
            textTransform: 'uppercase', color: 'var(--color-text-muted)',
            letterSpacing: '0.04em', marginBottom: 'var(--space-3)'
        }}>
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
                    <td colSpan="3" style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>Total:</td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 800, color: 'var(--color-primary)', fontSize: 'var(--font-size-base)' }}>₵{sale.total.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
    </div>
);


/* ─── Metric card (existing pattern, preserved) ─── */
const MetricCard = ({ title, value, icon: Icon, color, subtext, isAlert, onClick }) => {
    const colorMap = {
        blue: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6' },
        green: { bg: 'rgba(34, 197, 94, 0.12)', text: '#22c55e' },
        orange: { bg: 'rgba(249, 115, 22, 0.12)', text: '#f97316' },
        purple: { bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7' },
    };

    const theme = colorMap[color] || colorMap.blue;

    return (
        <div
            className="card"
            onClick={onClick}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                cursor: 'pointer',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                minHeight: '120px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            <div style={{ overflow: 'hidden', paddingRight: 'var(--space-2)' }}>
                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>{title}</p>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: isAlert ? 'var(--color-error)' : 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {value}
                </h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtext}</p>
            </div>
            <div style={{
                padding: '0.65rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: theme.bg,
                color: theme.text,
                flexShrink: 0
            }}>
                <Icon size={22} />
            </div>
        </div>
    );
};

export default Dashboard;
