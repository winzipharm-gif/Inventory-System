import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Search, Plus, Trash2, ShoppingCart, CheckCircle, Package } from 'lucide-react';
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
    const [mobileTab, setMobileTab] = useState('products'); // 'products' or 'cart'

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
    const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
            setMobileTab('products');
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
        <div className="pos-container">
            {/* Mobile View Toggle Switch */}
            <div className="pos-mobile-toggle">
                <button 
                    className={`pos-toggle-btn ${mobileTab === 'products' ? 'active' : ''}`}
                    onClick={() => setMobileTab('products')}
                >
                    <Package size={18} />
                    <span>Medicines</span>
                </button>
                <button 
                    className={`pos-toggle-btn ${mobileTab === 'cart' ? 'active' : ''}`}
                    onClick={() => setMobileTab('cart')}
                >
                    <ShoppingCart size={18} />
                    <span>Order ({totalItemCount})</span>
                    {cart.length > 0 && <span className="pos-cart-badge">₵{cartTotal.toFixed(2)}</span>}
                </button>
            </div>

            <div className="pos-layout-grid">
                {/* Left Column: Product Selection */}
                <div className={`pos-products-col ${mobileTab !== 'products' ? 'pos-hide-on-mobile' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        <div>
                            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Point of Sale</h2>
                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Select medicines to add to the customer order.</p>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 'var(--space-3)' }}>
                        <div className="search-bar" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
                            <Search size={18} className="text-muted" />
                            <input
                                type="search"
                                placeholder="Search medicine by brand or generic name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pos-products-grid">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="card pos-product-card">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{product.name}</h4>
                                    <p className="text-muted" style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.genericName}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                                        <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>₵{product.price.toFixed(2)}</span>
                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Stock: {product.stock}</span>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', minHeight: '36px', fontSize: '0.8rem', padding: '0.4rem', marginTop: '0.5rem' }}
                                    onClick={() => addToCart(product)}
                                >
                                    <Plus size={15} /> Add to Order
                                </button>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
                                No medicines found matching "{searchTerm}".
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Cart / Order */}
                <div className={`pos-cart-col ${mobileTab !== 'cart' ? 'pos-hide-on-mobile' : ''}`}>
                    <div className="card pos-cart-card">
                        <div className="pos-cart-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
                                <ShoppingCart size={20} color="var(--color-primary)" /> Current Order
                            </h3>
                            {cart.length > 0 && (
                                <button onClick={() => setCart([])} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-error)', cursor: 'pointer' }}>Clear</button>
                            )}
                        </div>

                        <div className="pos-cart-items-scroll">
                            {cart.length === 0 ? (
                                <div style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', gap: '0.75rem', padding: '2rem' }}>
                                    {checkoutComplete ? (
                                        <>
                                            <CheckCircle size={44} color="var(--color-success)" />
                                            <p style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>Sale Completed!</p>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={44} style={{ opacity: 0.15 }} />
                                            <p style={{ fontSize: '0.875rem' }}>No items in order yet.</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div className="pos-cart-table-head">
                                        <span>Item</span>
                                        <span style={{ textAlign: 'right' }}>Price</span>
                                        <span style={{ textAlign: 'center' }}>Qty</span>
                                        <span style={{ textAlign: 'right' }}>Total</span>
                                        <span></span>
                                    </div>
                                    {cart.map(item => (
                                        <div key={item.productId} className="pos-cart-row">
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.85rem' }}>
                                                {item.name}
                                            </div>
                                            <div style={{ textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                                ₵{item.price.toFixed(2)}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="pos-qty-btn"
                                                    aria-label="Decrease quantity"
                                                >−</button>
                                                <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="pos-qty-btn"
                                                    aria-label="Increase quantity"
                                                >+</button>
                                            </div>
                                            <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                                                ₵{(item.price * item.quantity).toFixed(2)}
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <button onClick={() => removeFromCart(item.productId)} style={{ color: 'var(--color-error)', cursor: 'pointer', padding: '4px' }} aria-label="Remove item">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pos-cart-footer">
                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer Info (Optional)</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-2)' }}>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="input-field"
                                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', minHeight: '36px' }}
                                        value={buyerDetails.name}
                                        onChange={(e) => setBuyerDetails({ ...buyerDetails, name: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Phone / Address"
                                        className="input-field"
                                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', minHeight: '36px' }}
                                        value={buyerDetails.address}
                                        onChange={(e) => setBuyerDetails({ ...buyerDetails, address: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Total ({totalItemCount} items)</span>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>₵{cartTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {isConfirming ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    <p style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
                                        Confirm payment of <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>₵{cartTotal.toFixed(2)}</span>?
                                    </p>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ flex: 1, minHeight: '44px', fontWeight: 600 }}
                                            onClick={handleCancelSale}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 1, minHeight: '44px', fontWeight: 700 }}
                                            onClick={handleConfirmSale}
                                        >
                                            ✓ Confirm
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', minHeight: '44px', fontSize: '0.95rem', fontWeight: 700, gap: '0.5rem' }}
                                    disabled={cart.length === 0 || isLoading}
                                    onClick={handleCheckout}
                                >
                                    <ShoppingCart size={18} /> {isLoading ? 'Processing...' : 'Complete Sale'}
                                </button>
                            )}
                        </div>
                    </div>
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

            <style>{`
                .pos-container {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                    height: calc(100vh - 100px);
                    height: calc(100dvh - 100px);
                }
                .pos-mobile-toggle {
                    display: none;
                    background: var(--color-bg-surface);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: 4px;
                    gap: 6px;
                }
                .pos-toggle-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    min-height: 42px;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                    background: transparent;
                    transition: all var(--transition-fast);
                }
                .pos-toggle-btn.active {
                    background: var(--color-primary);
                    color: white;
                    box-shadow: var(--shadow-sm);
                }
                .pos-cart-badge {
                    background: rgba(255, 255, 255, 0.25);
                    padding: 2px 8px;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                }
                .pos-layout-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 380px;
                    gap: var(--space-6);
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                }
                .pos-products-col {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                    overflow: hidden;
                    min-height: 0;
                }
                .pos-products-grid {
                    flex: 1;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
                    gap: var(--space-3);
                    padding-bottom: 2rem;
                    align-content: start;
                }
                .pos-product-card {
                    padding: var(--space-3);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .pos-cart-col {
                    height: 100%;
                    min-height: 0;
                }
                .pos-cart-card {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    padding: 0;
                    overflow: hidden;
                }
                .pos-cart-header {
                    padding: var(--space-3) var(--space-4);
                    border-bottom: 1px solid var(--color-border);
                    background-color: var(--color-bg-app);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .pos-cart-items-scroll {
                    flex: 1;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                    min-height: 0;
                }
                .pos-cart-table-head {
                    display: grid;
                    grid-template-columns: 2fr 1fr 90px 1fr 28px;
                    gap: 0.25rem;
                    padding: 0.4rem 0.75rem;
                    border-bottom: 2px solid var(--color-border);
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    position: sticky;
                    top: 0;
                    background-color: var(--color-bg-surface);
                    z-index: 1;
                }
                .pos-cart-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 90px 1fr 28px;
                    gap: 0.25rem;
                    align-items: center;
                    padding: 0.4rem 0.75rem;
                    border-bottom: 1px solid var(--color-border);
                }
                .pos-qty-btn {
                    width: 26px;
                    height: 26px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--color-border);
                    background: var(--color-bg-app);
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    touch-action: manipulation;
                }
                .pos-cart-footer {
                    padding: var(--space-4);
                    border-top: 1px solid var(--color-border);
                    background-color: var(--color-bg-app);
                }

                @media (max-width: 1024px) {
                    .pos-container {
                        height: auto;
                    }
                    .pos-mobile-toggle {
                        display: flex;
                    }
                    .pos-layout-grid {
                        grid-template-columns: 1fr;
                        height: auto;
                        overflow: visible;
                    }
                    .pos-hide-on-mobile {
                        display: none !important;
                    }
                    .pos-products-grid {
                        overflow: visible;
                        height: auto;
                    }
                    .pos-cart-card {
                        min-height: 400px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Sales;
