// Demo data seeder for FoodShare application
import { supabase } from './src/integrations/supabase/client.js';

const seedData = async () => {
  console.log('Starting database seeding...');

  // Demo users (these would be created via auth normally)
  const demoHotels = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Paradise Restaurant',
      contact: '+91 9876543210',
      street: 'Connaught Place',
      city: 'Delhi',
      landmark: 'Near CP Metro Station',
      rating: 4.5,
      total_food_saved: 150
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Spice Garden',
      contact: '+91 9876543211',
      street: 'Khan Market',
      city: 'Delhi',
      landmark: 'Opposite PVR',
      rating: 4.3,
      total_food_saved: 200
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Delhi Darbar',
      contact: '+91 9876543212',
      street: 'Karol Bagh',
      city: 'Delhi',
      landmark: 'Main Market',
      rating: 4.7,
      total_food_saved: 300
    }
  ];

  const demoAgents = [
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      user_id: '550e8400-e29b-41d4-a716-446655440011',
      name: 'Rajesh Kumar',
      contact: '+91 9876543220',
      unique_id: 'AGT001',
      area: 'Central Delhi',
      zone: 'Zone A',
      is_active: true,
      total_deliveries: 45,
      rating: 4.8
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440012',
      user_id: '550e8400-e29b-41d4-a716-446655440012',
      name: 'Amit Singh',
      contact: '+91 9876543221',
      unique_id: 'AGT002',
      area: 'South Delhi',
      zone: 'Zone B',
      is_active: true,
      total_deliveries: 38,
      rating: 4.6
    }
  ];

  const demoBeggars = [
    {
      name: 'Ram Lal',
      street: 'Red Fort',
      city: 'Delhi',
      landmark: 'Near Main Gate',
      preferred_food_time: '19:00:00',
      notes: 'Elderly person, prefers vegetarian food'
    },
    {
      name: 'Sita Devi',
      street: 'India Gate',
      city: 'Delhi',
      landmark: 'Parking Area',
      preferred_food_time: '20:00:00',
      notes: 'Mother with two children'
    },
    {
      name: 'Mohan',
      street: 'Janpath',
      city: 'Delhi',
      landmark: 'Near Shopping Complex',
      preferred_food_time: '18:30:00',
      notes: 'Young person, any food type'
    }
  ];

  const demoFoodReports = [
    {
      hotel_id: '550e8400-e29b-41d4-a716-446655440001',
      food_type: 'veg',
      food_name: 'Mixed Vegetable Curry',
      description: 'Fresh mixed vegetables in spicy curry',
      quantity: 25,
      pickup_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      status: 'new',
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
    },
    {
      hotel_id: '550e8400-e29b-41d4-a716-446655440001',
      food_type: 'non_veg',
      food_name: 'Chicken Biryani',
      description: 'Aromatic basmati rice with tender chicken pieces',
      quantity: 15,
      pickup_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
      status: 'assigned',
      assigned_agent_id: '550e8400-e29b-41d4-a716-446655440011',
      image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400'
    },
    {
      hotel_id: '550e8400-e29b-41d4-a716-446655440002',
      food_type: 'veg',
      food_name: 'Dal Tadka with Rice',
      description: 'Yellow lentils with aromatic tempering served with steamed rice',
      quantity: 30,
      pickup_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
      status: 'new',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400'
    },
    {
      hotel_id: '550e8400-e29b-41d4-a716-446655440002',
      food_type: 'snacks',
      food_name: 'Samosas and Chutney',
      description: 'Crispy potato-filled samosas with mint chutney',
      quantity: 40,
      pickup_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      status: 'picked',
      assigned_agent_id: '550e8400-e29b-41d4-a716-446655440012',
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400'
    },
    {
      hotel_id: '550e8400-e29b-41d4-a716-446655440003',
      food_type: 'veg',
      food_name: 'Paneer Butter Masala',
      description: 'Rich and creamy cottage cheese curry',
      quantity: 20,
      pickup_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (completed)
      status: 'delivered',
      assigned_agent_id: '550e8400-e29b-41d4-a716-446655440011',
      image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400'
    }
  ];

  try {
    // Insert demo data
    console.log('Inserting hotels...');
    const { error: hotelsError } = await supabase.from('hotels').insert(demoHotels);
    if (hotelsError) console.error('Hotels error:', hotelsError.message);

    console.log('Inserting agents...');
    const { error: agentsError } = await supabase.from('delivery_agents').insert(demoAgents);
    if (agentsError) console.error('Agents error:', agentsError.message);

    console.log('Inserting beneficiaries...');
    const { error: beggarsError } = await supabase.from('beggars').insert(demoBeggars);
    if (beggarsError) console.error('Beneficiaries error:', beggarsError.message);

    console.log('Inserting food reports...');
    const { error: reportsError } = await supabase.from('food_reports').insert(demoFoodReports);
    if (reportsError) console.error('Food reports error:', reportsError.message);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run the seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData();
}

export { seedData };