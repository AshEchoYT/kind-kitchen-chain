import React from 'react';
import { Clock, MapPin, Star, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FoodCardProps {
  id: string;
  name: string;
  restaurant: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  cookTime: number;
  isVeg: boolean;
  quantity: number;
  pickupTime: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  name,
  restaurant,
  location,
  image,
  price,
  rating,
  cookTime,
  isVeg,
  quantity,
  pickupTime
}) => {
  return (
    <Card className="food-card overflow-hidden group glass-card hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="food-card-image group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute top-2 left-2">
          <Badge className={`${isVeg ? 'badge-veg' : 'badge-non-veg'} animate-pulse-glow`}>
            {isVeg ? '🌱 Veg' : '🍖 Non-Veg'}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-accent text-accent-foreground animate-shimmer">
            ✨ Free
          </Badge>
        </div>
        
        {/* Floating quantity indicator */}
        <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold animate-bounce-in">
          {quantity} servings
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{name}</h3>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 animate-pulse" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-1 font-medium">{restaurant}</p>
        <p className="text-muted-foreground text-xs mb-3 flex items-center">
          <MapPin className="h-3 w-3 mr-1 text-primary" />
          {location}
        </p>
        
        <div className="flex justify-between items-center text-sm mb-3">
          <span className="flex items-center text-warning font-medium">
            <Clock className="h-4 w-4 mr-1" />
            Pickup: {pickupTime}
          </span>
          <Badge variant="outline" className="text-xs">
            Fresh
          </Badge>
        </div>
        
        <Button className="w-full gradient-hover group-hover:scale-105 transition-transform animate-shimmer">
          <Heart className="h-4 w-4 mr-2" />
          Request Pickup
        </Button>
      </CardContent>
    </Card>
  );
};