import { X, Printer, CheckCircle, FileText } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

const ReceiptModal = ({ isOpen, onClose, sale, onViewInvoice }) => {
    const { businessContact } = useInventory();
    if (!isOpen || !sale) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card receipt-card" style={{ width: '100%', maxWidth: '400px', padding: 0, animation: 'fadeIn 0.2s ease-out', backgroundColor: 'white' }}>
                <div style={{
                    padding: 'var(--space-4) var(--space-6)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Sale Receipt</h3>
                    <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="receipt-content" style={{ padding: 'var(--space-6)', color: '#333' }}>
                    {/* Pharmacy Details */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
                        <h2 style={{ color: 'var(--color-primary)', fontWeight: 700, margin: 0 }}>WINZI PHARMACY</h2>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{businessContact.address}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Tel: {businessContact.phone} | Email: {businessContact.email}</p>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                        <CheckCircle size={32} color="var(--color-success)" style={{ marginBottom: 'var(--space-1)' }} />
                        <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Payment Successful</h4>
                        <p className="text-muted" style={{ fontSize: '0.75rem' }}>Receipt ID: #{sale.id}</p>
                    </div>

                    {/* Buyer Details */}
                    <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-app)', borderRadius: 'var(--radius-md)' }}>
                        <h5 style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Customer Details</h5>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{sale.buyerDetails?.name || 'Cash Customer'}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{sale.buyerDetails?.address || 'N/A'}</p>
                    </div>

                    <div style={{ borderBottom: '1px dashed var(--color-border)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                            <span className="text-muted">Date:</span>
                            <span>{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString()}</span>
                        </p>
                    </div>

                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h5 style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: 'var(--space-3)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>ITEMS</h5>
                        {sale.details.map((item, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>
                                <span>{item.name} x {item.quantity} {item.unit || 'pcs'}</span>
                                <span>₵{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '2px solid var(--color-text-main)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>TOTAL PAID</span>
                        <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--color-primary)' }}>₵{sale.total.toFixed(2)}</span>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        Thank you for choosing Winzi Pharmacy!
                    </div>
                </div>

                <div style={{ padding: 'var(--space-6)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-3)' }}>
                    <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
                    <button
                        onClick={() => { onClose(); onViewInvoice(sale); }}
                        className="btn btn-outline"
                        style={{ flex: 1, gap: '0.5rem' }}
                    >
                        <FileText size={18} /> Invoice
                    </button>
                    <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, gap: '0.5rem' }}>
                        <Printer size={18} /> Print
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
            max-width: none;
            box-shadow: none;
            border: none;
          }
          .btn, .sidebar-overlay::before, button {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
};

export default ReceiptModal;
