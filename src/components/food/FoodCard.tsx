import React from 'react';
import { Clock, MapPin, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FoodCardProps {
  food: {
    id: string;
    food_name: string;
    food_type: 'veg' | 'non_veg' | 'snacks' | 'beverages' | 'dairy' | 'bakery';
    description?: string;
    quantity: number;
    pickup_time: string;
    status: 'new' | 'assigned' | 'picked' | 'delivered' | 'cancelled';
    image_url?: string;
    hotels: {
      name: string;
      street: string;
      city: string;
      rating: number;
    };
  };
  onAction?: (action: string, foodId: string) => void;
  showActionButton?: boolean;
  actionButtonText?: string;
}

const FoodCard: React.FC<FoodCardProps> = ({ 
  food, 
  onAction, 
  showActionButton = true,
  actionButtonText = "Pick Up"
}) => {
  const getFoodTypeColor = (type: string) => {
    switch (type) {
      case 'veg':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'non_veg':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="food-card">
      <CardContent className="p-0">
        {food.image_url && (
          <div className="relative">
            <img
              src={food.image_url}
              alt={food.food_name}
              className="food-card-image"
            />
            <div className="absolute top-2 left-2">
              <Badge className={getFoodTypeColor(food.food_type)}>
                {food.food_type.replace('_', ' ')}
              </Badge>
            </div>
            <div className="absolute top-2 right-2">
              <Badge className={getStatusColor(food.status)}>
                {food.status}
              </Badge>
            </div>
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg">{food.food_name}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <User className="h-3 w-3 mr-1" />
                <span>{food.hotels.name}</span>
                <span className="ml-2">★ {food.hotels.rating}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Qty: {food.quantity}</div>
            </div>
          </div>

          {food.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {food.description}
            </p>
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>Pickup: {formatTime(food.pickup_time)}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{food.hotels.city}</span>
            </div>
          </div>

          {showActionButton && food.status === 'new' && (
            <Button 
              className="w-full"
              onClick={() => onAction?.('assign', food.id)}
            >
              {actionButtonText}
            </Button>
          )}

          {food.status === 'assigned' && (
            <Button 
              className="w-full" 
              variant="secondary"
              onClick={() => onAction?.('pickup', food.id)}
            >
              Mark as Picked Up
            </Button>
          )}

          {food.status === 'picked' && (
            <Button 
              className="w-full"
              onClick={() => onAction?.('deliver', food.id)}
            >
              Mark as Delivered
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodCard;