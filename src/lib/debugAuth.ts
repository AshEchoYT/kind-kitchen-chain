import { supabase } from '../integrations/supabase/client';

export const debugAdminAccount = async () => {
  try {
    console.log('🔍 Checking admin account...');
    
    // Try to get current session
    const { data: session } = await supabase.auth.getSession();
    console.log('� Current session:', session.session?.user?.email);
    
    // Try to get user info
    const { data: user } = await supabase.auth.getUser();
    console.log('� Current user:', user.user?.email);
    
    return {
      currentUser: session.session?.user,
      userInfo: user.user,
      sessionExists: !!session.session
    };
  } catch (error) {
    console.error('❌ Debug error:', error);
    return { error };
  }
};

export const createAdminAccountDirect = async () => {
  try {
    console.log('👤 Creating admin account directly...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@ellarukumfood.org',
      password: 'EllarukumFood@2024!',
      options: {
        data: {
          role: 'admin',
          name: 'EllarukumFood Admin'
        }
      }
    });
    
    if (error) {
      console.error('❌ Admin creation error:', error);
      return { error };
    }
    
    console.log('✅ Admin account created:', data.user?.email);
    return { data };
  } catch (error) {
    console.error('❌ Direct creation error:', error);
    return { error };
  }
};

export const testAdminLogin = async () => {
  try {
    console.log('🔓 Testing admin login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@ellarukumfood.org',
      password: 'EllarukumFood@2024!'
    });
    
    if (error) {
      console.error('❌ Login error:', error.message);
      return { error };
    }
    
    console.log('✅ Login successful:', data.user?.email);
    return { data };
  } catch (error) {
    console.error('❌ Login test error:', error);
    return { error };
  }
};

export const checkSupabaseConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection error:', error);
      return { error, connected: false };
    }
    
    console.log('✅ Supabase connected, profiles count:', data);
    return { connected: true, data };
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return { error, connected: false };
  }
};