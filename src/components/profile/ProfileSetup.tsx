import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Building, Truck } from 'lucide-react';

interface ProfileSetupProps {
  role: 'hotel' | 'agent';
  onComplete: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ role, onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    street: '',
    city: '',
    landmark: '',
    area: '',
    zone: '',
    uniqueId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (role === 'hotel') {
        const { error } = await supabase.from('hotels').insert({
          user_id: user.id,
          name: formData.name,
          contact: formData.contact,
          street: formData.street,
          city: formData.city,
          landmark: formData.landmark,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('delivery_agents').insert({
          user_id: user.id,
          name: formData.name,
          contact: formData.contact,
          area: formData.area,
          zone: formData.zone,
          unique_id: formData.uniqueId,
        });
        if (error) throw error;
      }

      toast({
        title: "Profile Created!",
        description: `Your ${role} profile has been set up successfully.`,
      });
      onComplete();
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-bounce-in glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            {role === 'hotel' ? (
              <Building className="h-8 w-8 text-primary" />
            ) : (
              <Truck className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <p className="text-muted-foreground">
            Set up your {role} profile to get started
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={role === 'hotel' ? 'Hotel Name' : 'Your Name'}
                required
              />
            </div>

            <div>
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Phone Number"
                required
              />
            </div>

            {role === 'hotel' ? (
              <>
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Street Address"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="Nearby Landmark"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="uniqueId">Agent ID</Label>
                  <Input
                    id="uniqueId"
                    value={formData.uniqueId}
                    onChange={(e) => setFormData({ ...formData, uniqueId: e.target.value })}
                    placeholder="Unique Agent ID"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Service Area"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="zone">Zone</Label>
                  <Input
                    id="zone"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    placeholder="Service Zone"
                    required
                  />
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full gradient-hover"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};