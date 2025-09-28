-- Create storage bucket for food images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('food-images', 'food-images', true);

-- Set up policies for food-images bucket
CREATE POLICY "Anyone can view food images" ON storage.objects 
FOR SELECT USING (bucket_id = 'food-images');

CREATE POLICY "Authenticated users can upload food images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own food images" ON storage.objects 
FOR UPDATE USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own food images" ON storage.objects 
FOR DELETE USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);