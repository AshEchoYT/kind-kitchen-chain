-- Create enum types for food types and statuses
CREATE TYPE food_type AS ENUM ('veg', 'non_veg', 'snacks', 'beverages', 'dairy', 'bakery');
CREATE TYPE report_status AS ENUM ('new', 'assigned', 'picked', 'delivered', 'cancelled');
CREATE TYPE user_role AS ENUM ('hotel', 'agent', 'admin');

-- Create profiles table with roles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email text NOT NULL,
  name text NOT NULL,
  phone text,
  role user_role NOT NULL DEFAULT 'hotel',
  avatar_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create hotels table
CREATE TABLE public.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name text NOT NULL,
  contact text NOT NULL,
  street text NOT NULL,
  city text NOT NULL,
  landmark text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  image_url text,
  rating decimal(3,2) DEFAULT 4.0,
  total_food_saved integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create delivery agents table
CREATE TABLE public.delivery_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name text NOT NULL,
  date_of_birth date,
  contact text NOT NULL,
  unique_id text UNIQUE NOT NULL,
  area text NOT NULL,
  zone text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  is_active boolean DEFAULT true,
  total_deliveries integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 5.0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create beggars table
CREATE TABLE public.beggars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  street text NOT NULL,
  city text NOT NULL,
  landmark text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  preferred_food_time time,
  contact text,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create food reports table
CREATE TABLE public.food_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  food_type food_type NOT NULL,
  food_name text NOT NULL,
  description text,
  quantity integer NOT NULL CHECK (quantity > 0),
  pickup_time timestamp with time zone NOT NULL,
  expiry_time timestamp with time zone,
  status report_status DEFAULT 'new',
  assigned_agent_id uuid REFERENCES public.delivery_agents(id),
  image_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create collection records table
CREATE TABLE public.collection_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_report_id uuid REFERENCES public.food_reports(id) ON DELETE CASCADE NOT NULL,
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  assigned_agent_id uuid REFERENCES public.delivery_agents(id) ON DELETE SET NULL,
  pickup_timestamp timestamp with time zone,
  status report_status DEFAULT 'assigned',
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create distribution records table
CREATE TABLE public.distribution_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.delivery_agents(id) ON DELETE CASCADE NOT NULL,
  beggar_id uuid REFERENCES public.beggars(id) ON DELETE CASCADE NOT NULL,
  food_report_id uuid REFERENCES public.food_reports(id) ON DELETE CASCADE NOT NULL,
  distribution_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  quantity_distributed integer NOT NULL CHECK (quantity_distributed > 0),
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beggars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_records ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert their profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for hotels
CREATE POLICY "Hotels can view their own data" ON public.hotels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Agents and admins can view all hotels" ON public.hotels
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('agent', 'admin'));

CREATE POLICY "Hotels can update their own data" ON public.hotels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Hotels can insert their own data" ON public.hotels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for delivery agents
CREATE POLICY "Agents can view their own data" ON public.delivery_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all agents" ON public.delivery_agents
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Agents can update their own data" ON public.delivery_agents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Agents can insert their own data" ON public.delivery_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for beggars (admin only)
CREATE POLICY "Admins can manage beggars" ON public.beggars
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Agents can view beggars" ON public.beggars
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('agent', 'admin'));

-- RLS Policies for food reports
CREATE POLICY "Hotels can manage their own reports" ON public.food_reports
  FOR ALL USING (
    hotel_id IN (SELECT id FROM public.hotels WHERE user_id = auth.uid())
  );

CREATE POLICY "Agents and admins can view all reports" ON public.food_reports
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('agent', 'admin'));

CREATE POLICY "Agents can update assigned reports" ON public.food_reports
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) = 'agent' AND 
    assigned_agent_id IN (SELECT id FROM public.delivery_agents WHERE user_id = auth.uid())
  );

-- RLS Policies for collection records
CREATE POLICY "Agents can view their collection records" ON public.collection_records
  FOR SELECT USING (
    assigned_agent_id IN (SELECT id FROM public.delivery_agents WHERE user_id = auth.uid()) OR
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Hotels can view their collection records" ON public.collection_records
  FOR SELECT USING (
    hotel_id IN (SELECT id FROM public.hotels WHERE user_id = auth.uid())
  );

CREATE POLICY "Agents can insert collection records" ON public.collection_records
  FOR INSERT WITH CHECK (
    assigned_agent_id IN (SELECT id FROM public.delivery_agents WHERE user_id = auth.uid())
  );

-- RLS Policies for distribution records
CREATE POLICY "Agents can manage their distributions" ON public.distribution_records
  FOR ALL USING (
    agent_id IN (SELECT id FROM public.delivery_agents WHERE user_id = auth.uid()) OR
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_agents_updated_at BEFORE UPDATE ON public.delivery_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beggars_updated_at BEFORE UPDATE ON public.beggars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_reports_updated_at BEFORE UPDATE ON public.food_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collection_records_updated_at BEFORE UPDATE ON public.collection_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'hotel')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.food_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.distribution_records;