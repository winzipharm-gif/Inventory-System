/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { X } from 'lucide-react';

const AddEditProductModal = ({ isOpen, onClose, product }) => {
    const { addProduct, updateProduct, categories, units } = useInventory();
    const [formData, setFormData] = useState({
        name: '',
        genericName: '',
        category: '',
        unit: 'pcs',
        stock: 0,
        minStock: 10,
        price: 0,
        expiryDate: ''
    });

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                unit: product.unit || 'pcs'
            });
        } else {
            setFormData({
                name: '',
                genericName: '',
                category: product?.category || categories[0] || '',
                unit: product?.unit || units[0] || 'pcs',
                stock: 0,
                minStock: 10,
                price: 0,
                expiryDate: ''
            });
        }
    }, [product, isOpen, categories, units]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (product) {
            updateProduct(product.id, {
                ...formData,
                stock: Number(formData.stock),
                minStock: Number(formData.minStock),
                price: Number(formData.price)
            });
        } else {
            addProduct({
                ...formData,
                stock: Number(formData.stock),
                minStock: Number(formData.minStock),
                price: Number(formData.price)
            });
        }
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1100 }}>
            <div className="card" style={{ 
                width: '100%', 
                maxWidth: '580px', 
                maxHeight: '90dvh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0, 
                animation: 'fadeIn 0.2s ease-out',
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
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                        {product ? 'Edit Medicine Details' : 'Add New Medicine'}
                    </h3>
                    <button onClick={onClose} style={{ color: 'var(--color-text-muted)', padding: '4px' }} aria-label="Close modal">
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 'var(--space-5)', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.85rem' }}>Brand / Product Name</label>
                            <input
                                required
                                className="input-field"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Panadol Extra"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.85rem' }}>Generic Name</label>
                            <input
                                required
                                className="input-field"
                                name="genericName"
                                value={formData.genericName}
                                onChange={handleChange}
                                placeholder="e.g. Paracetamol"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.85rem' }}>Category</label>
                            <select
                                required
                                className="input-field"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.85rem' }}>Dispensing Unit</label>
                            <select
                                required
                                className="input-field"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                            >
                                {units.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.85rem' }}>Current Stock Quantity</label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="input-field"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.85rem' }}>Min. Stock Alert Level</label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="input-field"
                                name="minStock"
                                value={formData.minStock}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.85rem' }}>Price (₵)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0"
                                className="input-field"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.85rem' }}>Expiry Date</label>
                            <input
                                required
                                type="date"
                                className="input-field"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                        <button type="button" className="btn btn-outline" style={{ minHeight: '42px' }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ minHeight: '42px', fontWeight: 700 }}>{product ? 'Update Details' : 'Save Medicine'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditProductModal;
