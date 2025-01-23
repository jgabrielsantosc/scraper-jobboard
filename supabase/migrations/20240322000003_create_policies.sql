-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.secrets ENABLE ROW LEVEL SECURITY;

-- Policies for api_keys
CREATE POLICY "Admins can manage API keys"
ON public.api_keys
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.is_admin = true
));

-- Policies for user_profiles
CREATE POLICY "Users can read their own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.is_admin = true
));

CREATE POLICY "Only admins can update profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.is_admin = true
));

-- Policies for vault.secrets
CREATE POLICY "Users can view their own secrets"
    ON vault.secrets
    FOR SELECT
    USING ((metadata->>'user_id')::uuid = auth.uid());

CREATE POLICY "Users can insert their own secrets"
    ON vault.secrets
    FOR INSERT
    WITH CHECK ((metadata->>'user_id')::uuid = auth.uid());

CREATE POLICY "Users can update their own secrets"
    ON vault.secrets
    FOR UPDATE
    USING ((metadata->>'user_id')::uuid = auth.uid())
    WITH CHECK ((metadata->>'user_id')::uuid = auth.uid());

-- Grant permissions
GRANT USAGE ON SCHEMA vault TO authenticated;
GRANT ALL ON vault.secrets TO authenticated;
GRANT EXECUTE ON FUNCTION store_secret TO authenticated;
GRANT EXECUTE ON FUNCTION get_secret TO authenticated; 