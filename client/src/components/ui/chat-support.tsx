import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  isUser: boolean;
  agentName?: string;
  agentAvatar?: string;
}

interface ChatSupportProps {
  userRole: string;
  userName: string;
  className?: string;
}

export function ChatSupport({ userRole, userName, className = "" }: ChatSupportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentInfo, setAgentInfo] = useState({
    name: "Sarah",
    avatar: "",
    status: "online",
    responseTime: "Usually responds in 2-3 minutes"
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = () => {
    // Simulate connecting to support
    setTimeout(() => {
      setIsConnected(true);
      addMessage({
        id: "welcome",
        message: `Hi ${userName}! I'm ${agentInfo.name} from Erlessed Support. How can I help you today?`,
        timestamp: new Date(),
        isUser: false,
        agentName: agentInfo.name
      });
    }, 1500);

    // Add welcome message immediately
    addMessage({
      id: "connecting",
      message: "Connecting you to support...",
      timestamp: new Date(),
      isUser: false,
      agentName: "System"
    });
  };

  const addMessage = (msg: Omit<ChatMessage, "id"> & { id?: string }) => {
    const newMessage: ChatMessage = {
      id: msg.id || `msg-${Date.now()}-${Math.random()}`,
      ...msg
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!message.trim() || !isConnected) return;

    // Add user message
    addMessage({
      message: message.trim(),
      timestamp: new Date(),
      isUser: true
    });

    const userMessage = message.trim();
    setMessage("");

    // Simulate agent typing
    setIsTyping(true);

    // Generate contextual response based on message content
    setTimeout(() => {
      setIsTyping(false);
      const response = generateContextualResponse(userMessage, userRole);
      addMessage({
        message: response,
        timestamp: new Date(),
        isUser: false,
        agentName: agentInfo.name
      });
    }, 1500 + Math.random() * 2000);
  };

  const generateContextualResponse = (userMessage: string, role: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Role-specific responses
    const roleResponses = {
      doctor: {
        keywords: {
          "patient": "I can help you with patient management. Are you having issues with the patient queue, biometric verification, or clinical documentation?",
          "claim": "For claim-related issues, you can check the preauthorization status in the Claims section. Would you like me to guide you through the process?",
          "icd": "The ICD-10 code suggestions are powered by AI. If you're not seeing accurate suggestions, try being more specific with the diagnosis description.",
          "prescription": "The prescription module includes drug interaction checks and benefit validation. Are you experiencing issues with a specific medication?",
          "login": "If you're having login issues, try resetting your biometric authentication or contact your administrator for account verification."
        }
      },
      pharmacist: {
        keywords: {
          "verification": "The patient verification process includes biometric scanning and insurance eligibility checks. Which step is causing issues?",
          "drug": "Our drug interaction database is updated regularly. If you're seeing an interaction alert, please review the clinical notes before proceeding.",
          "benefit": "Benefit verification happens in real-time. If a patient's benefits appear incorrect, they may need to contact their insurer.",
          "dispensing": "The dispensing workflow includes safety checks and documentation. Are you stuck on a particular step?",
          "inventory": "Inventory management is handled through the pharmacy dashboard. You can track stock levels and set reorder alerts."
        }
      },
      insurer: {
        keywords: {
          "appeal": "The appeals process allows for clinical review and additional documentation. You can track appeal status in the Claims section.",
          "preauth": "Preauthorization decisions use AI analysis combined with clinical guidelines. You can review the decision reasoning in the claim details.",
          "risk": "Risk assessment tools help identify patterns and potential fraud. The analytics dashboard provides detailed insights.",
          "claim": "Claims processing is automated with AI review. High-risk claims are flagged for manual review before approval."
        }
      }
    };

    const currentRole = roleResponses[role as keyof typeof roleResponses];
    
    if (currentRole) {
      for (const [keyword, response] of Object.entries(currentRole.keywords)) {
        if (lowerMessage.includes(keyword)) {
          return response;
        }
      }
    }

    // Generic responses based on common keywords
    if (lowerMessage.includes("help") || lowerMessage.includes("how")) {
      return "I'm here to help! Can you tell me more about what specific task you're trying to accomplish? This will help me provide more targeted assistance.";
    }
    
    if (lowerMessage.includes("error") || lowerMessage.includes("problem")) {
      return "I understand you're experiencing an issue. Can you describe what error message you're seeing or what specific problem you're encountering?";
    }

    if (lowerMessage.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with today?";
    }

    // Default responses
    const defaultResponses = [
      "I understand your question. Let me help you with that. Can you provide a bit more detail about your specific situation?",
      "Thanks for reaching out! I'd be happy to assist you. Could you tell me more about what you're trying to accomplish?",
      "I see what you're asking about. To give you the most accurate help, could you share some additional context about your current workflow?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={className}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white border-0 z-40"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 h-96 shadow-xl z-50 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="pb-2 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={agentInfo.avatar} />
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    {agentInfo.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm font-medium">
                    {isConnected ? agentInfo.name : "Erlessed Support"}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-xs opacity-90">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    {isConnected ? 'Online' : 'Connecting...'}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-700 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {isConnected && (
              <div className="text-xs opacity-75 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {agentInfo.responseTime}
              </div>
            )}
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.isUser ? 'order-2' : 'order-1'}`}>
                  {!msg.isUser && msg.agentName && msg.agentName !== "System" && (
                    <div className="text-xs text-gray-500 mb-1">{msg.agentName}</div>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      msg.isUser
                        ? 'bg-blue-600 text-white'
                        : msg.agentName === "System"
                        ? 'bg-gray-100 text-gray-600 italic'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Message Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                ref={chatInputRef}
                placeholder={isConnected ? "Type your message..." : "Connecting..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isConnected}
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !isConnected}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Actions */}
            {isConnected && messages.length <= 2 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => setMessage("I need help with login issues")}
                >
                  Login Help
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => setMessage("How do I process a claim?")}
                >
                  Claim Process
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => setMessage("I found a bug")}
                >
                  Report Bug
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}