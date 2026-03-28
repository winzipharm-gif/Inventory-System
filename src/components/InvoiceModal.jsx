import { X, Printer, Download, FileText } from 'lucide-react';
import logo from '../assets/logo.png';
import { useInventory } from '../context/InventoryContext';

const InvoiceModal = ({ isOpen, onClose, sale }) => {
    const { businessContact } = useInventory();
    if (!isOpen || !sale) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card invoice-card" style={{ width: '100%', maxWidth: '800px', padding: 0, animation: 'fadeIn 0.2s ease-out', backgroundColor: 'white' }}>
                <div style={{
                    padding: 'var(--space-4) var(--space-6)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-bg-app)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={24} className="text-primary" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Invoice #{sale.id}</h3>
                    </div>
                    <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="invoice-content" style={{ padding: 'var(--space-8)', color: '#333' }}>
                    {/* Header: Logo & Company Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
                        <div>
                            <img src={logo} alt="Winzi Pharmacy" style={{ height: '60px', marginBottom: '0.5rem' }} />
                            <p style={{ margin: '0.25rem 0' }}>{businessContact.address}</p>
                            <p style={{ margin: '0.25rem 0' }}>Tel: {businessContact.phone}</p>
                            <p style={{ margin: '0.25rem 0' }}>Email: {businessContact.email}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#e5e7eb', margin: 0 }}>INVOICE</h2>
                            <p style={{ fontWeight: 600 }}>Date: {new Date(sale.date).toLocaleDateString()}</p>
                            <p style={{ fontWeight: 600 }}>Order ID: {sale.id}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
                        <div>
                            <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>Bill To</h4>
                            <p style={{ fontWeight: 700, margin: '0.25rem 0', fontSize: '1.1rem' }}>{sale.buyerDetails?.name || 'Cash Customer'}</p>
                            <p style={{ margin: '0 0' }}>{sale.buyerDetails?.address || 'N/A'}</p>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 'var(--space-8)' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--color-text-main)', color: 'var(--color-text-muted)' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem 0' }}>Description</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem 0' }}>Qty</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 0' }}>Unit Price</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 0' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.details.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '0.75rem 0' }}>{item.name}</td>
                                    <td style={{ textAlign: 'center', padding: '0.75rem 0' }}>{item.quantity} {item.unit || 'pcs'}</td>
                                    <td style={{ textAlign: 'right', padding: '0.75rem 0' }}>₵{item.price.toFixed(2)}</td>
                                    <td style={{ textAlign: 'right', padding: '0.75rem 0' }}>₵{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '250px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                                <span style={{ fontWeight: 600 }}>₵{sale.total.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Tax (0%)</span>
                                <span style={{ fontWeight: 600 }}>₵0.00</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: '2px solid var(--color-primary)', marginTop: '0.5rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>Total</span>
                                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary)' }}>₵{sale.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.875rem' }}>
                        <p style={{ fontWeight: 600 }}>Payment Method: Cash</p>
                        <p className="text-muted">Thank you for your business!</p>
                    </div>
                </div>

                <div style={{ padding: 'var(--space-6)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-3)', backgroundColor: 'var(--color-bg-app)' }}>
                    <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
                    <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 2, gap: '0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>
                        <Printer size={22} /> PRINT INVOICE
                    </button>
                </div>
            </div>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .invoice-card, .invoice-card * {
                        visibility: visible;
                    }
                    .invoice-card {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-width: none;
                        box-shadow: none;
                        border: none;
                        background: white !important;
                    }
                    .btn, .sidebar-overlay::before, button {
                        display: none !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoiceModal;
