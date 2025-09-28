import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Camera, Package } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    food_name: '',
    food_type: 'veg',
    quantity: '',
    pickup_time: '',
    expiry_time: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reportData = {
        hotel_id: hotelId,
        food_name: formData.food_name,
        food_type: formData.food_type as 'veg' | 'non_veg' | 'snacks',
        quantity: parseInt(formData.quantity),
        pickup_time: new Date(formData.pickup_time).toISOString(),
        expiry_time: formData.expiry_time ? new Date(formData.expiry_time).toISOString() : null,
        description: formData.description,
        status: 'new',
      };

      await onSubmit(reportData);

      setFormData({
        food_name: '',
        food_type: 'veg',
        quantity: '',
        pickup_time: '',
        expiry_time: '',
        description: '',
      });

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Report Surplus Food
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="food_name">Food Name</Label>
            <Input
              id="food_name"
              value={formData.food_name}
              onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
              placeholder="e.g., Biryani, Curry, Bread"
              required
            />
          </div>

          <div>
            <Label htmlFor="food_type">Food Type</Label>
            <Select
              value={formData.food_type}
              onValueChange={(value) => setFormData({ ...formData, food_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select food type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="veg">Vegetarian</SelectItem>
                <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity (servings)</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Number of servings"
              min="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="pickup_time">Pickup Time</Label>
            <Input
              id="pickup_time"
              type="datetime-local"
              value={formData.pickup_time}
              onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="expiry_time">Expiry Time (Optional)</Label>
            <Input
              id="expiry_time"
              type="datetime-local"
              value={formData.expiry_time}
              onChange={(e) => setFormData({ ...formData, expiry_time: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about the food..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
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
              disabled={loading}
            >
              {loading ? 'Reporting...' : 'Report Food'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};