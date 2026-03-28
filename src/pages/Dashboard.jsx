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
        <div>
            <div className="flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600 }}>Dashboard</h2>
                    <p className="text-muted">Overview of your pharmacy's performance.</p>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
                {/* Low Stock Table */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontWeight: 600 }}>Low Stock Warnings</h3>
                        <button
                            className="text-primary"
                            style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none' }}
                            onClick={() => navigate('/inventory')}
                        >
                            View All
                        </button>
                    </div>

                    {lowStockItems.length === 0 ? (
                        <div className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>All stock levels are healthy.</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem 0', color: 'var(--color-text-muted)', fontWeight: 500 }}>Medicine</th>
                                    <th style={{ padding: '0.75rem 0', color: 'var(--color-text-muted)', fontWeight: 500 }}>Category</th>
                                    <th style={{ padding: '0.75rem 0', color: 'var(--color-text-muted)', fontWeight: 500 }}>Stock</th>
                                    <th style={{ padding: '0.75rem 0', color: 'var(--color-text-muted)', fontWeight: 500 }}>Status</th>
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
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{item.name}</td>
                                        <td className="text-muted">{item.category}</td>
                                        <td style={{ fontWeight: 600 }}>{item.stock}</td>
                                        <td>
                                            <span style={{
                                                backgroundColor: '#fef2f2',
                                                color: 'var(--color-error)',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                Critical
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Recent Activity / Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className="card">
                        <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-4)' }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                            <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/sales')}>
                                <TrendingUp size={18} /> New Sale
                            </button>
                            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/inventory')}>
                                <Package size={18} /> Add Inventory
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon, color, subtext, isAlert, onClick }) => {
    const colorMap = {
        blue: { bg: '#eff6ff', text: '#3b82f6' },
        green: { bg: '#f0fdf4', text: '#22c55e' },
        orange: { bg: '#fff7ed', text: '#f97316' },
        purple: { bg: '#faf5ff', text: '#a855f7' },
    };

    const theme = colorMap[color] || colorMap.blue;

    return (
        <div
            className="card clickable-card"
            onClick={onClick}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}
        >
            <div>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: isAlert ? 'var(--color-error)' : 'var(--color-text-main)' }}>
                    {value}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>{subtext}</p>
            </div>
            <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: theme.bg,
                color: theme.text
            }}>
                <Icon size={24} />
            </div>
        </div>
    );
};

export default Dashboard;
