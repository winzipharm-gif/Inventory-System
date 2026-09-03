/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { TrendingUp, AlertTriangle, Package, DollarSign, Activity } from 'lucide-react';

const Dashboard = () => {
    const { inventory, sales } = useInventory();
    const navigate = useNavigate();

    // Metrics Calculations
    const totalProducts = inventory.length;
    const lowStockItems = inventory.filter(item => item.stock <= item.minStock);
    const totalValue = inventory.reduce((acc, item) => acc + (item.price * item.stock), 0);

    // Sales Calculations
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

    // Product Movement Calculations
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

    // MoM Calculation
    const momGrowth = lastMonthSales === 0
        ? (thisMonthSales > 0 ? 100 : 0)
        : ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100;

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

            {/* Key Metrics Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', 
                gap: 'var(--space-4)' 
            }}>
                <MetricCard
                    title="Total Inventory"
                    value={totalProducts}
                    icon={Package}
                    color="blue"
                    subtext="Items in stock"
                    onClick={() => navigate('/inventory')}
                />
                <MetricCard
                    title="Low Stock Alert"
                    value={lowStockItems.length}
                    icon={AlertTriangle}
                    color="orange"
                    isAlert={lowStockItems.length > 0}
                    subtext="Items need attention"
                    onClick={() => navigate('/inventory')}
                />
                <MetricCard
                    title="Today's Sales"
                    value={`₵${todaysSales.toFixed(2)}`}
                    icon={DollarSign}
                    color="green"
                    subtext="Revenue recorded today"
                    onClick={() => navigate('/sales')}
                />
                <MetricCard
                    title="Fastest Moving"
                    value={fastestProduct?.name || 'N/A'}
                    icon={TrendingUp}
                    color="green"
                    subtext={fastestMovingId ? `${productSalesMap[fastestMovingId]} units sold` : 'No sales yet'}
                    onClick={() => navigate('/sales')}
                />
                <MetricCard
                    title="Least Moving"
                    value={leastProduct?.name || 'N/A'}
                    icon={Activity}
                    color="orange"
                    subtext={leastMovingId ? `${productSalesMap[leastMovingId]} units sold` : 'No sales yet'}
                    onClick={() => navigate('/sales')}
                />
                <MetricCard
                    title="Monthly Sales"
                    value={`₵${thisMonthSales.toFixed(2)}`}
                    icon={TrendingUp}
                    color="blue"
                    subtext={`${momGrowth >= 0 ? '+' : ''}${momGrowth.toFixed(1)}% vs last month`}
                    onClick={() => navigate('/sales')}
                />
                <MetricCard
                    title="YTD Revenue"
                    value={`₵${ytdSales.toFixed(2)}`}
                    icon={Activity}
                    color="purple"
                    subtext={`Total sales in ${thisYear}`}
                    onClick={() => navigate('/sales')}
                />
                <MetricCard
                    title="Inventory Value"
                    value={`$${totalValue.toLocaleString()}`}
                    icon={DollarSign}
                    color="green"
                    subtext="Total asset value"
                    onClick={() => navigate('/inventory')}
                />
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
        </div>
    );
};

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
