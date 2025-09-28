import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Camera, Package, Upload, X, AlertTriangle, Utensils, Timer, MapPin } from 'lucide-react';

interface FoodReportFormProps {
  hotelId: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (reportData: any) => Promise<void>;
}

export const FoodReportForm: React.FC<FoodReportFormProps> = ({ 
  hotelId, 
  open, 
  onClose, 
  onSubmit 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    food_name: '',
    food_type: 'veg',
    cuisine_type: '',
    quantity: '',
    pickup_time: '',
    expiry_time: '',
    description: '',
    image_url: '',
    urgency_level: 'standard',
    pickup_instructions: '',
    allergens: [] as string[],
  });

  const cuisineTypes = [
    'South Indian', 'North Indian', 'Chinese', 'Continental', 'Fast Food', 
    'Bakery Items', 'Beverages', 'Desserts', 'Street Food', 'Other'
  ];

  const allergensList = [
    'Nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Seafood', 'Shellfish', 'Sesame'
  ];

  const urgencyLevels = [
    { value: 'express', label: 'Express (2-3 hours)', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'standard', label: 'Standard (4-6 hours)', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'flexible', label: 'Flexible (6+ hours)', color: 'bg-green-100 text-green-800 border-green-200' }
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `food-${hotelId}-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('food-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      setImagePreview(URL.createObjectURL(file));

      toast({
        title: "Image uploaded",
        description: "Food image uploaded successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image_url: '' });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleAllergen = (allergen: string) => {
    const updatedAllergens = selectedAllergens.includes(allergen)
      ? selectedAllergens.filter(a => a !== allergen)
      : [...selectedAllergens, allergen];
    
    setSelectedAllergens(updatedAllergens);
    setFormData({ ...formData, allergens: updatedAllergens });
  };

  const getTimeUntilExpiry = () => {
    if (!formData.expiry_time) return '';
    const now = new Date();
    const expiry = new Date(formData.expiry_time);
    const diff = expiry.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reportData = {
        hotel_id: hotelId,
        food_name: formData.food_name,
        food_type: formData.food_type as 'veg' | 'non_veg' | 'snacks' | 'beverages' | 'dairy' | 'bakery',
        quantity: parseInt(formData.quantity),
        pickup_time: new Date(formData.pickup_time).toISOString(),
        expiry_time: formData.expiry_time ? new Date(formData.expiry_time).toISOString() : null,
        description: formData.description,
        image_url: formData.image_url || null,
        status: 'new',
      };

      await onSubmit(reportData);

      // Reset form with all new fields
      setFormData({
        food_name: '',
        food_type: 'veg',
        cuisine_type: '',
        quantity: '',
        pickup_time: '',
        expiry_time: '',
        description: '',
        image_url: '',
        urgency_level: 'standard',
        pickup_instructions: '',
        allergens: [],
      });
      setSelectedAllergens([]);
      setImagePreview(null);

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-6 w-6 text-primary" />
            Report Surplus Food
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Food Image Upload Section */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Camera className="h-4 w-4" />
                Food Photo
              </Label>
              
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Food preview" 
                    className="w-full h-48 object-cover rounded-lg border-2 border-dashed border-gray-300"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 text-center">
                    Click to upload food photo<br />
                    <span className="text-xs text-gray-400">Max 5MB • JPG, PNG, GIF</span>
                  </p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {uploadingImage && (
                <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  Uploading image...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Food Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="food_name" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Food Name *
              </Label>
              <Input
                id="food_name"
                value={formData.food_name}
                onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                placeholder="e.g., Chicken Biryani, Vegetable Curry"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="food_type">Food Type *</Label>
              <Select
                value={formData.food_type}
                onValueChange={(value) => setFormData({ ...formData, food_type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select food type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">🥬 Vegetarian</SelectItem>
                  <SelectItem value="non_veg">🍖 Non-Vegetarian</SelectItem>
                  <SelectItem value="snacks">🍿 Snacks</SelectItem>
                  <SelectItem value="beverages">🥤 Beverages</SelectItem>
                  <SelectItem value="dairy">🥛 Dairy Products</SelectItem>
                  <SelectItem value="bakery">🍞 Bakery Items</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cuisine_type">Cuisine Type</Label>
              <Select
                value={formData.cuisine_type}
                onValueChange={(value) => setFormData({ ...formData, cuisine_type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineTypes.map(cuisine => (
                    <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Quantity (servings) *
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Number of servings"
                min="1"
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4" />
              Urgency Level *
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {urgencyLevels.map(level => (
                <Card 
                  key={level.value}
                  className={`cursor-pointer transition-all ${
                    formData.urgency_level === level.value 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => setFormData({ ...formData, urgency_level: level.value })}
                >
                  <CardContent className="p-3 text-center">
                    <Badge className={level.color}>
                      {level.label}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Timing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickup_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available from *
              </Label>
              <Input
                id="pickup_time"
                type="datetime-local"
                value={formData.pickup_time}
                onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="expiry_time" className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Best before
              </Label>
              <Input
                id="expiry_time"
                type="datetime-local"
                value={formData.expiry_time}
                onChange={(e) => setFormData({ ...formData, expiry_time: e.target.value })}
                className="mt-1"
              />
              {formData.expiry_time && (
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {getTimeUntilExpiry()}
                </p>
              )}
            </div>
          </div>

          {/* Allergens */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4" />
              Allergen Information
            </Label>
            <div className="flex flex-wrap gap-2">
              {allergensList.map(allergen => (
                <Badge
                  key={allergen}
                  variant={selectedAllergens.includes(allergen) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedAllergens.includes(allergen) 
                      ? 'bg-red-100 text-red-800 border-red-300' 
                      : 'hover:border-red-300'
                  }`}
                  onClick={() => toggleAllergen(allergen)}
                >
                  {allergen}
                </Badge>
              ))}
            </div>
          </div>

          {/* Pickup Instructions */}
          <div>
            <Label htmlFor="pickup_instructions" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Pickup Instructions
            </Label>
            <Textarea
              id="pickup_instructions"
              value={formData.pickup_instructions}
              onChange={(e) => setFormData({ ...formData, pickup_instructions: e.target.value })}
              placeholder="e.g., Ask for reception, Use rear entrance, Call before arriving..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Special notes about the food, preparation method, temperature requirements..."
              rows={3}
              className="mt-1"
            />
          </div>

          <Separator />

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 gradient-hover"
              disabled={loading || uploadingImage}
            >
              {loading ? 'Reporting...' : 'Report Food'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};