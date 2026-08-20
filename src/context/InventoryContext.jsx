/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { logAudit } from '../utils/auditLog';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
    const [inventory, setInventory] = useState([]);
    const [sales, setSales] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [businessContact, setBusinessContact] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Inventory
            const { data: invData } = await supabase.from('inventory').select('*').order('name');
            if (invData) setInventory(invData.map(i => ({ ...i, genericName: i.generic_name, expiryDate: i.expiry_date, receivedDate: i.received_date, minStock: i.min_stock })));

            // Fetch Suppliers
            const { data: supData } = await supabase.from('suppliers').select('*').order('name');
            if (supData) setSuppliers(supData);

            // Fetch Sales
            const { data: salesData } = await supabase.from('sales').select('*, sale_items(*)').order('created_at', { ascending: false });
            if (salesData) {
                const mappedSales = salesData.map(s => ({
                    id: s.id,
                    date: s.date,
                    total: Number(s.total),
                    items: s.items_count,
                    details: s.sale_items.map(si => ({
                        productId: si.product_id,
                        name: si.product_name,
                        quantity: si.quantity,
                        price: Number(si.price)
                    })),
                    buyerDetails: s.buyer_details
                }));
                setSales(mappedSales);
                setInvoices(mappedSales);
            }

            // Fetch App Settings
            const { data: settingsData, error: settingsError } = await supabase.from('app_settings').select('*').maybeSingle();
            if (settingsError) {
                console.error('App settings fetch error:', settingsError);
            }
            if (settingsData) {
                setCategories(settingsData.categories || []);
                setUnits(settingsData.units || []);
                setBusinessContact(settingsData.business_contact || {});
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!user || authLoading) {
            if (!authLoading && !user) {
                // Clear state on logout
                setInventory([]);
                setSales([]);
                setInvoices([]);
                setSuppliers([]);
                setCategories([]);
                setUnits([]);
                setBusinessContact({});
                setLoading(false);
            }
            return;
        }
        
        fetchData();
        
        // Listen for realtime changes
        const channel = supabase.channel('schema-db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, fetchData)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData, user, authLoading]);

    const addProduct = async (product) => {
        const { data, error } = await supabase.from('inventory').insert([{
            name: product.name,
            generic_name: product.genericName,
            category: product.category,
            stock: product.stock,
            unit: product.unit || 'pcs',
            price: product.price,
            expiry_date: product.expiryDate,
            received_date: product.receivedDate || new Date().toISOString().split('T')[0],
            min_stock: product.minStock
        }]).select();
        
        if (!error && data) {
            fetchData();
            logAudit({ action: 'ADD_PRODUCT', entity: 'inventory', entityId: data[0]?.id, description: `Added product "${product.name}"`, details: product });
        } else {
            console.error('Error adding product:', error);
        }
    };

    const updateProduct = async (id, updatedProduct) => {
        const payload = {};
        if (updatedProduct.name) payload.name = updatedProduct.name;
        if (updatedProduct.genericName) payload.generic_name = updatedProduct.genericName;
        if (updatedProduct.category) payload.category = updatedProduct.category;
        if (updatedProduct.stock !== undefined) payload.stock = updatedProduct.stock;
        if (updatedProduct.unit) payload.unit = updatedProduct.unit;
        if (updatedProduct.price !== undefined) payload.price = updatedProduct.price;
        if (updatedProduct.expiryDate) payload.expiry_date = updatedProduct.expiryDate;
        if (updatedProduct.minStock !== undefined) payload.min_stock = updatedProduct.minStock;

        const { error } = await supabase.from('inventory').update(payload).eq('id', id);
        if (!error) {
            fetchData();
            logAudit({ action: 'UPDATE_PRODUCT', entity: 'inventory', entityId: id, description: `Updated product (ID: ${id})`, details: payload });
        }
    };

    const deleteProduct = async (id) => {
        const item = inventory.find(i => i.id === id);
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (!error) {
            fetchData();
            logAudit({ action: 'DELETE_PRODUCT', entity: 'inventory', entityId: id, description: `Deleted product "${item?.name || id}"` });
        }
    };

    const addSupplier = async (supplier) => {
        const { data, error } = await supabase.from('suppliers').insert([supplier]).select();
        if (!error) {
            fetchData();
            logAudit({ action: 'ADD_SUPPLIER', entity: 'suppliers', entityId: data?.[0]?.id, description: `Added supplier "${supplier.name}"`, details: supplier });
        }
    };

    const deleteSupplier = async (id) => {
        const sup = suppliers.find(s => s.id === id);
        const { error } = await supabase.from('suppliers').delete().eq('id', id);
        if (!error) {
            fetchData();
            logAudit({ action: 'DELETE_SUPPLIER', entity: 'suppliers', entityId: id, description: `Deleted supplier "${sup?.name || id}"` });
        }
    };

    const updateAppSettings = async (payload) => {
        const { data: currentSettings } = await supabase.from('app_settings').select('id').maybeSingle();
        if (currentSettings) {
            const { error } = await supabase.from('app_settings').update(payload).eq('id', currentSettings.id);
            if (error) console.error('Error updating app settings:', error);
        }
    };

    const addCategory = async (category) => {
        if (!category || categories.includes(category)) return;
        const updated = [...categories, category];
        setCategories(updated); // optimistic update
        await updateAppSettings({ categories: updated });
    };

    const deleteCategory = async (category) => {
        const updated = categories.filter(c => c !== category);
        setCategories(updated); // optimistic update
        await updateAppSettings({ categories: updated });
    };

    const updateCategory = async (oldName, newName) => {
        if (oldName === newName) return;
        const updated = categories.map(c => c === oldName ? newName : c);
        setCategories(updated); // optimistic update
        await updateAppSettings({ categories: updated });
        await supabase.from('inventory').update({ category: newName }).eq('category', oldName);
        fetchData();
    };

    const addUnit = async (unit) => {
        if (!unit || units.includes(unit)) return;
        const updated = [...units, unit];
        setUnits(updated); // optimistic update
        await updateAppSettings({ units: updated });
    };

    const deleteUnit = async (unit) => {
        const updated = units.filter(u => u !== unit);
        setUnits(updated); // optimistic update
        await updateAppSettings({ units: updated });
    };

    const updateUnit = async (oldName, newName) => {
        if (oldName === newName) return;
        const updated = units.map(u => u === oldName ? newName : u);
        setUnits(updated); // optimistic update
        await updateAppSettings({ units: updated });
        await supabase.from('inventory').update({ unit: newName }).eq('unit', oldName);
        fetchData();
    };

    const updateBusinessContact = async (contact) => {
        setBusinessContact(contact); // optimistic update
        await updateAppSettings({ business_contact: contact });
    };

    const recordSale = async (saleItems, buyerDetails) => {
        const total = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // 1. Insert Sales Record
        const { data: saleData, error: saleError } = await supabase.from('sales').insert([{
            total,
            items_count: saleItems.length,
            buyer_details: buyerDetails || { name: 'Cash Customer', address: 'N/A' },
            date: new Date().toISOString()
        }]).select().single();

        if (saleError || !saleData) {
            console.error('Error creating sale:', saleError);
            throw new Error('Could not create sale');
        }

        // 2. Insert Sale Items
        const itemsPayload = saleItems.map(item => ({
            sale_id: saleData.id,
            product_id: item.productId,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemsError } = await supabase.from('sale_items').insert(itemsPayload);
        
        if (itemsError) {
            console.error('Error inserting sale items:', itemsError);
        }

        // 3. Update Inventory Stock
        for (const item of saleItems) {
            // Get current stock safely using RPC or direct update if we know it
            // For simplicity, we fetch then update. 
            const currentItem = inventory.find(i => i.id === item.productId);
            if (currentItem) {
                await supabase.from('inventory')
                    .update({ stock: currentItem.stock - item.quantity })
                    .eq('id', item.productId);
            }
        }

        // 4. Return formatted new sale to the UI immediately
        const newSale = {
            id: saleData.id,
            date: saleData.date,
            items: saleItems.length,
            total,
            details: saleItems,
            buyerDetails: saleData.buyer_details
        };
        
        // Audit log - fire and forget
        logAudit({
            action: 'RECORD_SALE',
            entity: 'sales',
            entityId: saleData.id,
            description: `Recorded sale of ₵${total.toFixed(2)} (${saleItems.length} items) to "${saleData.buyer_details?.name || 'Cash Customer'}"`,
            details: { total, items: saleItems.map(i => ({ name: i.name, qty: i.quantity, price: i.price })) }
        });
        
        // Optimistically update local state before re-fetch occurs
        setSales(prev => [newSale, ...prev]);
        setInvoices(prev => [newSale, ...prev]);
        setInventory(prev => prev.map(invItem => {
            const soldItem = saleItems.find(s => s.productId === invItem.id);
            if (soldItem) return { ...invItem, stock: invItem.stock - soldItem.quantity };
            return invItem;
        }));

        fetchData(); // Sync with remote
        return newSale;
    };

    const value = {
        inventory,
        sales,
        invoices,
        suppliers,
        categories,
        units,
        businessContact,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        recordSale,
        addSupplier,
        deleteSupplier,
        addCategory,
        deleteCategory,
        updateCategory,
        addUnit,
        deleteUnit,
        updateUnit,
        setBusinessContact: updateBusinessContact,
    };

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
};
