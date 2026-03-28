import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Search, Plus, Trash2, ShoppingCart, CheckCircle, FileText } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';
import ReceiptModal from '../components/ReceiptModal';

const Sales = () => {
    const { inventory, recordSale } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [checkoutComplete, setCheckoutComplete] = useState(false);
    const [currentSale, setCurrentSale] = useState(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [buyerDetails, setBuyerDetails] = useState({ name: '', address: '' });

    const filteredProducts = inventory.filter(item =>
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.genericName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        item.stock > 0
    );

    const addToCart = (product) => {
        setCheckoutComplete(false);
        const existingItem = cart.find(item => item.productId === product.id);

        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                setCart(cart.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            } else {
                alert(`Cannot add more. Only ${product.stock} in stock.`);
            }
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                unit: product.unit || 'pcs',
                maxStock: product.stock
            }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;

        setCart(cart.map(item => {
            if (item.productId === productId) {
                if (newQuantity <= item.maxStock) {
                    return { ...item, quantity: newQuantity };
                } else {
                    alert(`Cannot add more. Only ${item.maxStock} in stock.`);
                    return item;
                }
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const [isConfirming, setIsConfirming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setIsConfirming(true);
    };

    const handleConfirmSale = async () => {
        setIsConfirming(false);
        setIsLoading(true);
        try {
            const sale = await recordSale(cart, buyerDetails);
            setCart([]);
            setBuyerDetails({ name: '', address: '' });
            setCurrentSale(sale);
            setIsReceiptModalOpen(true);
            setCheckoutComplete(true);
            setTimeout(() => setCheckoutComplete(false), 3000);
        } catch (err) {
            alert('Error completing sale: ' + err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelSale = () => {
        setIsConfirming(false);
    };


    const openInvoice = (sale) => {
        setSelectedInvoice(sale);
        setIsInvoiceModalOpen(true);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: 'var(--space-6)', height: 'calc(100vh - 100px)' }}>
            {/* Left Column: Product Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600 }}>Point of Sale</h2>
                        <p className="text-muted">Select products to add to the prescription.</p>
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-4)' }}>
                    <div className="search-bar" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
                        <Search size={20} className="text-muted" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div style={{ overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-3)', paddingBottom: '2rem' }}>
                    {filteredProducts.map(product => (
                        <div key={product.id} className="card" style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                            <div>
                                <h4 style={{ fontWeight: 600, fontSize: '0.925rem' }}>{product.name}</h4>
                                <p className="text-muted" style={{ fontSize: '0.75rem' }}>{product.genericName}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                                    <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>₵{product.price.toFixed(2)}</span>
                                    <span className="text-muted">Stock: {product.stock} {product.unit || 'pcs'}</span>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem' }}
                                onClick={() => addToCart(product)}
                            >
                                <Plus size={14} /> Add
                            </button>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>
                            No products found.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Cart / Receipt */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden', borderLeft: '1px solid var(--color-border)' }}>
                <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <ShoppingCart size={20} /> Current Order
                    </h3>
                    {cart.length > 0 && (
                        <button onClick={() => setCart([])} style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>Clear All</button>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                    {cart.length === 0 ? (
                        <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', gap: '0.75rem' }}>
                            {checkoutComplete ? (
                                <>
                                    <CheckCircle size={40} color="var(--color-success)" />
                                    <p>Sale Completed!</p>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={40} style={{ opacity: 0.1 }} />
                                    <p style={{ fontSize: '0.85rem' }}>Cart is empty</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div>
                            {/* Sticky table header */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 100px 1fr 32px',
                                gap: '0.25rem',
                                padding: '0.4rem 0.75rem',
                                borderBottom: '2px solid var(--color-border)',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: 'var(--color-text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                position: 'sticky',
                                top: 0,
                                backgroundColor: 'var(--color-bg-surface)',
                                zIndex: 1
                            }}>
                                <span>Item</span>
                                <span style={{ textAlign: 'right' }}>Price</span>
                                <span style={{ textAlign: 'center' }}>Qty</span>
                                <span style={{ textAlign: 'right' }}>Total</span>
                                <span></span>
                            </div>
                            {/* Cart rows */}
                            {cart.map(item => (
                                <div key={item.productId} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 100px 1fr 32px',
                                    gap: '0.25rem',
                                    alignItems: 'center',
                                    padding: '0.35rem 0.75rem',
                                    borderBottom: '1px solid var(--color-border)',
                                    fontSize: '0.82rem'
                                }}>
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                        {item.name}
                                    </div>
                                    <div style={{ textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                        ₵{item.price.toFixed(2)}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg-surface)', fontSize: '13px', cursor: 'pointer', lineHeight: 1 }}
                                        >−</button>
                                        <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem' }}>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg-surface)', fontSize: '13px', cursor: 'pointer', lineHeight: 1 }}
                                        >+</button>
                                    </div>
                                    <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.82rem' }}>
                                        ₵{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <button onClick={() => removeFromCart(item.productId)} style={{ color: 'var(--color-error)', opacity: 0.5, cursor: 'pointer', padding: '2px' }}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-app)' }}>
                    <div style={{ marginBottom: 'var(--space-3)' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buyer Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                            <input
                                type="text"
                                placeholder="Customer Name"
                                className="input-field"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                                value={buyerDetails.name}
                                onChange={(e) => setBuyerDetails({ ...buyerDetails, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Phone / Address"
                                className="input-field"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                                value={buyerDetails.address}
                                onChange={(e) => setBuyerDetails({ ...buyerDetails, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '0.82rem' }}>
                            <span className="text-muted">{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Total</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>₵{cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {isConfirming ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <p style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                                Confirm sale of <span style={{ color: 'var(--color-primary)' }}>₵{cartTotal.toFixed(2)}</span>?
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ flex: 1, padding: '0.65rem', fontWeight: 600 }}
                                    onClick={handleCancelSale}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '0.65rem', fontWeight: 700 }}
                                    onClick={handleConfirmSale}
                                >
                                    ✓ Yes, Complete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
                            disabled={cart.length === 0 || isLoading}
                            onClick={handleCheckout}
                        >
                            <ShoppingCart size={16} /> {isLoading ? 'Processing...' : 'Complete Sale'}
                        </button>
                    )}
                </div>
            </div>

            {isReceiptModalOpen && (
                <ReceiptModal
                    isOpen={isReceiptModalOpen}
                    onClose={() => setIsReceiptModalOpen(false)}
                    sale={currentSale}
                    onViewInvoice={openInvoice}
                />
            )}

            {isInvoiceModalOpen && (
                <InvoiceModal
                    isOpen={isInvoiceModalOpen}
                    onClose={() => setIsInvoiceModalOpen(false)}
                    sale={selectedInvoice}
                />
            )}
        </div>
    );
};

export default Sales;
