import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Package,
  User,
  AlertTriangle,
  Camera,
  MessageSquare,
  Route
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

interface TaskData {
  id: string;
  food_report: {
    food_name: string;
    food_type: string;
    quantity: number;
    expiry_time: string;
    pickup_location: string;
    description: string;
    hotels: {
      name: string;
      phone: string;
      address: string;
    };
  };
  needy_person: {
    name: string;
    contact: string;
    street: string;
    city: string;
    landmark?: string;
    notes?: string;
  };
  status: string;
}

type DeliveryStage = 'going_to_pickup' | 'arrived_at_pickup' | 'food_picked' | 'going_to_delivery' | 'arrived_at_delivery' | 'delivered';

const stageConfig = {
  going_to_pickup: { 
    title: 'Going to Restaurant', 
    progress: 16, 
    color: 'blue',
    icon: Navigation,
    description: 'Navigate to restaurant for food pickup'
  },
  arrived_at_pickup: { 
    title: 'At Restaurant', 
    progress: 33, 
    color: 'orange',
    icon: MapPin,
    description: 'Arrived at pickup location'
  },
  food_picked: { 
    title: 'Food Collected', 
    progress: 50, 
    color: 'orange',
    icon: Package,
    description: 'Food picked up successfully'
  },
  going_to_delivery: { 
    title: 'Going to Recipient', 
    progress: 66, 
    color: 'blue',
    icon: Route,
    description: 'Navigate to delivery location'
  },
  arrived_at_delivery: { 
    title: 'At Delivery Location', 
    progress: 83, 
    color: 'green',
    icon: User,
    description: 'Arrived at delivery location'
  },
  delivered: { 
    title: 'Delivered Successfully', 
    progress: 100, 
    color: 'green',
    icon: CheckCircle,
    description: 'Food delivered successfully'
  }
};

const AgentPickupFlow = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState<DeliveryStage>('going_to_pickup');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Mock task data - in real app, fetch from database
  const [taskData] = useState<TaskData>({
    id: taskId || '',
    food_report: {
      food_name: 'Hyderabadi Biryani & Curry',
      food_type: 'non_veg',
      quantity: 15,
      expiry_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      pickup_location: 'Paradise Biryani, Anna Salai',
      description: 'Fresh biryani with raita and shorba, good for 15 people',
      hotels: {
        name: 'Paradise Biryani',
        phone: '+91 9876543210',
        address: '123 Anna Salai, Chennai, Tamil Nadu'
      }
    },
    needy_person: {
      name: 'Ravi Kumar',
      contact: '+91 9123456789',
      street: 'Gandhi Nagar, Block C',
      city: 'Chennai',
      landmark: 'Near Corporation School',
      notes: 'High priority - elderly person with children, preferred time evening'
    },
    status: 'assigned'
  });

  const currentStageConfig = stageConfig[currentStage];
  const StageIcon = currentStageConfig.icon;

  const handleNextStage = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const stages: DeliveryStage[] = ['going_to_pickup', 'arrived_at_pickup', 'food_picked', 'going_to_delivery', 'arrived_at_delivery', 'delivered'];
    const currentIndex = stages.indexOf(currentStage);
    
    if (currentIndex < stages.length - 1) {
      setCurrentStage(stages[currentIndex + 1]);
    } else {
      // Delivery completed, return to task board
      navigate('/agent-task-board');
    }
    
    setLoading(false);
  };

  const handleCallRestaurant = () => {
    window.open(`tel:${taskData.food_report.hotels.phone}`, '_self');
  };

  const handleCallRecipient = () => {
    window.open(`tel:${taskData.needy_person.contact}`, '_self');
  };

  const handleNavigate = (destination: 'pickup' | 'delivery') => {
    const address = destination === 'pickup' 
      ? taskData.food_report.hotels.address
      : `${taskData.needy_person.street}, ${taskData.needy_person.city}`;
    
    // Open Google Maps with navigation
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
  };

  const getActionButton = () => {
    switch (currentStage) {
      case 'going_to_pickup':
        return (
          <div className="space-y-3">
            <Button 
              onClick={() => handleNavigate('pickup')}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Navigate to Restaurant
            </Button>
            <Button 
              onClick={handleNextStage}
              variant="outline"
              className="w-full h-12"
              disabled={loading}
            >
              <MapPin className="h-5 w-5 mr-2" />
              I've Arrived at Restaurant
            </Button>
          </div>
        );
      
      case 'arrived_at_pickup':
        return (
          <div className="space-y-3">
            <Button 
              onClick={handleCallRestaurant}
              className="w-full bg-orange-600 hover:bg-orange-700 h-12"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Restaurant: {taskData.food_report.hotels.phone}
            </Button>
            <Button 
              onClick={handleNextStage}
              className="w-full h-12"
              disabled={loading}
            >
              <Package className="h-5 w-5 mr-2" />
              Food Collected - Start Delivery
            </Button>
          </div>
        );
      
      case 'food_picked':
        return (
          <div className="space-y-3">
            <Button 
              onClick={() => handleNavigate('delivery')}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Navigate to Delivery Location
            </Button>
            <Button 
              onClick={handleNextStage}
              variant="outline"
              className="w-full h-12"
              disabled={loading}
            >
              <User className="h-5 w-5 mr-2" />
              I've Arrived at Delivery Location
            </Button>
          </div>
        );
      
      case 'going_to_delivery':
        return (
          <div className="space-y-3">
            <Button 
              onClick={() => handleNavigate('delivery')}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Continue Navigation
            </Button>
            <Button 
              onClick={handleNextStage}
              variant="outline"
              className="w-full h-12"
              disabled={loading}
            >
              <User className="h-5 w-5 mr-2" />
              I've Arrived at Delivery Location
            </Button>
          </div>
        );
      
      case 'arrived_at_delivery':
        return (
          <div className="space-y-3">
            <Button 
              onClick={handleCallRecipient}
              className="w-full bg-green-600 hover:bg-green-700 h-12"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Recipient: {taskData.needy_person.contact}
            </Button>
            <Button 
              onClick={handleNextStage}
              className="w-full h-12"
              disabled={loading}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Mark as Delivered
            </Button>
          </div>
        );
      
      case 'delivered':
        return (
          <Button 
            onClick={() => navigate('/agent-task-board')}
            className="w-full bg-green-600 hover:bg-green-700 h-12"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Return to Task Board
          </Button>
        );
    }
  };

  const timeRemaining = new Date(taskData.food_report.expiry_time).getTime() - Date.now();
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
  const minutesRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Progress Header */}
          <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-full bg-${currentStageConfig.color}-100 text-${currentStageConfig.color}-600`}>
                  <StageIcon className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-2xl">{currentStageConfig.title}</CardTitle>
              <CardDescription className="text-lg">
                {currentStageConfig.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{currentStageConfig.progress}%</span>
                  </div>
                  <Progress 
                    value={currentStageConfig.progress} 
                    className="h-3" 
                  />
                </div>
                
                {/* Time Warning */}
                {hoursRemaining < 2 && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-700">
                      ⏰ Food expires in {hoursRemaining}h {minutesRemaining}m - Please deliver quickly!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pickup Information */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Package className="h-5 w-5" />
                  Pickup Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">{taskData.food_report.hotels.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-orange-600" />
                      <span>{taskData.food_report.hotels.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-orange-600" />
                      <span>{taskData.food_report.hotels.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Food Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Item:</strong> {taskData.food_report.food_name}</p>
                    <p><strong>Type:</strong> 
                      <Badge className="ml-2" variant={taskData.food_report.food_type === 'veg' ? 'default' : 'secondary'}>
                        {taskData.food_report.food_type === 'veg' ? '🥗 Veg' : '🍗 Non-Veg'}
                      </Badge>
                    </p>
                    <p><strong>Quantity:</strong> {taskData.food_report.quantity} portions</p>
                    <p><strong>Expires:</strong> {new Date(taskData.food_report.expiry_time).toLocaleString()}</p>
                    <p><strong>Description:</strong> {taskData.food_report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <User className="h-5 w-5" />
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">{taskData.needy_person.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-green-600" />
                      <div>
                        <p>{taskData.needy_person.street}, {taskData.needy_person.city}</p>
                        {taskData.needy_person.landmark && (
                          <p className="text-muted-foreground">Landmark: {taskData.needy_person.landmark}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      <span>{taskData.needy_person.contact}</span>
                    </div>
                  </div>
                </div>

                {taskData.needy_person.notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Special Instructions
                    </h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">{taskData.needy_person.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <Card className="mt-6 bg-white/95 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              {getActionButton()}

              {/* Notes Section */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Add Notes (Optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about the pickup/delivery process..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Emergency Actions */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">Need help?</p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-1" />
                    Take Photo
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Report Issue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage Progress Timeline */}
          <Card className="mt-6 bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Delivery Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stageConfig).map(([stage, config], index) => {
                  const isCompleted = config.progress <= currentStageConfig.progress;
                  const isCurrent = stage === currentStage;
                  const ConfigIcon = config.icon;
                  
                  return (
                    <div key={stage} className="flex items-center gap-4">
                      <div className={`p-2 rounded-full transition-colors ${
                        isCompleted 
                          ? `bg-${config.color}-100 text-${config.color}-600` 
                          : 'bg-gray-100 text-gray-400'
                      } ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}>
                        <ConfigIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                          {config.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                      {isCompleted && stage !== currentStage && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AgentPickupFlow;