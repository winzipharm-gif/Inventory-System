import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Plus, Trash2, Phone, Mail, User } from 'lucide-react';

const Suppliers = () => {
    const { suppliers, addSupplier, deleteSupplier } = useInventory();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', contact: '', email: '', phone: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        addSupplier(formData);
        setFormData({ name: '', contact: '', email: '', phone: '' });
        setIsAdding(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Suppliers</h2>
                    <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Manage pharmaceutical suppliers and contact representatives.</p>
                </div>
                <button className="btn btn-primary" style={{ minHeight: '40px' }} onClick={() => setIsAdding(!isAdding)}>
                    <Plus size={18} /> {isAdding ? 'Cancel' : 'Add Supplier'}
                </button>
            </div>

            {isAdding && (
                <div className="card" style={{ animation: 'slideDown 0.2s ease-out' }}>
                    <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700, fontSize: 'var(--font-size-base)' }}>New Supplier Details</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 'var(--space-4)' }}>
                            <div>
                                <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Company Name</label>
                                <input required className="input-field" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. HealthCorp Ltd" />
                            </div>
                            <div>
                                <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Contact Person</label>
                                <input required className="input-field" name="contact" value={formData.contact} onChange={handleChange} placeholder="e.g. Dr. John Mensah" />
                            </div>
                            <div>
                                <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address</label>
                                <input required type="email" className="input-field" name="email" value={formData.email} onChange={handleChange} placeholder="contact@supplier.com" />
                            </div>
                            <div>
                                <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number</label>
                                <input required className="input-field" name="phone" value={formData.phone} onChange={handleChange} placeholder="+233 24 123 4567" />
                            </div>
                        </div>
                        <div style={{ marginTop: 'var(--space-5)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsAdding(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Save Supplier</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-4)' }}>
                {suppliers.map(supplier => (
                    <div key={supplier.id} className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <button
                            onClick={() => { if (window.confirm('Are you sure you want to delete this supplier?')) deleteSupplier(supplier.id); }}
                            className="btn-icon"
                            style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--color-error)' }}
                            aria-label={`Delete supplier ${supplier.name}`}
                        >
                            <Trash2 size={16} />
                        </button>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', paddingRight: '2rem' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem',
                                    flexShrink: 0
                                }}>
                                    {supplier.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <h3 style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{supplier.name}</h3>
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>ID: #{supplier.id}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                                    <User size={16} className="text-muted" style={{ flexShrink: 0 }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{supplier.contact}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                                    <Mail size={16} className="text-muted" style={{ flexShrink: 0 }} />
                                    <a href={`mailto:${supplier.email}`} style={{ color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{supplier.email}</a>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                                    <Phone size={16} className="text-muted" style={{ flexShrink: 0 }} />
                                    <a href={`tel:${supplier.phone}`} style={{ color: 'inherit' }}>{supplier.phone}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {suppliers.length === 0 && !isAdding && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    No suppliers registered yet. Click "Add Supplier" to register one.
                </div>
            )}
        </div>
    );
};

export default Suppliers;
