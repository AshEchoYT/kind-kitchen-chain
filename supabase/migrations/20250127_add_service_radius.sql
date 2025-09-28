-- Add service_radius column to delivery_agents table
ALTER TABLE public.delivery_agents ADD COLUMN service_radius integer DEFAULT 10;

-- Add latitude and longitude columns to delivery_agents if they don't exist
ALTER TABLE public.delivery_agents 
ADD COLUMN IF NOT EXISTS latitude decimal(10, 8),
ADD COLUMN IF NOT EXISTS longitude decimal(11, 8);