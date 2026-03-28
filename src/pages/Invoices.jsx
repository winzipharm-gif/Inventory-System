import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Search, FileText, Download, Printer, Eye } from 'lucide-react';
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600 }}>Invoices</h2>
                    <p className="text-muted">Manage and track all generated invoices.</p>
                </div>
                <button className="btn btn-outline" onClick={handleExportAll}>
                    <Download size={18} /> Export All
                </button>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)' }}>
                <div className="search-bar" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
                    <Search size={20} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Search by Invoice ID or Customer Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--color-bg-app)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Customer</th>
                            <th style={{ padding: '1rem' }}>Items</th>
                            <th style={{ padding: '1rem' }}>Total</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map((inv) => (
                            <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1rem' }}>#{inv.id}</td>
                                <td style={{ padding: '1rem' }}>{new Date(inv.date).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem' }}>{inv.buyerDetails?.name || 'Cash Customer'}</td>
                                <td style={{ padding: '1rem' }}>{inv.items} items</td>
                                <td style={{ padding: '1rem', fontWeight: 600 }}>₵{inv.total.toFixed(2)}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                        <button
                                            className="btn-icon"
                                            style={{ color: 'var(--color-primary)' }}
                                            onClick={() => handleView(inv)}
                                            title="View Invoice"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            style={{ color: 'var(--color-primary)' }}
                                            onClick={() => handleView(inv)} // Opens modal where print is available
                                            title="Print Invoice"
                                        >
                                            <Printer size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredInvoices.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No invoices found.
                    </div>
                )}
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
