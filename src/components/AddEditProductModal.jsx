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
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', padding: 0, animation: 'fadeIn 0.2s ease-out' }}>
                <div style={{
                    padding: 'var(--space-4) var(--space-6)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Product Name</label>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Generic Name</label>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Unit</label>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Current Stock</label>
                            <input
                                required
                                type="number"
                                className="input-field"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Min. Stock Level</label>
                            <input
                                required
                                type="number"
                                className="input-field"
                                name="minStock"
                                value={formData.minStock}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Price ($)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="input-field"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Expiry Date</label>
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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{product ? 'Update Details' : 'Save Product'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditProductModal;
