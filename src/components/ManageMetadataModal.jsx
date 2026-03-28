import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { X, Plus, Trash2, Tag, Ruler, Edit2 } from 'lucide-react';

const ManageMetadataModal = ({ isOpen, onClose }) => {
    const {
        categories, units,
        addCategory, deleteCategory, updateCategory,
        addUnit, deleteUnit, updateUnit
    } = useInventory();
    const [activeTab, setActiveTab] = useState('categories');
    const [newItem, setNewItem] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [editText, setEditText] = useState('');

    if (!isOpen) return null;

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        if (activeTab === 'categories') {
            addCategory(newItem.trim());
        } else {
            addUnit(newItem.trim());
        }
        setNewItem('');
    };

    const handleStartEdit = (item) => {
        setEditingItem(item);
        setEditText(item);
    };

    const handleSaveEdit = (oldItem) => {
        if (!editText.trim() || editText === oldItem) {
            setEditingItem(null);
            return;
        }

        if (activeTab === 'categories') {
            updateCategory(oldItem, editText.trim());
        } else {
            updateUnit(oldItem, editText.trim());
        }
        setEditingItem(null);
    };

    return (
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: 0, animation: 'fadeIn 0.2s ease-out' }}>
                <div style={{
                    padding: 'var(--space-4) var(--space-6)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Manage Labels</h3>
                    <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
                    <button
                        onClick={() => { setActiveTab('categories'); setEditingItem(null); }}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            border: 'none',
                            background: 'none',
                            fontWeight: 600,
                            color: activeTab === 'categories' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            borderBottom: activeTab === 'categories' ? '2px solid var(--color-primary)' : '2px solid transparent',
                            cursor: 'pointer'
                        }}
                    >
                        Categories
                    </button>
                    <button
                        onClick={() => { setActiveTab('units'); setEditingItem(null); }}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            border: 'none',
                            background: 'none',
                            fontWeight: 600,
                            color: activeTab === 'units' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            borderBottom: activeTab === 'units' ? '2px solid var(--color-primary)' : '2px solid transparent',
                            cursor: 'pointer'
                        }}
                    >
                        Units
                    </button>
                </div>

                <div style={{ padding: 'var(--space-6)' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                        <input
                            className="input-field"
                            placeholder={activeTab === 'categories' ? "New Category Name" : "New Unit (e.g. packs)"}
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}>
                            <Plus size={20} />
                        </button>
                    </form>

                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Existing {activeTab === 'categories' ? 'Categories' : 'Units'}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {(activeTab === 'categories' ? categories : units).map((item) => (
                                <div
                                    key={item}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'var(--color-bg-app)',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1 }}>
                                        {activeTab === 'categories' ? <Tag size={16} className="text-muted" /> : <Ruler size={16} className="text-muted" />}
                                        {editingItem === item ? (
                                            <input
                                                className="input-field"
                                                style={{ padding: '4px 8px', height: 'auto', fontSize: '0.875rem' }}
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit(item);
                                                    if (e.key === 'Escape') setEditingItem(null);
                                                }}
                                            />
                                        ) : (
                                            <span style={{ fontWeight: 500 }}>{item}</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                        {editingItem === item ? (
                                            <button
                                                onClick={() => handleSaveEdit(item)}
                                                style={{ color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 600 }}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleStartEdit(item)}
                                                    style={{ color: 'var(--color-primary)', opacity: 0.6 }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => activeTab === 'categories' ? deleteCategory(item) : deleteUnit(item)}
                                                    style={{ color: 'var(--color-error)', opacity: 0.6 }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-border)', textAlign: 'right' }}>
                    <button className="btn btn-outline" onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
};

export default ManageMetadataModal;
