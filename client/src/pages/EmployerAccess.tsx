import { useEffect, useState } from 'react';

export default function EmployerAccess() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'running' | 'down'>('checking');

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
          setServerStatus('running');
        } else {
          setServerStatus('down');
        }
      } catch (error) {
        setServerStatus('down');
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Employer Benefits Dashboard
        </h1>
        
        <div className="mb-6">
          <div className="flex items-center justify-center mb-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              serverStatus === 'running' ? 'bg-green-500' : 
              serverStatus === 'down' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm">
              {serverStatus === 'running' ? 'Server Running' : 
               serverStatus === 'down' ? 'Server Down' : 'Checking...'}
            </span>
          </div>
        </div>

        {serverStatus === 'running' ? (
          <div>
            <p className="text-gray-600 mb-6">
              Click below to access the employer dashboard with secure authentication
            </p>
            
            <a
              href="http://localhost:3001/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 inline-block mb-6"
            >
              Open Employer Dashboard
            </a>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Demo Accounts</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Employer:</strong> hr@techcorp.com / demo123</p>
                <p><strong>Admin:</strong> admin@benefits.com / admin123</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-red-600 mb-4">
              Employer dashboard server is not running
            </p>
            <p className="text-sm text-gray-600">
              The server needs to be started separately on port 3001
            </p>
          </div>
        )}
      </div>
    </div>
  );
}