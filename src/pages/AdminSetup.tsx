import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, AlertTriangle, Copy, ExternalLink, Search, TestTube } from 'lucide-react';
import { createAdminAccount, testAdminLogin } from '@/adminUtils';
import { debugAdminAccount, createAdminAccountDirect, testAdminLogin as debugTestLogin, checkSupabaseConnection } from '@/lib/debugAuth';
import { useNavigate } from 'react-router-dom';

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [testingLogin, setTestingLogin] = useState(false);
  const [debugging, setDebugging] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [adminCreated, setAdminCreated] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const navigate = useNavigate();

  const checkConnection = async () => {
    setDebugging(true);
    setError('');
    setMessage('');

    const result = await checkSupabaseConnection();
    
    if (result.error) {
      setError(`Connection failed: ${result.error.message}`);
    } else {
      setConnectionStatus(result);
      setMessage(`✅ Supabase connected successfully!`);
    }
    
    setDebugging(false);
  };

  const debugAccount = async () => {
    setDebugging(true);
    setError('');
    setMessage('');

    const result = await debugAdminAccount();
    
    if (result.error) {
      setError(`Debug failed: ${result.error.message}`);
    } else {
      setDebugInfo(result);
      setMessage(`Debug complete. Current user: ${result.currentUser?.email || 'None'}`);
    }
    
    setDebugging(false);
  };

  const createDirectAdmin = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const result = await createAdminAccountDirect();
    
    if (result.error) {
      if (result.error.message?.includes('already') || result.error.message?.includes('exists')) {
        setMessage('ℹ️ Admin account already exists. You can try logging in.');
        setAdminCreated(true);
      } else {
        setError(`Failed to create admin: ${result.error.message}`);
      }
    } else {
      setMessage('✅ Admin account created successfully! You can now login.');
      setAdminCreated(true);
    }
    
    setLoading(false);
  };

  const testDirectLogin = async () => {
    setTestingLogin(true);
    setError('');
    setMessage('');

    const result = await debugTestLogin();
    
    if (result.error) {
      setError(`Login test failed: ${result.error.message}`);
    } else {
      setMessage('✅ Admin login test successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    
    setTestingLogin(false);
  };

  const createAdmin = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const result = await createAdminAccount();
    
    if (result.success) {
      setMessage('✅ Admin account created successfully! You can now login.');
      setAdminCreated(true);
    } else {
      if (result.error?.includes('already') || result.error?.includes('exists')) {
        setMessage('ℹ️ Admin account already exists. You can try logging in.');
        setAdminCreated(true);
      } else {
        setError(`Failed to create admin: ${result.error}`);
      }
    }
    
    setLoading(false);
  };

  const testLogin = async () => {
    setTestingLogin(true);
    setError('');
    setMessage('');

    const result = await testAdminLogin();
    
    if (result.success) {
      setMessage('✅ Admin login test successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      setError(`Login test failed: ${result.error}`);
    }
    
    setTestingLogin(false);
  };

  const copyCredentials = () => {
    const credentials = `Email: admin@ellarukumfood.org\nPassword: EllarukumFood@2024!`;
    navigator.clipboard.writeText(credentials);
    setMessage('📋 Credentials copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center">
          <Shield className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
            Admin Setup
          </CardTitle>
          <CardDescription>
            Create the administrator account for EllarukumFood platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Admin Account Details:</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={copyCredentials}
                className="text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Email:</span> admin@ellarukumfood.org</p>
              <p><span className="font-medium">Password:</span> EllarukumFood@2024!</p>
              <p><span className="font-medium">Role:</span> Administrator</p>
              <p><span className="font-medium">Name:</span> EllarukumFood Administrator</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={createAdmin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600"
            >
              {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
            </Button>

            <div className="grid grid-cols-3 gap-1">
              <Button
                onClick={checkConnection}
                disabled={debugging}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {debugging ? 'Testing...' : 'Test DB'}
              </Button>
              <Button
                onClick={debugAccount}
                disabled={debugging}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Search className="h-3 w-3 mr-1" />
                {debugging ? 'Checking...' : 'Check User'}
              </Button>
              <Button
                onClick={createDirectAdmin}
                disabled={loading}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {loading ? 'Creating...' : 'Direct Create'}
              </Button>
            </div>

            {connectionStatus && (
              <div className="p-3 bg-blue-100 rounded text-xs">
                <p><strong>Connection:</strong> {connectionStatus.connected ? '✅ Connected' : '❌ Failed'}</p>
              </div>
            )}

            {debugInfo && (
              <div className="p-3 bg-gray-100 rounded text-xs">
                <p><strong>Current User:</strong> {debugInfo.currentUser?.email || 'None'}</p>
                <p><strong>User Info:</strong> {debugInfo.userInfo?.email || 'None'}</p>
                <p><strong>Session:</strong> {debugInfo.sessionExists ? 'Active' : 'None'}</p>
              </div>
            )}

            {adminCreated && (
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={testLogin}
                  disabled={testingLogin}
                  variant="outline"
                  size="sm"
                >
                  {testingLogin ? 'Testing...' : 'Test Login'}
                </Button>
                <Button
                  onClick={testDirectLogin}
                  disabled={testingLogin}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  Direct Test
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Go to Login
                </Button>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            This will create a one-time administrator account for the platform.
            After creation, you can login using the credentials above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;