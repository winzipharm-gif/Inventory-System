import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import logo from '../assets/logo.png';
import { useInventory } from '../context/InventoryContext';

const InvoiceModal = ({ isOpen, onClose, sale }) => {
    const { businessContact } = useInventory();
    if (!isOpen || !sale) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1100 }}>
            <div className="card invoice-card" style={{ 
                width: '100%', 
                maxWidth: '780px', 
                maxHeight: '90dvh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0, 
                animation: 'fadeIn 0.2s ease-out', 
                backgroundColor: 'white',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: 'var(--space-4) var(--space-6)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={22} className="text-primary" />
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Invoice #{sale.id}</h3>
                    </div>
                    <button onClick={onClose} style={{ color: 'var(--color-text-muted)', padding: '4px' }} aria-label="Close invoice">
                        <X size={22} />
                    </button>
                </div>

                <div className="invoice-content" style={{ padding: 'clamp(1rem, 4vw, 2rem)', color: '#333', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
                    {/* Header: Logo & Company Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                        <div>
                            <img src={logo} alt="Winzi Pharmacy" style={{ height: '52px', marginBottom: '0.5rem', objectFit: 'contain' }} />
                            <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#475569' }}>{businessContact.address}</p>
                            <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#475569' }}>Tel: {businessContact.phone}</p>
                            <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#475569' }}>Email: {businessContact.email}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#cbd5e1', margin: 0, letterSpacing: '0.05em' }}>INVOICE</h2>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', margin: '2px 0' }}>Date: {new Date(sale.date).toLocaleDateString()}</p>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', margin: '2px 0' }}>Order ID: #{sale.id}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                        <div style={{ padding: 'var(--space-3)', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ textTransform: 'uppercase', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 700, letterSpacing: '0.04em' }}>Bill To</h4>
                            <p style={{ fontWeight: 700, margin: '2px 0', fontSize: '1rem', color: '#0f172a' }}>{sale.buyerDetails?.name || 'Cash Customer'}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{sale.buyerDetails?.address || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="table-responsive" style={{ marginBottom: 'var(--space-6)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #0f172a', color: '#475569' }}>
                                    <th style={{ textAlign: 'left', padding: '0.65rem 0', fontWeight: 700 }}>Description</th>
                                    <th style={{ textAlign: 'center', padding: '0.65rem 0', fontWeight: 700 }}>Qty</th>
                                    <th style={{ textAlign: 'right', padding: '0.65rem 0', fontWeight: 700 }}>Unit Price</th>
                                    <th style={{ textAlign: 'right', padding: '0.65rem 0', fontWeight: 700 }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.details.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '0.65rem 0', fontWeight: 500, color: '#0f172a' }}>{item.name}</td>
                                        <td style={{ textAlign: 'center', padding: '0.65rem 0', color: '#475569' }}>{item.quantity} {item.unit || 'pcs'}</td>
                                        <td style={{ textAlign: 'right', padding: '0.65rem 0', color: '#475569' }}>₵{item.price.toFixed(2)}</td>
                                        <td style={{ textAlign: 'right', padding: '0.65rem 0', fontWeight: 600, color: '#0f172a' }}>₵{(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '100%', maxWidth: '260px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.85rem' }}>
                                <span style={{ color: '#64748b' }}>Subtotal</span>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>₵{sale.total.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.85rem' }}>
                                <span style={{ color: '#64748b' }}>Tax (0%)</span>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>₵0.00</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '2px solid var(--color-primary)', marginTop: '0.25rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>Total</span>
                                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary)' }}>₵{sale.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-3)', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                        <p style={{ fontWeight: 600, color: '#0f172a', margin: '2px 0' }}>Payment Method: Cash / Direct</p>
                        <p style={{ margin: 0 }}>Thank you for your business!</p>
                    </div>
                </div>

                <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-3)', backgroundColor: '#f8fafc', flexShrink: 0 }}>
                    <button onClick={onClose} className="btn btn-outline" style={{ flex: 1, minHeight: '42px' }}>Close</button>
                    <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 2, gap: '0.5rem', fontSize: '1rem', fontWeight: 700, minHeight: '42px' }}>
                        <Printer size={18} /> Print Invoice
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
