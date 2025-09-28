import { supabase } from './integrations/supabase/client';

// Simple admin account creation function
export async function createAdminAccount() {
  try {
    console.log('🔧 Creating admin account...');
    
    // Try to create the admin user
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@ellarukumfood.org',
      password: 'EllarukumFood@2024!',
      options: {
        data: {
          role: 'admin',
          full_name: 'EllarukumFood Administrator'
        }
      }
    });

    if (error) {
      console.error('❌ Error creating admin:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: admin@ellarukumfood.org');
    console.log('🔑 Password: EllarukumFood@2024!');
    
    return { success: true, data };
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

// Test login function
export async function testAdminLogin() {
  try {
    console.log('🔑 Testing admin login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@ellarukumfood.org',
      password: 'EllarukumFood@2024!'
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Admin login successful!');
    console.log('👤 User:', data.user?.email);
    
    return { success: true, data };
  } catch (err) {
    console.error('❌ Login error:', err);
    return { success: false, error: 'Login error occurred' };
  }
}