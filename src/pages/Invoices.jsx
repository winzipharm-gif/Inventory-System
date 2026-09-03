import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Search, Download, Printer, Eye } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import InvoiceModal from '../components/InvoiceModal';

const Invoices = () => {
    const { invoices } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredInvoices = invoices.filter(inv =>
        inv.id.toString().includes(searchTerm) ||
        (inv.buyerDetails?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleView = (invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleExportAll = () => {
        const data = invoices.map(inv => ({
            'Invoice ID': inv.id,
            'Date': new Date(inv.date).toLocaleDateString(),
            'Customer': inv.buyerDetails?.name || 'Cash Customer',
            'Items': inv.items,
            'Total Amount': `₵${inv.total.toFixed(2)}`
        }));
        exportToCSV(data, 'Winzi_Pharmacy_All_Invoices');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Invoices</h2>
                    <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Manage and track all customer invoices and receipts.</p>
                </div>
                <button className="btn btn-outline" style={{ minHeight: '40px' }} onClick={handleExportAll}>
                    <Download size={18} /> Export All
                </button>
            </div>

            <div className="card" style={{ padding: 'var(--space-3)' }}>
                <div className="search-bar" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
                    <Search size={18} className="text-muted" />
                    <input
                        type="search"
                        placeholder="Search by Invoice ID or Customer Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--color-bg-app)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Invoice #</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Date</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Customer</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Items</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv) => (
                                <tr
                                    key={inv.id}
                                    style={{
                                        borderBottom: '1px solid var(--color-border)',
                                        transition: 'background-color var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>#{inv.id}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)' }}>{new Date(inv.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>{inv.buyerDetails?.name || 'Cash Customer'}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)' }}>{inv.items} items</td>
                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-primary)' }}>₵{inv.total.toFixed(2)}</td>
                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn-icon"
                                                style={{ color: 'var(--color-primary)' }}
                                                onClick={() => handleView(inv)}
                                                title="View Invoice"
                                                aria-label={`View invoice ${inv.id}`}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                style={{ color: 'var(--color-primary)' }}
                                                onClick={() => handleView(inv)}
                                                title="Print Invoice"
                                                aria-label={`Print invoice ${inv.id}`}
                                            >
                                                <Printer size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        No invoices found matching "{searchTerm}".
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <InvoiceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    sale={selectedInvoice}
                />
            )}
        </div>
    );
};

export default Invoices;
