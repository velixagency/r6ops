require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') }); // Explicitly specify path to .env.local

const { createClient } = require('@supabase/supabase-js');

// Debug: Log environment variables to confirm they are loaded
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY);

// Check if variables are undefined
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Environment variables not loaded. Check .env.local file path and contents.');
}

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateUserMetadata() {
  try {
    // Step 1: Find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw new Error(`Error listing users: ${listError.message}`);

    const user = users.users.find(u => u.email === 'info@velixagency.com');
    if (!user) throw new Error('User not found');

    console.log('Found user:', user.email, 'ID:', user.id);

    // Step 2: Update the user's metadata
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: 'admin' },
    });

    if (error) throw new Error(`Error updating metadata: ${error.message}`);

    console.log('User metadata updated successfully:', data.user.user_metadata);
  } catch (err) {
    console.error(err.message);
  }
}

updateUserMetadata();