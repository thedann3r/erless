import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  TestTube, 
  Clock, 
  Calendar,
  X,
  AlertTriangle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LabOrder {
  id: number;
  serviceName: string;
  serviceCode?: string;
  instructions: string;
  durationDays: number;
  expiresAt: string;
  createdAt: string;
  status: string;
}

interface ActiveLabOrdersProps {
  patientId: string;
  doctorId: number;
}

export default function ActiveLabOrders({ patientId, doctorId }: ActiveLabOrdersProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; labId?: number }>({ open: false });
  const [cancelReason, setCancelReason] = useState("");

  // Fetch active lab orders
  const { data: labOrders = [], isLoading } = useQuery({
    queryKey: [`/api/services/patient/${patientId}/lab`],
    enabled: !!patientId
  });

  // Cancel lab order mutation
  const cancelMutation = useMutation({
    mutationFn: async ({ labId, reason }: { labId: number; reason: string }) => {
      return await apiRequest('/api/lab-orders/cancel', 'POST', {
        labId,
        doctorId,
        reason
      });
    },
    onSuccess: () => {
      toast({
        title: "Lab Order Cancelled",
        description: "The lab order has been successfully cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/services/patient/${patientId}/lab`] });
      setCancelDialog({ open: false });
      setCancelReason("");
    },
    onError: (error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCancelClick = (labId: number) => {
    setCancelDialog({ open: true, labId });
  };

  const handleConfirmCancel = () => {
    if (!cancelDialog.labId || !cancelReason.trim()) {
      toast({
        title: "Justification Required",
        description: "Please provide a reason for cancelling this lab order.",
        variant: "destructive",
      });
      return;
    }

    cancelMutation.mutate({
      labId: cancelDialog.labId,
      reason: cancelReason.trim()
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Active Lab Orders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Active Lab Orders</span>
          </CardTitle>
          <CardDescription>
            Current active lab orders for this patient
          </CardDescription>
        </CardHeader>
        <CardContent>
          {labOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active lab orders</p>
          ) : (
            <div className="space-y-4">
              {labOrders.map((order: LabOrder) => {
                const daysRemaining = getDaysRemaining(order.expiresAt);
                const isExpiringSoon = daysRemaining <= 30;
                const isExpired = daysRemaining <= 0;

                return (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-lg">{order.serviceName}</h4>
                          {order.serviceCode && (
                            <Badge variant="outline">{order.serviceCode}</Badge>
                          )}
                          <Badge 
                            variant={isExpired ? "destructive" : isExpiringSoon ? "secondary" : "default"}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        
                        {order.instructions && (
                          <p className="text-gray-600 mb-2">
                            <strong>Instructions:</strong> {order.instructions}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Ordered: {formatDate(order.createdAt)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span 
                              className={
                                isExpired 
                                  ? "text-red-600 font-medium" 
                                  : isExpiringSoon 
                                    ? "text-orange-600 font-medium" 
                                    : ""
                              }
                            >
                              {isExpired 
                                ? "Expired" 
                                : `${daysRemaining} days remaining`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleCancelClick(order.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={cancelMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Cancel Lab Order</span>
            </DialogTitle>
            <DialogDescription>
              Please provide a justification for cancelling this lab order. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancelReason">Justification for Cancellation *</Label>
              <Textarea
                id="cancelReason"
                placeholder="Enter reason for cancelling this lab order..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCancelDialog({ open: false })}
              disabled={cancelMutation.isPending}
            >
              Keep Order
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending || !cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}