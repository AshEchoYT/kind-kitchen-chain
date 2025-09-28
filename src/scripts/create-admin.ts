import { createClient } from '@supabase/supabase-js'

// This script creates the admin user for EllarukumFood
// Run this once to set up the admin account

const supabaseUrl = 'your-supabase-url'
const supabaseServiceKey = 'your-service-role-key' // Service role key (not anon key!)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // Create admin user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@ellarukumfood.org',
      password: 'EllarukumFood@2024!',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: 'EllarukumFood Administrator'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return
    }

    console.log('Auth user created:', authData.user.id)

    // Create profile entry
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        name: 'EllarukumFood Administrator',
        email: 'admin@ellarukumfood.org',
        phone: '+91 9876543210',
        role: 'admin'
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('Email: admin@ellarukumfood.org')
    console.log('Password: EllarukumFood@2024!')
    console.log('Role: admin')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Uncomment to run
// createAdminUser()

export { createAdminUser }