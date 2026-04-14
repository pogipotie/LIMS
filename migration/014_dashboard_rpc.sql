-- 014_dashboard_rpc.sql
-- Performance Optimization: Calculate dashboard statistics directly on the database server 
-- instead of downloading all rows to the frontend (which kills Free Tier bandwidth).

CREATE OR REPLACE FUNCTION public.get_dashboard_stats(role text, requesting_user_id uuid)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    IF role = 'admin' OR role = 'staff' THEN
        SELECT json_build_object(
            'totalActiveLivestock', (SELECT count(*) FROM public.livestock WHERE status = 'active'),
            'totalDeceased', (SELECT count(*) FROM public.livestock WHERE status = 'deceased'),
            'totalTransactions', (SELECT count(*) FROM public.transactions),
            'pendingMortalities', (
                SELECT count(*) FROM public.transactions 
                WHERE type = 'death' 
                AND (validation_status = 'pending' OR document_url IS NULL)
                AND transaction_date <= (CURRENT_DATE - INTERVAL '3 days')
            ),
            'monthlyAdditions', (
                SELECT count(*) FROM public.transactions 
                WHERE type IN ('birth', 'purchase', 'transfer_in')
                AND EXTRACT(MONTH FROM transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)
            )
        ) INTO result;
    ELSIF role = 'custodian' THEN
        SELECT json_build_object(
            'totalActiveLivestock', (SELECT count(*) FROM public.livestock WHERE status = 'active' AND custodian_id = requesting_user_id),
            'sickLivestock', (
                -- Count unique animals assigned to this custodian that have a recent sick/injured logbook entry
                SELECT count(DISTINCT l.livestock_id) 
                FROM public.logbooks l
                JOIN public.livestock lv ON l.livestock_id = lv.id
                WHERE lv.custodian_id = requesting_user_id
                AND lv.status = 'active'
                AND l.health_status IN ('sick', 'injured')
                AND l.log_date >= (CURRENT_DATE - INTERVAL '14 days')
            ),
            'weeklyLogs', (
                SELECT count(*) 
                FROM public.logbooks l
                JOIN public.livestock lv ON l.livestock_id = lv.id
                WHERE lv.custodian_id = requesting_user_id
                AND l.log_date >= (CURRENT_DATE - INTERVAL '7 days')
            )
        ) INTO result;
    ELSE
        result := '{}'::json;
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
