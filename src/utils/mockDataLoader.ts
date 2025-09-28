import { supabase } from '@/integrations/supabase/client';

export const loadMockData = async () => {
  try {
    console.log('🔄 Loading mock data...');
    
    // Clear existing data first (optional)
    console.log('Clearing existing food reports...');
    await supabase.from('food_reports').delete().neq('id', '');
    
    // Create mock hotels if they don't exist
    const mockHotels = [
      {
        name: "Grand Palace Hotel",
        street: "123 Main Street",
        city: "New Delhi",
        landmark: "Near Metro Station",
        contact: "+91 9876543210",
        latitude: 28.6139,
        longitude: 77.2090,
        user_id: "mock-hotel-1"
      },
      {
        name: "Royal Garden Restaurant",
        street: "456 Park Avenue", 
        city: "Mumbai",
        landmark: "Opposite Central Mall",
        contact: "+91 9876543211",
        latitude: 19.0760,
        longitude: 72.8777,
        user_id: "mock-hotel-2"
      },
      {
        name: "Spice Route Kitchen",
        street: "789 Food Street",
        city: "Bangalore",
        landmark: "Near Tech Park",
        contact: "+91 9876543212",
        latitude: 12.9716,
        longitude: 77.5946,
        user_id: "mock-hotel-3"
      },
      {
        name: "Taj Fusion Dining",
        street: "321 Heritage Road",
        city: "Chennai",
        landmark: "Near Beach",
        contact: "+91 9876543213",
        latitude: 13.0827,
        longitude: 80.2707,
        user_id: "mock-hotel-4"
      },
      {
        name: "Metro Bites Café",
        street: "654 Business District",
        city: "Hyderabad",
        landmark: "IT Hub Area",
        contact: "+91 9876543214",
        latitude: 17.3850,
        longitude: 78.4867,
        user_id: "mock-hotel-5"
      }
    ];

    console.log('Inserting mock hotels...');
    const { data: hotelData, error: hotelError } = await supabase
      .from('hotels')
      .upsert(mockHotels, { onConflict: 'user_id' })
      .select();

    if (hotelError) {
      console.error('Error inserting hotels:', hotelError);
    } else {
      console.log('✅ Hotels inserted successfully');
    }

    // Create mock delivery agents
    const mockAgents = [
      {
        name: "Vikram Delivery",
        contact: "+91 9988776655",
        area: "Central Delhi",
        zone: "North",
        unique_id: "DEL001",
        user_id: "mock-agent-1"
      },
      {
        name: "Anita Fast Delivery",
        contact: "+91 9988776656", 
        area: "Mumbai Central",
        zone: "West",
        unique_id: "MUM001",
        user_id: "mock-agent-2"
      },
      {
        name: "Suresh Express",
        contact: "+91 9988776657",
        area: "Bangalore Tech Park", 
        zone: "South",
        unique_id: "BLR001",
        user_id: "mock-agent-3"
      }
    ];

    console.log('Inserting mock agents...');
    const { data: agentData, error: agentError } = await supabase
      .from('delivery_agents')
      .upsert(mockAgents, { onConflict: 'user_id' })
      .select();

    if (agentError) {
      console.error('Error inserting agents:', agentError);
    } else {
      console.log('✅ Agents inserted successfully');
    }

    // Create mock food reports with realistic data
    const mockFoodReports = [
      {
        food_name: "Paneer Butter Masala",
        food_type: "veg" as const,
        quantity: 15,
        description: "Fresh paneer curry with naan bread. Perfect for 15 people. Made 2 hours ago.",
        pickup_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
        expiry_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        status: "new" as const,
        hotel_id: hotelData?.[0]?.id || null
      },
      {
        food_name: "Chicken Biryani",
        food_type: "non_veg" as const, 
        quantity: 25,
        description: "Fragrant basmati rice with tender chicken pieces. Enough for 25 people.",
        pickup_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 mins from now
        expiry_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
        status: "new" as const,
        hotel_id: hotelData?.[1]?.id || null
      },
      {
        food_name: "Mixed Vegetable Curry",
        food_type: "veg" as const,
        quantity: 20,
        description: "Traditional South Indian mixed vegetable curry with rice. Healthy and nutritious.",
        pickup_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins from now
        expiry_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
        status: "assigned" as const,
        hotel_id: hotelData?.[2]?.id || null,
        assigned_agent_id: agentData?.[0]?.id || null
      },
      {
        food_name: "Assorted Sandwiches & Wraps",
        food_type: "snacks" as const,
        quantity: 30,
        description: "Variety of sandwiches and wraps including veg and non-veg options.",
        pickup_time: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 mins from now
        expiry_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
        status: "new" as const,
        hotel_id: hotelData?.[3]?.id || null
      },
      {
        food_name: "Dal Tadka with Rice",
        food_type: "veg" as const,
        quantity: 40,
        description: "Traditional yellow dal with basmati rice. Comfort food for 40 people.",
        pickup_time: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 mins from now
        expiry_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
        status: "new" as const,
        hotel_id: hotelData?.[4]?.id || null
      },
      {
        food_name: "Pizza Slices (Mixed)",
        food_type: "non_veg" as const,
        quantity: 12,
        description: "Assorted pizza slices - Margherita, Pepperoni, and Vegetarian Supreme.",
        pickup_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        expiry_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        status: "picked" as const,
        hotel_id: hotelData?.[0]?.id || null,
        assigned_agent_id: agentData?.[1]?.id || null
      },
      {
        food_name: "Fruit Salad & Desserts",
        food_type: "veg" as const,
        quantity: 18,
        description: "Fresh fruit salad with assorted Indian sweets and desserts.",
        pickup_time: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 mins from now
        expiry_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        status: "new" as const,
        hotel_id: hotelData?.[1]?.id || null
      },
      {
        food_name: "Rajma Rice Bowl",
        food_type: "veg" as const,
        quantity: 22,
        description: "Kidney beans curry with jeera rice. Popular North Indian comfort food.",
        pickup_time: new Date(Date.now() + 40 * 60 * 1000).toISOString(), // 40 mins from now
        expiry_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
        status: "delivered" as const,
        hotel_id: hotelData?.[2]?.id || null,
        assigned_agent_id: agentData?.[2]?.id || null
      }
    ];

    console.log('Inserting mock food reports...');
    const { data: reportData, error: reportError } = await supabase
      .from('food_reports')
      .insert(mockFoodReports)
      .select();

    if (reportError) {
      console.error('Error inserting food reports:', reportError);
    } else {
      console.log('✅ Food reports inserted successfully');
      console.log(`📊 Added ${reportData?.length} food reports`);
    }

    // Create mock needy people (beggars table)
    const mockNeedyPeople = [
      {
        name: "Ravi Kumar",
        contact: "+91 9876501234",
        street: "Near Railway Station",
        city: "New Delhi",
        landmark: "Platform 1 Exit",
        latitude: 28.6129,
        longitude: 77.2295,
        notes: "Family of 8, diabetic-friendly food preferred"
      },
      {
        name: "Sunita Devi",
        contact: "+91 9876501235", 
        street: "Dharavi Slum Area",
        city: "Mumbai",
        landmark: "Main Road Junction",
        latitude: 19.0428,
        longitude: 72.8570,
        notes: "12 people including children and elderly"
      },
      {
        name: "Mohammad Ali",
        contact: "+91 9876501236",
        street: "Old City Area",
        city: "Bangalore",
        landmark: "Bus Stand",
        latitude: 12.9716,
        longitude: 77.5946,
        notes: "6 people, halal food required"
      },
      {
        name: "Lakshmi Amma",
        contact: "+91 9876501237",
        street: "Fisherman Colony",
        city: "Chennai",
        landmark: "Beach Side",
        latitude: 13.0827,
        longitude: 80.2707,
        notes: "15 people, rice-based meals preferred"
      },
      {
        name: "Babu Rao",
        contact: "+91 9876501238",
        street: "Construction Site",
        city: "Hyderabad",
        landmark: "Building Site Gate",
        latitude: 17.3850,
        longitude: 78.4867,
        notes: "20 daily wage workers"
      },
      {
        name: "Mary Thomas",
        contact: "+91 9876501239",
        street: "Orphanage Road",
        city: "Kochi",
        landmark: "St. Mary's Church",
        latitude: 9.9312,
        longitude: 76.2673,
        notes: "25 children aged 5-15"
      }
    ];

    console.log('Inserting mock needy people...');
    const { data: needyData, error: needyError } = await supabase
      .from('beggars')
      .insert(mockNeedyPeople)
      .select();

    if (needyError) {
      console.error('Error inserting needy people:', needyError);
    } else {
      console.log('✅ Needy people inserted successfully');
      console.log(`📊 Added ${needyData?.length} needy people`);
    }

    console.log('🎉 Mock data loading completed!');
    console.log('📈 Data Summary:');
    console.log(`- Hotels: ${mockHotels.length}`);
    console.log(`- Agents: ${mockAgents.length}`);
    console.log(`- Food Reports: ${mockFoodReports.length}`);
    console.log(`- Needy People: ${mockNeedyPeople.length}`);
    
    return {
      hotels: hotelData?.length || 0,
      agents: agentData?.length || 0,
      reports: reportData?.length || 0,
      needy: needyData?.length || 0,
      success: true
    };

  } catch (error) {
    console.error('❌ Error loading mock data:', error);
    return {
      hotels: 0,
      agents: 0,
      reports: 0,
      success: false,
      error
    };
  }
};

export const clearAllData = async () => {
  try {
    console.log('🗑️ Clearing all data...');
    
    // Clear in reverse order of dependencies
    await supabase.from('food_reports').delete().neq('id', '');
    await supabase.from('beggars').delete().neq('id', '');
    await supabase.from('delivery_agents').delete().neq('id', '');
    await supabase.from('hotels').delete().neq('id', '');
    
    console.log('✅ All data cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    return false;
  }
};