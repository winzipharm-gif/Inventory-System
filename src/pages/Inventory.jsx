import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Plus, Search, Edit2, Trash2, Filter, Settings2, Download } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import AddEditProductModal from '../components/AddEditProductModal';
import ManageMetadataModal from '../components/ManageMetadataModal';

const Inventory = () => {
    const { inventory, deleteProduct } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleExport = () => {
        const dataToExport = inventory.map(item => ({
            'Name': item.name,
            'Generic Name': item.genericName,
            'Category': item.category,
            'Stock': item.stock,
            'Unit': item.unit,
            'Price': item.price,
            'Expiry Date': item.expiryDate,
            'Date Received': item.receivedDate || 'N/A'
        }));
        exportToCSV(dataToExport, 'Winzi_Pharmacy_Inventory');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    return (
        <div>
            <div className="flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600 }}>Inventory</h2>
                    <p className="text-muted">Manage your medicine stock.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-outline" onClick={handleExport}>
                        <Download size={20} /> Export
                    </button>
                    <button className="btn btn-outline" onClick={() => setIsMetaModalOpen(true)}>
                        <Settings2 size={20} /> Manage Labels
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} /> Add New Product
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <div className="search-bar" style={{ flex: 1, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
                        <Search size={20} className="text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name, generic name, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-outline">
                        <Filter size={18} /> Filter
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--color-bg-app)', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Name</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Generic Name</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Category</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Stock</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Price</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Expiry</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventory.length > 0 ? (
                            filteredInventory.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{item.name}</td>
                                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{item.genericName}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            backgroundColor: 'var(--color-bg-app)',
                                            fontSize: '0.75rem',
                                            fontWeight: 500
                                        }}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            color: item.stock <= item.minStock ? 'var(--color-error)' : 'var(--color-success)',
                                            fontWeight: 600
                                        }}>
                                            {item.stock} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>{item.unit || 'pcs'}</span>
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>₵{item.price.toFixed(2)}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{item.expiryDate}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleEdit(item)}
                                                style={{ color: 'var(--color-primary)', padding: '4px' }}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleDelete(item.id)}
                                                style={{ color: 'var(--color-error)', padding: '4px' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <AddEditProductModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    product={editingProduct}
                />
            )}

            {isMetaModalOpen && (
                <ManageMetadataModal
                    isOpen={isMetaModalOpen}
                    onClose={() => setIsMetaModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Inventory;
