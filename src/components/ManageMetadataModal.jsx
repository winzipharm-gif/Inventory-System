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
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1100 }}>
            <div className="card" style={{ 
                width: '100%', 
                maxWidth: '480px', 
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
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Manage Labels</h3>
                    <button onClick={onClose} style={{ color: 'var(--color-text-muted)', padding: '4px' }} aria-label="Close modal">
                        <X size={22} />
                    </button>
                </div>

                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                    <button
                        onClick={() => { setActiveTab('categories'); setEditingItem(null); }}
                        style={{
                            flex: 1,
                            padding: '0.85rem',
                            border: 'none',
                            background: 'none',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: activeTab === 'categories' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            borderBottom: activeTab === 'categories' ? '2px solid var(--color-primary)' : '2px solid transparent',
                            cursor: 'pointer',
                            minHeight: '44px'
                        }}
                    >
                        Categories ({categories.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('units'); setEditingItem(null); }}
                        style={{
                            flex: 1,
                            padding: '0.85rem',
                            border: 'none',
                            background: 'none',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: activeTab === 'units' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            borderBottom: activeTab === 'units' ? '2px solid var(--color-primary)' : '2px solid transparent',
                            cursor: 'pointer',
                            minHeight: '44px'
                        }}
                    >
                        Units ({units.length})
                    </button>
                </div>

                <div style={{ padding: 'var(--space-5)', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
                        <input
                            className="input-field"
                            placeholder={activeTab === 'categories' ? "New Category Name..." : "New Unit (e.g. packs)..."}
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            style={{ minHeight: '42px' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem', minHeight: '42px' }} aria-label="Add item">
                            <Plus size={18} />
                        </button>
                    </form>

                    <div>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
                                        padding: '0.65rem 0.85rem',
                                        backgroundColor: 'var(--color-bg-app)',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, minWidth: 0 }}>
                                        {activeTab === 'categories' ? <Tag size={16} className="text-muted" style={{ flexShrink: 0 }} /> : <Ruler size={16} className="text-muted" style={{ flexShrink: 0 }} />}
                                        {editingItem === item ? (
                                            <input
                                                className="input-field"
                                                style={{ padding: '4px 8px', height: 'auto', fontSize: '0.85rem' }}
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit(item);
                                                    if (e.key === 'Escape') setEditingItem(null);
                                                }}
                                            />
                                        ) : (
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item}</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.75rem', flexShrink: 0 }}>
                                        {editingItem === item ? (
                                            <button
                                                onClick={() => handleSaveEdit(item)}
                                                style={{ color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 700, padding: '4px' }}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleStartEdit(item)}
                                                    className="btn-icon"
                                                    style={{ width: '32px', height: '32px', color: 'var(--color-primary)' }}
                                                    aria-label={`Edit ${item}`}
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => activeTab === 'categories' ? deleteCategory(item) : deleteUnit(item)}
                                                    className="btn-icon"
                                                    style={{ width: '32px', height: '32px', color: 'var(--color-error)' }}
                                                    aria-label={`Delete ${item}`}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--color-border)', textAlign: 'right', flexShrink: 0 }}>
                    <button className="btn btn-outline" style={{ minHeight: '40px', minWidth: '100px' }} onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
};

export default ManageMetadataModal;
