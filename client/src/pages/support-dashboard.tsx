import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  MessageCircle,
  FileText,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  id: string;
  user_id: string;
  user_role: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  assigned_to?: string;
}

interface TicketResponse {
  id: string;
  ticket_id: string;
  responder_id: string;
  responder_name: string;
  message: string;
  created_at: string;
}

export default function SupportDashboard() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["/api/support/tickets", filterStatus, filterPriority],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      const response = await fetch(`http://localhost:8002/tickets?${params.toString()}`);
      return response.json();
    }
  });

  // Fetch ticket responses
  const { data: responses = [] } = useQuery({
    queryKey: ["/api/support/responses", selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket?.id) return [];
      const response = await fetch(`http://localhost:8002/tickets/${selectedTicket.id}/responses`);
      return response.json();
    },
    enabled: !!selectedTicket?.id
  });

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, update }: { ticketId: string; update: any }) => {
      const response = await fetch(`http://localhost:8002/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      toast({
        title: "Ticket Updated",
        description: "The support ticket has been updated successfully."
      });
    }
  });

  // Filter tickets
  const filteredTickets = tickets.filter((ticket: SupportTicket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.user_role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter((t: SupportTicket) => t.status === 'open').length,
    inProgress: tickets.filter((t: SupportTicket) => t.status === 'in_progress').length,
    resolved: tickets.filter((t: SupportTicket) => t.status === 'resolved').length,
    urgent: tickets.filter((t: SupportTicket) => t.priority === 'urgent').length
  };

  const handleUpdateTicket = (status: string, priority?: string) => {
    if (!selectedTicket) return;
    
    const update: any = { status };
    if (priority) update.priority = priority;
    if (responseMessage.trim()) update.response = responseMessage.trim();
    
    updateTicketMutation.mutate({ ticketId: selectedTicket.id, update });
    setResponseMessage("");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-teal-100 dark:bg-teal-900 p-3 rounded-full mr-4">
              <MessageSquare className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Support Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage support tickets and user assistance
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Being handled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
            <CardDescription>Manage and respond to user support requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tickets Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket: SupportTicket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">{ticket.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {ticket.user_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {ticket.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPriorityColor(ticket.priority)} capitalize`}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(ticket.status)} capitalize`}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {formatDate(ticket.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{selectedTicket?.title}</DialogTitle>
                            <DialogDescription>
                              Ticket #{selectedTicket?.id.slice(-8)} • Created {selectedTicket && formatDate(selectedTicket.created_at)}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedTicket && (
                            <div className="space-y-6">
                              {/* Ticket Details */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">User Role</Label>
                                  <Badge variant="outline" className="mt-1 capitalize">
                                    {selectedTicket.user_role}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Category</Label>
                                  <Badge variant="secondary" className="mt-1 capitalize">
                                    {selectedTicket.category}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Priority</Label>
                                  <Badge className={`mt-1 ${getPriorityColor(selectedTicket.priority)} capitalize`}>
                                    {selectedTicket.priority}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <Badge className={`mt-1 ${getStatusColor(selectedTicket.status)} capitalize`}>
                                    {selectedTicket.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>

                              {/* Description */}
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                                  {selectedTicket.description}
                                </div>
                              </div>

                              {/* Responses */}
                              <div>
                                <Label className="text-sm font-medium">Conversation</Label>
                                <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                                  {responses.map((response: TicketResponse) => (
                                    <div key={response.id} className="flex gap-3">
                                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-xs font-medium">
                                        {response.responder_name.charAt(0)}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm font-medium">{response.responder_name}</span>
                                          <span className="text-xs text-gray-500">
                                            {formatDate(response.created_at)}
                                          </span>
                                        </div>
                                        <div className="text-sm text-gray-700 bg-white p-2 rounded border">
                                          {response.message}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Response Form */}
                              <div>
                                <Label className="text-sm font-medium">Add Response</Label>
                                <Textarea
                                  placeholder="Type your response..."
                                  value={responseMessage}
                                  onChange={(e) => setResponseMessage(e.target.value)}
                                  className="mt-2"
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-4 border-t">
                                <Button
                                  onClick={() => handleUpdateTicket('in_progress')}
                                  disabled={updateTicketMutation.isPending}
                                  variant="outline"
                                >
                                  Mark In Progress
                                </Button>
                                <Button
                                  onClick={() => handleUpdateTicket('resolved')}
                                  disabled={updateTicketMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Resolve Ticket
                                </Button>
                                <Button
                                  onClick={() => handleUpdateTicket('closed')}
                                  disabled={updateTicketMutation.isPending}
                                  variant="outline"
                                >
                                  Close Ticket
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}