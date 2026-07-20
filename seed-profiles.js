const fs = require('fs');
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local','utf-8').split('\n').forEach(line => {
    const p = line.split('=');
    if (p.length >= 2) process.env[p[0].trim()] = p.slice(1).join('=').trim().replace(/^['"]|['"]$/g,'');
  });
}
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

(async () => {
  // Verify profiles table exists by trying to query it
  const { error: checkErr } = await supabase.from('profiles').select('id').limit(1);
  if (checkErr) {
    console.log('profiles table does not exist yet. Please run SQL in Supabase dashboard:');
    console.log(`
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'customer' NOT NULL CHECK (role IN ('admin','customer')),
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active','disabled')),
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow delete profiles" ON public.profiles FOR DELETE USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'admin@cloudcertitude.com' THEN 'admin' ELSE 'customer' END,
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `);
    process.exit(1);
  }

  // Seed: get all auth users and create profiles for existing users
  const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.error('Error fetching users:', usersErr.message);
    process.exit(1);
  }

  console.log(`Found ${users.length} auth users. Seeding profiles...`);

  for (const u of users) {
    const isAdmin = u.email === 'admin@cloudcertitude.com';
    const { error } = await supabase.from('profiles').upsert({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || (u.email ? u.email.split('@')[0] : 'User'),
      role: isAdmin ? 'admin' : 'customer',
      status: 'active',
      last_sign_in_at: u.last_sign_in_at || null,
      created_at: u.created_at
    });
    if (error) {
      console.error(`  Error for ${u.email}:`, error.message);
    } else {
      console.log(`  Seeded: ${u.email} (${isAdmin ? 'admin' : 'customer'})`);
    }
  }

  console.log('Done!');
})();
