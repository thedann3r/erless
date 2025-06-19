import { useState, useEffect } from "react";
import { HelpCircle, MessageSquare, Book, FileText, Search, X, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SupportTicket {
  id?: string;
  user_id: string;
  user_role: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at?: string;
  updated_at?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  role?: string;
  category: string;
  helpful_count: number;
}

interface DocumentationPage {
  id: string;
  title: string;
  content: string;
  role?: string;
  category: string;
  tags: string[];
}

interface SupportWidgetProps {
  userRole: string;
  className?: string;
}

export function SupportWidget({ userRole, className = "" }: SupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState<Partial<SupportTicket>>({
    title: "",
    description: "",
    category: "",
    priority: "medium"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch FAQ data
  const { data: faqData = [] } = useQuery({
    queryKey: ["/api/support/faq", userRole],
    queryFn: () => fetch(`http://localhost:8002/faq?role=${userRole}`).then(res => res.json()),
    enabled: isOpen
  });

  // Fetch documentation
  const { data: docsData = [] } = useQuery({
    queryKey: ["/api/support/documentation", userRole],
    queryFn: () => fetch(`http://localhost:8002/documentation?role=${userRole}`).then(res => res.json()),
    enabled: isOpen
  });

  // Fetch user tickets
  const { data: ticketsData = [] } = useQuery({
    queryKey: ["/api/support/tickets"],
    queryFn: () => fetch("http://localhost:8002/tickets").then(res => res.json()),
    enabled: isOpen
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: (ticket: Partial<SupportTicket>) =>
      fetch("http://localhost:8002/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ticket, user_role: userRole })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      setShowTicketForm(false);
      setTicketForm({ title: "", description: "", category: "", priority: "medium" });
      toast({
        title: "Support Ticket Created",
        description: "Your support request has been submitted successfully.",
      });
    }
  });

  // Filter content based on search
  const filteredFAQ = faqData.filter((item: FAQItem) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocs = docsData.filter((doc: DocumentationPage) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = () => {
    if (!ticketForm.title || !ticketForm.description || !ticketForm.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    createTicketMutation.mutate(ticketForm);
  };

  const getRoleSpecificContent = () => {
    const roleContent = {
      doctor: {
        quickHelp: [
          { title: "Patient Queue", desc: "Managing patient flow and triage" },
          { title: "ICD-10 Codes", desc: "AI-assisted diagnosis coding" },
          { title: "Prescriptions", desc: "Electronic prescription workflow" }
        ],
        categories: ["clinical", "diagnosis", "prescriptions", "claims"]
      },
      pharmacist: {
        quickHelp: [
          { title: "Drug Verification", desc: "Prescription validation process" },
          { title: "Benefit Checks", desc: "Insurance coverage verification" },
          { title: "Dispensing", desc: "Medication dispensing workflow" }
        ],
        categories: ["dispensing", "verification", "benefits", "inventory"]
      },
      "care-manager": {
        quickHelp: [
          { title: "Fraud Detection", desc: "AI-powered pattern analysis" },
          { title: "Analytics", desc: "Claims performance metrics" },
          { title: "Provider Management", desc: "Network oversight tools" }
        ],
        categories: ["analytics", "fraud", "providers", "performance"]
      },
      insurer: {
        quickHelp: [
          { title: "Claim Appeals", desc: "Appeal processing workflow" },
          { title: "Preauthorization", desc: "AI-assisted approval decisions" },
          { title: "Risk Assessment", desc: "Claims risk analysis" }
        ],
        categories: ["appeals", "preauth", "risk", "claims"]
      },
      patient: {
        quickHelp: [
          { title: "Benefits", desc: "Understanding your coverage" },
          { title: "Claims History", desc: "Viewing your claim status" },
          { title: "Dependents", desc: "Managing family members" }
        ],
        categories: ["benefits", "claims", "dependents", "billing"]
      },
      admin: {
        quickHelp: [
          { title: "User Management", desc: "Adding and managing users" },
          { title: "System Config", desc: "Platform configuration" },
          { title: "Analytics", desc: "System performance metrics" }
        ],
        categories: ["users", "configuration", "analytics", "security"]
      }
    };

    return roleContent[userRole as keyof typeof roleContent] || roleContent.patient;
  };

  const roleContent = getRoleSpecificContent();

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg bg-teal-600 hover:bg-teal-700 text-white border-0 z-50"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-teal-600" />
              Erlessed Support Center
            </DialogTitle>
            <DialogDescription>
              Get help with your healthcare platform tasks
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs defaultValue="quick-help" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="quick-help">Quick Help</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="guides">Guides</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
              </TabsList>

              <TabsContent value="quick-help" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roleContent.quickHelp.map((item, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-gray-600">{item.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Popular Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {roleContent.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="cursor-pointer">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="space-y-4 max-h-96 overflow-y-auto">
                {filteredFAQ.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No FAQ items found.</p>
                ) : (
                  filteredFAQ.map((faq: FAQItem) => (
                    <Card key={faq.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          {faq.question}
                          <Badge variant="outline" className="text-xs">
                            {faq.category}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="text-sm text-gray-600 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br />') }}
                        />
                        <div className="flex items-center justify-between mt-3 pt-2 border-t">
                          <span className="text-xs text-gray-400">
                            {faq.helpful_count} people found this helpful
                          </span>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Helpful?
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="guides" className="space-y-4 max-h-96 overflow-y-auto">
                {filteredDocs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No guides found.</p>
                ) : (
                  filteredDocs.map((doc: DocumentationPage) => (
                    <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          {doc.title}
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {doc.category}
                            </Badge>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-gray-600 line-clamp-3">
                          {doc.content.substring(0, 150)}...
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="support" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Create Support Ticket
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Get personalized help from our support team
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!showTicketForm ? (
                        <Button 
                          onClick={() => setShowTicketForm(true)}
                          className="w-full"
                          size="sm"
                        >
                          New Ticket
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Title</Label>
                            <Input
                              placeholder="Brief description of your issue"
                              value={ticketForm.title}
                              onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Category</Label>
                            <Select onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technical">Technical Issue</SelectItem>
                                <SelectItem value="billing">Billing</SelectItem>
                                <SelectItem value="training">Training</SelectItem>
                                <SelectItem value="feature">Feature Request</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Priority</Label>
                            <Select onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value as any }))}>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              placeholder="Detailed description of your issue"
                              value={ticketForm.description}
                              onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                              className="text-sm min-h-20"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleSubmitTicket}
                              disabled={createTicketMutation.isPending}
                              size="sm"
                              className="flex-1"
                            >
                              {createTicketMutation.isPending ? "Submitting..." : "Submit"}
                            </Button>
                            <Button 
                              onClick={() => setShowTicketForm(false)}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Your Recent Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ticketsData.length === 0 ? (
                        <p className="text-xs text-gray-500">No tickets yet</p>
                      ) : (
                        <div className="space-y-2">
                          {ticketsData.slice(0, 3).map((ticket: SupportTicket) => (
                            <div key={ticket.id} className="flex items-center justify-between p-2 border rounded text-xs">
                              <div className="flex-1">
                                <p className="font-medium line-clamp-1">{ticket.title}</p>
                                <p className="text-gray-500">{ticket.category}</p>
                              </div>
                              <Badge 
                                variant={ticket.status === 'resolved' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {ticket.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}