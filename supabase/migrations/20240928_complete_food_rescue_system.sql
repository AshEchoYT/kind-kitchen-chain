-- Add missing columns to existing tables for better location data
ALTER TABLE food_reports ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE food_reports ADD COLUMN IF NOT EXISTS area VARCHAR(100);
ALTER TABLE food_reports ADD COLUMN IF NOT EXISTS landmark VARCHAR(100);
ALTER TABLE food_reports ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE food_reports ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create needy_people table
CREATE TABLE IF NOT EXISTS needy_people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  street_address TEXT NOT NULL,
  area VARCHAR(100) NOT NULL,
  landmark VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create food_requirements table
CREATE TABLE IF NOT EXISTS food_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  needy_person_id UUID REFERENCES needy_people(id) ON DELETE CASCADE,
  food_type VARCHAR(20) DEFAULT 'any', -- 'veg', 'non-veg', 'any'
  quantity_needed INTEGER DEFAULT 1, -- number of people to feed
  preferred_time VARCHAR(20) DEFAULT 'anytime', -- 'morning', 'afternoon', 'evening', 'anytime'
  special_notes TEXT,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'fulfilled', 'cancelled'
  urgency_level VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create delivery_tasks table (the core of the matching system)
CREATE TABLE IF NOT EXISTS delivery_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  food_report_id UUID REFERENCES food_reports(id) ON DELETE CASCADE,
  food_requirement_id UUID REFERENCES food_requirements(id) ON DELETE CASCADE,
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  needy_person_id UUID REFERENCES needy_people(id) ON DELETE CASCADE,
  assigned_agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'assigned', 'picked_up', 'in_transit', 'delivered', 'completed'
  pickup_time TIMESTAMP WITH TIME ZONE,
  delivery_time TIMESTAMP WITH TIME ZONE,
  completion_time TIMESTAMP WITH TIME ZONE,
  agent_notes TEXT,
  hotel_notes TEXT,
  needy_person_feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  distance_km DECIMAL(6, 2),
  estimated_delivery_time INTEGER, -- minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create task_tracking table for real-time updates
CREATE TABLE IF NOT EXISTS task_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES delivery_tasks(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on new tables
ALTER TABLE needy_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for needy_people
CREATE POLICY "needy_people_select" ON needy_people FOR SELECT USING (true);
CREATE POLICY "needy_people_insert" ON needy_people FOR INSERT WITH CHECK (true);
CREATE POLICY "needy_people_update" ON needy_people FOR UPDATE USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for food_requirements
CREATE POLICY "food_requirements_select" ON food_requirements FOR SELECT USING (true);
CREATE POLICY "food_requirements_insert" ON food_requirements FOR INSERT WITH CHECK (true);
CREATE POLICY "food_requirements_update" ON food_requirements FOR UPDATE USING (true);

-- RLS Policies for delivery_tasks
CREATE POLICY "delivery_tasks_select" ON delivery_tasks FOR SELECT USING (true);
CREATE POLICY "delivery_tasks_insert" ON delivery_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "delivery_tasks_update" ON delivery_tasks FOR UPDATE USING (true);

-- RLS Policies for task_tracking
CREATE POLICY "task_tracking_select" ON task_tracking FOR SELECT USING (true);
CREATE POLICY "task_tracking_insert" ON task_tracking FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_requirements_status ON food_requirements(status);
CREATE INDEX IF NOT EXISTS idx_food_requirements_city ON food_requirements((SELECT city FROM needy_people WHERE needy_people.id = food_requirements.needy_person_id));
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_status ON delivery_tasks(status);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_agent ON delivery_tasks(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_created ON delivery_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_needy_people_city ON needy_people(city);

-- Create function to automatically create delivery tasks when there's a match
CREATE OR REPLACE FUNCTION create_delivery_task_on_match()
RETURNS TRIGGER AS $$
DECLARE
  matching_requirement RECORD;
BEGIN
  -- Find matching food requirements for new food reports
  IF TG_TABLE_NAME = 'food_reports' THEN
    FOR matching_requirement IN 
      SELECT fr.*, np.city
      FROM food_requirements fr
      JOIN needy_people np ON fr.needy_person_id = np.id
      WHERE fr.status = 'active'
      AND np.city = (SELECT city FROM hotels WHERE id = NEW.hotel_id)
      AND (fr.food_type = 'any' OR fr.food_type = NEW.food_type OR NEW.food_type = 'any')
    LOOP
      INSERT INTO delivery_tasks (
        food_report_id,
        food_requirement_id,
        hotel_id,
        needy_person_id,
        status
      ) VALUES (
        NEW.id,
        matching_requirement.id,
        NEW.hotel_id,
        matching_requirement.needy_person_id,
        'available'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic task creation
DROP TRIGGER IF EXISTS trigger_create_delivery_task ON food_reports;
CREATE TRIGGER trigger_create_delivery_task
  AFTER INSERT ON food_reports
  FOR EACH ROW
  EXECUTE FUNCTION create_delivery_task_on_match();