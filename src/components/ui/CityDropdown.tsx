import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { tamilNaduAreas } from '@/constants/tamilNadu';
import { useCity } from '@/contexts/CityContext';

const CityDropdown = () => {
  const { selectedCity, setSelectedCity } = useCity();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCities = tamilNaduAreas.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 transition-all duration-300 border border-blue-200/50 hover:border-blue-300/50"
        >
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 min-w-[80px] text-left">
            {selectedCity}
          </span>
          <ChevronDown className="h-3 w-3 text-blue-600" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 max-h-80 overflow-y-auto bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-lg" 
        align="center"
        sideOffset={5}
      >
        <DropdownMenuLabel className="px-2 py-2 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-sm border-0 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white rounded-md"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {filteredCities.length > 0 ? (
          filteredCities.map((city) => (
            <DropdownMenuItem
              key={city}
              onClick={() => handleCitySelect(city)}
              className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                city === selectedCity 
                  ? 'bg-blue-100 text-blue-800 font-medium border-l-2 border-blue-500' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span>{city}</span>
                {city === selectedCity && (
                  <div className="h-2 w-2 bg-blue-600 rounded-full" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled className="text-gray-500 text-sm">
            No cities found
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
          {filteredCities.length} of {tamilNaduAreas.length} cities
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CityDropdown;