import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlockchainStatusProps {
  status?: {
    network: string;
    gasPrice: number;
    lastBlock: number;
    contractAddress: string;
    isOnline: boolean;
  };
}

export function BlockchainStatus({ status }: BlockchainStatusProps) {
  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-link text-purple-600"></i>
            <span>Blockchain Status</span>
          </CardTitle>
          <CardDescription>Loading blockchain network status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-link text-purple-600"></i>
            <span>Blockchain Status</span>
          </div>
          <Badge variant={status.isOnline ? "default" : "destructive"}>
            {status.isOnline ? "Online" : "Offline"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Smart contract deployment and network status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Network Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Network:</span>
              <span className="font-medium">{status.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gas Price:</span>
              <span className="font-medium">{status.gasPrice} gwei</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Block:</span>
              <span className="font-medium">#{status.lastBlock.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${status.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="font-medium">{status.isOnline ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>

          {/* Contract Address */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <i className="fas fa-file-contract text-purple-600"></i>
              <span className="text-sm font-medium text-purple-800">Smart Contract</span>
            </div>
            <div className="blockchain-hash">{status.contractAddress}</div>
          </div>

          {/* Network Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">21,000</div>
              <div className="text-xs text-gray-600">Avg Gas Used</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">2.3s</div>
              <div className="text-xs text-gray-600">Block Time</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">99.9%</div>
              <div className="text-xs text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
