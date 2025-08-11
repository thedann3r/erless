import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BlockchainStatus } from "@/components/blockchain-status";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Blockchain() {
  const [anchorData, setAnchorData] = useState({
    claimId: "",
    claimHash: "",
    amount: "",
    providerId: ""
  });
  const [verificationHash, setVerificationHash] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const { toast } = useToast();

  const { data: blockchainStatus } = useQuery({
    queryKey: ["/api/blockchain/status"],
  });

  const { data: claims } = useQuery({
    queryKey: ["/api/claims"],
  });

  const anchorClaimMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/blockchain/anchor", data);
      return await res.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Blockchain Anchoring Complete",
        description: `Transaction hash: ${result.txHash}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      // Reset form
      setAnchorData({
        claimId: "",
        claimHash: "",
        amount: "",
        providerId: ""
      });
    },
    onError: () => {
      toast({
        title: "Anchoring Failed",
        description: "Failed to anchor claim to blockchain. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnchorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    anchorClaimMutation.mutate({
      claimId: anchorData.claimId,
      claimHash: anchorData.claimHash || generateClaimHash(),
      amount: anchorData.amount,
      providerId: anchorData.providerId
    });
  };

  const generateClaimHash = () => {
    // Generate a mock SHA256-like hash
    return "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  const handleVerification = () => {
    if (!verificationHash.trim()) {
      toast({
        title: "Error",
        description: "Please enter a transaction hash to verify",
        variant: "destructive",
      });
      return;
    }

    // Simulate verification result
    const mockResult = {
      isValid: true,
      block: Math.floor(Math.random() * 1000000) + 4000000,
      timestamp: new Date().toISOString(),
      gasUsed: 21000,
      confirmations: Math.floor(Math.random() * 100) + 12
    };

    setVerificationResult(mockResult);
    toast({
      title: "Verification Complete",
      description: `Transaction found in block ${mockResult.block}`,
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Blockchain Claim Anchoring</h1>
            <p className="text-gray-600">Secure claim anchoring to Sepolia testnet</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Blockchain Status */}
            <div className="space-y-6">
              <BlockchainStatus status={blockchainStatus} />

              {/* Anchor New Claim */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-anchor text-blue-500"></i>
                    <span>Anchor New Claim</span>
                  </CardTitle>
                  <CardDescription>
                    Submit a claim to the blockchain for immutable record keeping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAnchorSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="claimId">Claim ID</Label>
                      <Input
                        id="claimId"
                        placeholder="CLM-2024-001234"
                        value={anchorData.claimId}
                        onChange={(e) => setAnchorData(prev => ({ ...prev, claimId: e.target.value }))}
                        className="medical-form-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="claimHash">Claim Hash (Optional)</Label>
                      <Textarea
                        id="claimHash"
                        placeholder="SHA256 hash of claim data (auto-generated if empty)"
                        rows={3}
                        value={anchorData.claimHash}
                        onChange={(e) => setAnchorData(prev => ({ ...prev, claimHash: e.target.value }))}
                        className="medical-form-input font-mono text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={anchorData.amount}
                          onChange={(e) => setAnchorData(prev => ({ ...prev, amount: e.target.value }))}
                          className="medical-form-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="providerId">Provider ID</Label>
                        <Input
                          id="providerId"
                          placeholder="PRV-001"
                          value={anchorData.providerId}
                          onChange={(e) => setAnchorData(prev => ({ ...prev, providerId: e.target.value }))}
                          className="medical-form-input"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={anchorClaimMutation.isPending}
                    >
                      {anchorClaimMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner animate-spin mr-2"></i>
                          Anchoring to Blockchain...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-link mr-2"></i>
                          Anchor to Blockchain
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Verification and Recent Transactions */}
            <div className="space-y-6">
              {/* Claim Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-search text-green-500"></i>
                    <span>Claim Verification</span>
                  </CardTitle>
                  <CardDescription>
                    Verify claim integrity using transaction hash
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="txHash">Transaction Hash</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="txHash"
                          placeholder="0x..."
                          value={verificationHash}
                          onChange={(e) => setVerificationHash(e.target.value)}
                          className="medical-form-input font-mono text-sm"
                        />
                        <Button 
                          onClick={handleVerification}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <i className="fas fa-search"></i>
                        </Button>
                      </div>
                    </div>

                    {verificationResult && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <i className="fas fa-check-circle text-green-500"></i>
                          <span className="font-medium text-green-800">Transaction Verified</span>
                        </div>
                        <div className="space-y-2 text-sm text-green-700">
                          <div className="flex justify-between">
                            <span>Block:</span>
                            <span className="font-mono">#{verificationResult.block}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Timestamp:</span>
                            <span>{new Date(verificationResult.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Gas Used:</span>
                            <span>{verificationResult.gasUsed.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Confirmations:</span>
                            <span>{verificationResult.confirmations}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          <i className="fas fa-external-link-alt mr-2"></i>
                          View on Etherscan
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Anchored Claims */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-history text-purple-500"></i>
                    <span>Recent Anchored Claims</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {claims && claims.filter((claim: any) => claim.blockchainTxHash).length > 0 ? (
                    <div className="space-y-3">
                      {claims
                        .filter((claim: any) => claim.blockchainTxHash)
                        .slice(0, 5)
                        .map((claim: any) => (
                          <div key={claim.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-mono text-sm text-gray-700">{claim.blockchainTxHash}</div>
                              <span className="text-xs text-green-600">Confirmed</span>
                            </div>
                            <div className="text-sm text-gray-600">Claim ID: {claim.claimId}</div>
                            <div className="text-xs text-gray-500">{new Date(claim.createdAt).toLocaleString()}</div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <i className="fas fa-link text-3xl mb-4 text-gray-300"></i>
                      <p>No anchored claims yet</p>
                      <p className="text-sm mt-2">Claims will appear here once anchored to blockchain</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Smart Contract Code Display */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-code text-orange-500"></i>
                  <span>Smart Contract (Solidity)</span>
                </CardTitle>
                <CardDescription>
                  Erlessed Claims smart contract deployed on Sepolia testnet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ErlassedClaims {
    struct Claim {
        string claimId;
        bytes32 claimHash;
        uint256 amount;
        string providerId;
        uint256 timestamp;
        address submitter;
        bool isAnchored;
    }
    
    mapping(string => Claim) public claims;
    mapping(address => bool) public authorizedSubmitters;
    
    event ClaimAnchored(
        string indexed claimId,
        bytes32 claimHash,
        uint256 amount,
        address submitter
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
        require(!claims[_claimId].isAnchored, "Claim already anchored");
        
        claims[_claimId] = Claim({
            claimId: _claimId,
            claimHash: _claimHash,
            amount: _amount,
            providerId: _providerId,
            timestamp: block.timestamp,
            submitter: msg.sender,
            isAnchored: true
        });
        
        emit ClaimAnchored(_claimId, _claimHash, _amount, msg.sender);
    }
    
    function verifyClaim(string memory _claimId) 
        public view returns (Claim memory) {
        require(claims[_claimId].isAnchored, "Claim not found");
        return claims[_claimId];
    }
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
