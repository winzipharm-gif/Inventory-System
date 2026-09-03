import React from 'react';
import { X, Printer, CheckCircle, FileText } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import logo from '../assets/logo.png';

const ReceiptModal = ({ isOpen, onClose, sale, onViewInvoice }) => {
    const { businessContact } = useInventory();
    if (!isOpen || !sale) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1100 }}>
            <div className="card receipt-card" style={{ 
                width: '100%', 
                maxWidth: '420px', 
                maxHeight: '90dvh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0, 
                animation: 'fadeIn 0.2s ease-out', 
                backgroundColor: 'white',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Sale Receipt</h3>
                    <button onClick={onClose} style={{ color: 'var(--color-text-muted)', padding: '4px' }} aria-label="Close receipt">
                        <X size={20} />
                    </button>
                </div>

                <div className="receipt-content" style={{ padding: 'var(--space-5)', color: '#333', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
                    {/* Pharmacy Details */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                        <img src={logo} alt="Winzi Pharmacy" style={{ height: '44px', marginBottom: '0.25rem', objectFit: 'contain' }} />
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0' }}>{businessContact.address}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0' }}>Tel: {businessContact.phone} | Email: {businessContact.email}</p>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                        <CheckCircle size={28} color="var(--color-success)" style={{ marginBottom: 'var(--space-1)' }} />
                        <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Payment Received</h4>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Receipt #{sale.id}</p>
                    </div>

                    {/* Buyer Details */}
                    <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ fontWeight: 700, fontSize: '0.7rem', marginBottom: 'var(--space-1)', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer</h5>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{sale.buyerDetails?.name || 'Cash Customer'}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{sale.buyerDetails?.address || 'N/A'}</p>
                    </div>

                    <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                        <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                            <span>Date:</span>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                    </div>

                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <h5 style={{ fontWeight: 700, fontSize: '0.7rem', marginBottom: 'var(--space-2)', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Purchased Items</h5>
                        {sale.details.map((item, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: '0.825rem' }}>
                                <span style={{ color: '#0f172a', fontWeight: 500 }}>{item.name} x {item.quantity} {item.unit || 'pcs'}</span>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>₵{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '2px solid #0f172a', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>TOTAL PAID</span>
                        <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--color-primary)' }}>₵{sale.total.toFixed(2)}</span>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                        Thank you for choosing Winzi Pharmacy!
                    </div>
                </div>

                <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-2)', flexShrink: 0, backgroundColor: '#f8fafc' }}>
                    <button onClick={onClose} className="btn btn-outline" style={{ flex: 1, minHeight: '40px' }}>Close</button>
                    <button
                        onClick={() => { onClose(); onViewInvoice(sale); }}
                        className="btn btn-outline"
                        style={{ flex: 1, gap: '0.4rem', minHeight: '40px' }}
                    >
                        <FileText size={16} /> Invoice
                    </button>
                    <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1.2, gap: '0.4rem', minHeight: '40px', fontWeight: 700 }}>
                        <Printer size={16} /> Print
                    </button>
                </div>
            </div>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .receipt-card, .receipt-card * {
                        visibility: visible;
                    }
                    .receipt-card {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-width: 100%;
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

export default ReceiptModal;
