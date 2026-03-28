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
        <div>
            <div className="flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600 }}>Suppliers</h2>
                    <p className="text-muted">Manage your drug suppliers and contacts.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
                    <Plus size={20} /> {isAdding ? 'Cancel' : 'Add Supplier'}
                </button>
            </div>

            {isAdding && (
                <div className="card" style={{ marginBottom: 'var(--space-6)', animation: 'slideDown 0.3s ease' }}>
                    <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 600 }}>New Supplier Details</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                            <div>
                                <label className="text-muted" style={{ fontSize: '0.875rem' }}>Company Name</label>
                                <input required className="input-field" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. HealthCorp" />
                            </div>
                            <div>
                                <label className="text-muted" style={{ fontSize: '0.875rem' }}>Contact Person</label>
                                <input required className="input-field" name="contact" value={formData.contact} onChange={handleChange} placeholder="e.g. John Doe" />
                            </div>
                            <div>
                                <label className="text-muted" style={{ fontSize: '0.875rem' }}>Email</label>
                                <input required type="email" className="input-field" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="text-muted" style={{ fontSize: '0.875rem' }}>Phone</label>
                                <input required className="input-field" name="phone" value={formData.phone} onChange={handleChange} placeholder="555-0123" />
                            </div>
                        </div>
                        <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary">Save Supplier</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
                {suppliers.map(supplier => (
                    <div key={supplier.id} className="card" style={{ position: 'relative' }}>
                        <button
                            onClick={() => { if (window.confirm('Delete supplier?')) deleteSupplier(supplier.id) }}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                        >
                            <Trash2 size={16} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem'
                            }}>
                                {supplier.name.charAt(0)}
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600 }}>{supplier.name}</h3>
                                <span className="text-muted" style={{ fontSize: '0.875rem' }}>ID: #{supplier.id}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.875rem' }}>
                                <User size={16} className="text-muted" />
                                <span>{supplier.contact}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.875rem' }}>
                                <Mail size={16} className="text-muted" />
                                <a href={`mailto:${supplier.email}`} style={{ color: 'var(--color-primary)' }}>{supplier.email}</a>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.875rem' }}>
                                <Phone size={16} className="text-muted" />
                                <span>{supplier.phone}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Suppliers;
