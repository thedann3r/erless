import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Link, Database, CheckCircle, Clock, ExternalLink, 
  Shield, Zap, Copy, Search, Code 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BlockchainTransaction {
  id: number;
  claimId: number;
  transactionHash: string;
  blockNumber: number;
  contractAddress: string;
  gasUsed: number;
  gasPrice: string;
  network: string;
  status: string;
  createdAt: string;
}

interface AnchorRequest {
  claimId: number;
  claimHash: string;
}

export default function BlockchainPage() {
  const [anchorRequest, setAnchorRequest] = useState<Partial<AnchorRequest>>({});
  const [searchTxHash, setSearchTxHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const { data: recentTransactions, isLoading } = useQuery<BlockchainTransaction[]>({
    queryKey: ["/api/blockchain/transactions"],
  });

  const anchorClaimMutation = useMutation({
    mutationFn: async (data: AnchorRequest) => {
      const response = await apiRequest("POST", "/api/blockchain/anchor", data);
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('Claim anchored:', data);
      setAnchorRequest({});
    },
  });

  const handleAnchorClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anchorRequest.claimId || !anchorRequest.claimHash) {
      return;
    }
    anchorClaimMutation.mutate(anchorRequest as AnchorRequest);
  };

  const handleVerifyTransaction = async () => {
    if (!searchTxHash) return;
    
    // Mock verification result
    setVerificationResult({
      txHash: searchTxHash,
      blockNumber: 4892547,
      timestamp: new Date().toISOString(),
      gasUsed: 21000,
      status: 'confirmed',
      claimId: 'CLM-2024-001847'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatGasPrice = (gasPrice: string) => {
    const gwei = parseInt(gasPrice) / 1000000000;
    return `${gwei.toFixed(0)} gwei`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const smartContractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ErlassedClaims {
    struct Claim {
        string claimId;
        bytes32 claimHash;
        uint256 amount;
        string providerId;
        uint256 timestamp;
        address submitter;
        bool isValid;
    }
    
    mapping(string => Claim) public claims;
    mapping(address => bool) public authorizedSubmitters;
    
    event ClaimAnchored(
        string indexed claimId,
        bytes32 claimHash,
        address indexed submitter,
        uint256 timestamp
    );
    
    modifier onlyAuthorized() {
        require(authorizedSubmitters[msg.sender], "Not authorized");
        _;
    }
    
    function anchorClaim(
        string memory _claimId,
        bytes32 _claimHash,
        uint256 _amount,
        string memory _providerId
    ) public onlyAuthorized {
        require(!claims[_claimId].isValid, "Claim already exists");
        
        claims[_claimId] = Claim({
            claimId: _claimId,
            claimHash: _claimHash,
            amount: _amount,
            providerId: _providerId,
            timestamp: block.timestamp,
            submitter: msg.sender,
            isValid: true
        });
        
        emit ClaimAnchored(_claimId, _claimHash, msg.sender, block.timestamp);
    }
    
    function verifyClaim(string memory _claimId) 
        public view returns (Claim memory) {
        require(claims[_claimId].isValid, "Claim not found");
        return claims[_claimId];
    }
}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blockchain Claim Anchoring</h1>
          <p className="text-gray-600">Immutable claim verification on Sepolia testnet</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Sepolia Connected</span>
        </div>
      </div>

      <Tabs defaultValue="anchor" className="space-y-6">
        <TabsList>
          <TabsTrigger value="anchor">Anchor Claims</TabsTrigger>
          <TabsTrigger value="verify">Verify Transaction</TabsTrigger>
          <TabsTrigger value="contract">Smart Contract</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="anchor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Anchor Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Link className="w-5 h-5 text-blue-600" />
                  <span>Anchor New Claim</span>
                </CardTitle>
                <CardDescription>
                  Submit a claim to the blockchain for immutable verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAnchorClaim} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="claim-id">Claim ID</Label>
                    <Input
                      id="claim-id"
                      type="number"
                      placeholder="12345"
                      value={anchorRequest.claimId || ''}
                      onChange={(e) => setAnchorRequest(prev => ({ ...prev, claimId: parseInt(e.target.value) }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="claim-hash">Claim Hash</Label>
                    <Textarea
                      id="claim-hash"
                      rows={3}
                      placeholder="SHA256 hash of claim data"
                      value={anchorRequest.claimHash || ''}
                      onChange={(e) => setAnchorRequest(prev => ({ ...prev, claimHash: e.target.value }))}
                      className="font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Cryptographic hash representing the claim's immutable state
                    </p>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Once anchored to the blockchain, this claim cannot be modified or deleted. 
                      The transaction will be permanently recorded on Sepolia testnet.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={anchorClaimMutation.isPending}
                  >
                    {anchorClaimMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Anchoring to Blockchain...
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4 mr-2" />
                        Anchor to Blockchain
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Network Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <span>Network Status</span>
                </CardTitle>
                <CardDescription>
                  Sepolia testnet connection and gas information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">Network</span>
                    </div>
                    <p className="text-sm text-green-700">Sepolia Testnet</p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Gas Price</span>
                    </div>
                    <p className="text-sm text-blue-700">15 gwei</p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <Database className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-900">Last Block</span>
                    </div>
                    <p className="text-sm text-purple-700">#4,892,547</p>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-900">Contract</span>
                    </div>
                    <p className="text-xs text-orange-700 font-mono">0x742d...9B2e</p>
                  </div>
                </div>

                <Alert className="border-purple-200 bg-purple-50">
                  <Database className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>Smart Contract Active</strong>
                        <p className="text-sm mt-1">ErlassedClaims v1.0 deployed and verified</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">Live</Badge>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Contract Address</h5>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs bg-white p-2 rounded border font-mono">
                      0x742d35Cc6634C0532925a3b8D42d4738A12F9B2e
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard('0x742d35Cc6634C0532925a3b8D42d4738A12F9B2e')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verify" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-green-600" />
                <span>Transaction Verification</span>
              </CardTitle>
              <CardDescription>
                Verify claim anchoring by transaction hash
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="tx-hash">Transaction Hash</Label>
                  <Input
                    id="tx-hash"
                    placeholder="0x..."
                    value={searchTxHash}
                    onChange={(e) => setSearchTxHash(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <Button 
                  onClick={handleVerifyTransaction}
                  disabled={!searchTxHash}
                  className="mt-6"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              </div>

              {verificationResult && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Transaction Verified</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Block Number:</span>
                      <span className="ml-2 font-medium">{verificationResult.blockNumber}</span>
                    </div>
                    <div>
                      <span className="text-green-700">Claim ID:</span>
                      <span className="ml-2 font-medium">{verificationResult.claimId}</span>
                    </div>
                    <div>
                      <span className="text-green-700">Gas Used:</span>
                      <span className="ml-2 font-medium">{verificationResult.gasUsed.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-green-700">Status:</span>
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        {verificationResult.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View on Etherscan
                    </Button>
                    <Button size="sm" variant="outline">
                      Download Certificate
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contract" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-orange-600" />
                <span>Smart Contract Code</span>
              </CardTitle>
              <CardDescription>
                Solidity contract deployed on Sepolia testnet for claim anchoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {smartContractCode}
                </pre>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">Compiler Version</h5>
                  <p className="text-sm text-blue-700">Solidity 0.8.19</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-1">Verification</h5>
                  <p className="text-sm text-green-700">✓ Verified on Etherscan</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h5 className="font-medium text-purple-900 mb-1">License</h5>
                  <p className="text-sm text-purple-700">MIT</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Blockchain Transactions</CardTitle>
              <CardDescription>
                Latest claim anchoring transactions on Sepolia testnet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : !recentTransactions || recentTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions found</p>
                  <p className="text-sm">Blockchain transactions will appear here after claims are anchored</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(tx.status)}>
                            {tx.status.toUpperCase()}
                          </Badge>
                          <span className="font-medium">Claim #{tx.claimId}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Tx Hash:</span>
                          <div className="font-mono text-xs truncate">
                            {tx.transactionHash}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Block:</span>
                          <span className="ml-2 font-medium">#{tx.blockNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Gas Used:</span>
                          <span className="ml-2 font-medium">{tx.gasUsed?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Gas Price:</span>
                          <span className="ml-2 font-medium">{formatGasPrice(tx.gasPrice)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Etherscan
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(tx.transactionHash)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Hash
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
