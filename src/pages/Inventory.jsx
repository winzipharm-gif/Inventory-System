import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Plus, Edit2, Trash2, Search, SlidersHorizontal, Download, Upload, Tag } from 'lucide-react';
import AddEditProductModal from '../components/AddEditProductModal';
import ManageMetadataModal from '../components/ManageMetadataModal';

const Inventory = () => {
    const { inventory, deleteProduct, categories, exportToCSV, importFromCSV } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.genericName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleFileImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            importFromCSV(file);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Header Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Inventory Management</h2>
                    <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Manage your medicines, stock levels, and categories.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" style={{ minHeight: '40px' }} onClick={() => setIsMetaModalOpen(true)}>
                        <Tag size={18} /> Manage Labels
                    </button>
                    <button className="btn btn-outline" style={{ minHeight: '40px' }} onClick={exportToCSV}>
                        <Download size={18} /> Export
                    </button>
                    <label className="btn btn-outline" style={{ cursor: 'pointer', minHeight: '40px', margin: 0 }}>
                        <Upload size={18} /> Import
                        <input type="file" accept=".csv" onChange={handleFileImport} style={{ display: 'none' }} />
                    </label>
                    <button className="btn btn-primary" style={{ minHeight: '40px' }} onClick={handleAdd}>
                        <Plus size={18} /> Add Medicine
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="card" style={{ padding: 'var(--space-3)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <div className="search-bar" style={{ flex: '1 1 240px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
                        <Search size={18} className="text-muted" />
                        <input
                            type="search"
                            placeholder="Search by brand or generic name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: '0 1 200px' }}>
                        <SlidersHorizontal size={18} className="text-muted" />
                        <select
                            className="input-field"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{ minHeight: '40px' }}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-app)', textAlign: 'left' }}>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Medicine & Generic</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Category</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Stock</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Price</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Expiry</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map((product) => {
                                const isLowStock = product.stock <= product.minStock;
                                return (
                                    <tr
                                        key={product.id}
                                        style={{
                                            borderBottom: '1px solid var(--color-border)',
                                            transition: 'background-color var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{product.genericName}</div>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)' }}>{product.category}</td>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                                            {product.stock} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>{product.unit || 'pcs'}</span>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>₵{Number(product.price).toFixed(2)}</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{product.expiryDate}</td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <span style={{
                                                backgroundColor: isLowStock ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                                color: isLowStock ? 'var(--color-error)' : 'var(--color-success)',
                                                padding: '3px 8px',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.75rem',
                                                fontWeight: 700
                                            }}>
                                                {isLowStock ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="btn-icon"
                                                    style={{ color: 'var(--color-primary)' }}
                                                    aria-label={`Edit ${product.name}`}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteProduct(product.id)}
                                                    className="btn-icon"
                                                    style={{ color: 'var(--color-error)' }}
                                                    aria-label={`Delete ${product.name}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredInventory.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                                        No medicines found matching the current search criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddEditProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
            />

            <ManageMetadataModal
                isOpen={isMetaModalOpen}
                onClose={() => setIsMetaModalOpen(false)}
            />
        </div>
    );
};

export default Inventory;
