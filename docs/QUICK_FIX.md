# Quick Fix for Upload Error

If you're seeing "Failed to upload image" error, run this SQL in your Supabase SQL Editor:

```sql
-- Step 1: Check your current role
SELECT u.email, p.role
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
ORDER BY u.created_at DESC;

-- Step 2: Promote your user to admin (replace with your email)
INSERT INTO profiles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'jmorgan@4wardmotion.co'  -- REPLACE WITH YOUR EMAIL
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = now();

-- Step 3: Verify it worked
SELECT u.email, p.role
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
WHERE u.email = 'jmorgan@4wardmotion.co';  -- REPLACE WITH YOUR EMAIL
```

After running these queries:
1. **Log out** of the application
2. **Log back in**
3. Try uploading an image again

The logout/login step is critical - your session needs to refresh to pick up the new admin role.
