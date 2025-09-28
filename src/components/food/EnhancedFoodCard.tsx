import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  MapPin, 
  Package, 
  Timer, 
  AlertTriangle,
  Utensils,
  Users,
  Camera
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FoodReportData {
  id: string;
  food_name: string;
  food_type: 'veg' | 'non_veg' | 'snacks' | 'beverages' | 'dairy' | 'bakery';
  quantity: number;
  pickup_time: string;
  expiry_time?: string;
  description?: string;
  image_url?: string;
  status: 'new' | 'assigned' | 'picked' | 'delivered' | 'cancelled';
  created_at: string;
  hotels?: {
    name: string;
    street: string;
    city: string;
    contact: string;
    latitude?: number;
    longitude?: number;
  };
}

interface EnhancedFoodCardProps {
  foodReport: FoodReportData;
  onAcceptTask?: (taskId: string) => void;
  onViewDetails?: (taskId: string) => void;
  showActions?: boolean;
  isAgent?: boolean;
}

export const EnhancedFoodCard: React.FC<EnhancedFoodCardProps> = ({
  foodReport,
  onAcceptTask,
  onViewDetails,
  showActions = true,
  isAgent = false
}) => {
  const getFoodTypeIcon = (type: string) => {
    switch (type) {
      case 'veg': return '🥬';
      case 'non_veg': return '🍖';
      case 'snacks': return '🍿';
      case 'beverages': return '🥤';
      case 'dairy': return '🥛';
      case 'bakery': return '🍞';
      default: return '🍽️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800 border-green-200';
      case 'assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'picked': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyLevel = () => {
    if (!foodReport.expiry_time) return null;
    
    const now = new Date();
    const expiry = new Date(foodReport.expiry_time);
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilExpiry <= 2) return { level: 'Express', color: 'bg-red-100 text-red-800 border-red-200' };
    if (hoursUntilExpiry <= 6) return { level: 'Standard', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { level: 'Flexible', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const urgency = getUrgencyLevel();

  return (
    <Card className="food-card overflow-hidden">
      <div className="relative">
        {/* Food Image */}
        {foodReport.image_url ? (
          <img 
            src={foodReport.image_url} 
            alt={foodReport.food_name}
            className="food-card-image"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <div className="text-center">
              <Camera className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <span className="text-sm text-orange-600">No photo available</span>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <Badge className={`absolute top-3 right-3 ${getStatusColor(foodReport.status)}`}>
          {foodReport.status.toUpperCase()}
        </Badge>
        
        {/* Urgency Badge */}
        {urgency && (
          <Badge className={`absolute top-3 left-3 ${urgency.color}`}>
            {urgency.level}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">{getFoodTypeIcon(foodReport.food_type)}</span>
              {foodReport.food_name}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>{foodReport.quantity} servings</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {foodReport.food_type.replace('_', '-')}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Hotel Information */}
        {foodReport.hotels && (
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {foodReport.hotels.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm">{foodReport.hotels.name}</h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {foodReport.hotels.street}, {foodReport.hotels.city}
              </div>
            </div>
          </div>
        )}

        {/* Timing Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-green-700 font-medium">
              Available from {formatDistanceToNow(new Date(foodReport.pickup_time), { addSuffix: true })}
            </span>
          </div>
          
          {foodReport.expiry_time && (
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-orange-600" />
              <span className="text-orange-700">
                Best before {formatDistanceToNow(new Date(foodReport.expiry_time), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {foodReport.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {foodReport.description}
          </p>
        )}

        {/* Posted Time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          Posted {formatDistanceToNow(new Date(foodReport.created_at), { addSuffix: true })}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onViewDetails(foodReport.id)}
              >
                View Details
              </Button>
            )}
            {isAgent && onAcceptTask && foodReport.status === 'new' && (
              <Button 
                size="sm" 
                className="flex-1 gradient-hover"
                onClick={() => onAcceptTask(foodReport.id)}
              >
                Accept Task
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};