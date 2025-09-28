-- Create agent_locations table for real-time location tracking
CREATE TABLE IF NOT EXISTS agent_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES food_reports(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2) DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, task_id)
);

-- Create indexes for performance
CREATE INDEX idx_agent_locations_agent_id ON agent_locations(agent_id);
CREATE INDEX idx_agent_locations_task_id ON agent_locations(task_id);
CREATE INDEX idx_agent_locations_timestamp ON agent_locations(timestamp);

-- Enable RLS
ALTER TABLE agent_locations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Agents can insert their own locations" ON agent_locations
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own locations" ON agent_locations
  FOR UPDATE USING (auth.uid() = agent_id);

CREATE POLICY "Users can view locations for their tasks" ON agent_locations
  FOR SELECT USING (
    auth.uid() = agent_id OR 
    EXISTS (
      SELECT 1 FROM food_reports fr 
      JOIN hotels h ON fr.hotel_id = h.id 
      WHERE fr.id = agent_locations.task_id 
      AND h.user_id = auth.uid()
    )
  );