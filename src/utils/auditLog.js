import { supabase } from './supabaseClient';

/**
 * Logs an action to the audit_log table.
 * @param {object} opts
 * @param {string} opts.action - e.g. 'ADD_PRODUCT'
 * @param {string} opts.entity - e.g. 'inventory'
 * @param {string} [opts.entityId] - The ID of the affected record
 * @param {string} opts.description - Human-readable summary
 * @param {object} [opts.details] - Additional data (before/after etc.)
 */
export const logAudit = async ({ action, entity, entityId = null, description, details = null }) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('audit_log').insert([{
            user_id: user.id,
            user_email: user.email,
            action,
            entity,
            entity_id: entityId ? String(entityId) : null,
            description,
            details
        }]);
    } catch (err) {
        // Audit logging should never break the main flow
        console.warn('Audit log failed:', err);
    }
};
