import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const TestAuth = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [lastError, setLastError] = useState<string | null>(null);
  const { user, signIn, signUp, signOut } = useAuth();

  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('failed');
          setLastError(error.message);
        } else {
          setConnectionStatus('connected');
          console.log('✅ Supabase connected successfully');
        }
      } catch (error: any) {
        console.error('Connection test failed:', error);
        setConnectionStatus('failed');
        setLastError(error.message || 'Connection failed');
      }
    };

    testConnection();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLastError(null);
    
    try {
      if (isSignUp) {
        console.log('🔄 Attempting sign up...');
        const result = await signUp(email, password, {
          name: 'Test User',
          role: 'hotel',
          phone: '1234567890'
        });
        console.log('SignUp result:', result);
        if (result.error) {
          setLastError(`Sign up failed: ${result.error.message}`);
        }
      } else {
        console.log('🔄 Attempting sign in...');
        const result = await signIn(email, password);
        console.log('SignIn result:', result);
        if (result.error) {
          setLastError(`Sign in failed: ${result.error.message}`);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setLastError(`Auth error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setLastError(null);
    } catch (error: any) {
      console.error('SignOut error:', error);
      setLastError(`Sign out error: ${error.message || error}`);
    }
  };

  const testDirectAuth = async () => {
    try {
      console.log('🧪 Testing direct Supabase auth...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('❌ Direct auth failed:', error);
        setLastError(`Direct auth failed: ${error.message}`);
      } else {
        console.log('✅ Direct auth successful:', data);
        setLastError(null);
      }
    } catch (error: any) {
      console.error('❌ Direct auth exception:', error);
      setLastError(`Direct auth exception: ${error.message || error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🔐 Test Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <Alert className={connectionStatus === 'connected' ? 'border-green-500 bg-green-50' : 
                           connectionStatus === 'failed' ? 'border-red-500 bg-red-50' : 
                           'border-yellow-500 bg-yellow-50'}>
            <AlertDescription>
              {connectionStatus === 'checking' && '🔄 Checking Supabase connection...'}
              {connectionStatus === 'connected' && '✅ Supabase connected successfully'}
              {connectionStatus === 'failed' && `❌ Connection failed: ${lastError}`}
            </AlertDescription>
          </Alert>

          {user ? (
            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-50">
                <AlertDescription>
                  ✅ Logged in as: <strong>{user.email}</strong><br/>
                  User ID: <code className="text-xs">{user.id}</code>
                </AlertDescription>
              </Alert>
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                🚪 Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {lastError && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertDescription>
                    ❌ <strong>Error:</strong> {lastError}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">📧 Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">🔒 Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="submit"
                    disabled={loading || connectionStatus !== 'connected'}
                    className={`${!isSignUp ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={!isSignUp ? 'default' : 'outline'}
                    onClick={() => setIsSignUp(false)}
                  >
                    {loading && !isSignUp ? '🔄 Signing In...' : '🔐 Sign In'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || connectionStatus !== 'connected'}
                    className={`${isSignUp ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    variant={isSignUp ? 'default' : 'outline'}
                    onClick={() => setIsSignUp(true)}
                  >
                    {loading && isSignUp ? '🔄 Signing Up...' : '📝 Sign Up'}
                  </Button>
                </div>
              </form>
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={testDirectAuth}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  disabled={connectionStatus !== 'connected'}
                >
                  🧪 Test Direct Supabase Auth
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>💡 Instructions:</strong></p>
                <p>1. First click <strong>"Sign Up"</strong> to create account</p>
                <p>2. Then try <strong>"Sign In"</strong> with same credentials</p>
                <p>3. Check browser console for detailed logs</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAuth;