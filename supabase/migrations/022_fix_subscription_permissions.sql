-- Fix permissions for subscriptions table
-- Grant full access to service_role (for webhook updates)
GRANT ALL ON m2m.subscriptions TO service_role;

-- Grant read access to authenticated users (for frontend fetching)
GRANT SELECT ON m2m.subscriptions TO authenticated;
