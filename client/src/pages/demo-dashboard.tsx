import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Stethoscope, 
  Pill, 
  Shield, 
  Building2, 
  User, 
  Settings,
  ArrowRight,
  CheckCircle
} from "lucide-react";

interface RoleCard {
  title: string;
  role: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  features: string[];
  badgeColor: string;
}

export default function DemoDashboard() {
  const roles: RoleCard[] = [
    {
      title: "Doctor/Clinician",
      role: "Clinical Workflow",
      description: "Streamlined patient consultation and medical documentation",
      icon: <Stethoscope className="w-8 h-8" />,
      route: "/doctor",
      features: [
        "Patient queue with triage vitals",
        "AI-powered ICD-10 code suggestions",
        "Smart prescription builder with safety checks",
        "Lab order forms with preauthorization",
        "Digital consultation records"
      ],
      badgeColor: "bg-blue-100 text-blue-800"
    },
    {
      title: "Pharmacist",
      role: "Medication Management",
      description: "Comprehensive prescription validation and benefit tracking",
      icon: <Pill className="w-8 h-8" />,
      route: "/pharmacy-dashboard",
      features: [
        "Drug interaction and allergy checking",
        "Real-time benefit utilization tracking",
        "Automated copay calculations",
        "Preauthorization validation",
        "Inventory and dispensing records"
      ],
      badgeColor: "bg-green-100 text-green-800"
    },
    {
      title: "Care Manager",
      role: "Network Oversight",
      description: "Monitor claims, detect fraud, and analyze provider performance",
      icon: <Shield className="w-8 h-8" />,
      route: "/care-manager-dashboard",
      features: [
        "Cross-network claims monitoring",
        "AI-powered fraud detection",
        "Provider performance analytics",
        "Cost benchmarking tools",
        "Referral success tracking"
      ],
      badgeColor: "bg-purple-100 text-purple-800"
    },
    {
      title: "Insurance Underwriter",
      role: "Claims Authorization",
      description: "AI-assisted preauthorization and scheme management",
      icon: <Building2 className="w-8 h-8" />,
      route: "/insurer",
      features: [
        "AI-assisted preauthorization decisions",
        "Real-time claims inflow monitoring",
        "Scheme usage and burnout tracking",
        "Appeals management workflow",
        "Automated approval thresholds"
      ],
      badgeColor: "bg-red-100 text-red-800"
    },
    {
      title: "Patient/Member",
      role: "Personal Health Management",
      description: "Transparent access to claims, benefits, and family coverage",
      icon: <User className="w-8 h-8" />,
      route: "/patient",
      features: [
        "Complete claims history with appeals",
        "Family dependent management",
        "Benefit utilization tracking",
        "Preauthorized services status",
        "Cost estimates by service type"
      ],
      badgeColor: "bg-yellow-100 text-yellow-800"
    },
    {
      title: "System Administrator",
      role: "Platform Management",
      description: "Comprehensive system configuration and user management",
      icon: <Settings className="w-8 h-8" />,
      route: "/admin",
      features: [
        "User and provider management",
        "AI feature configuration",
        "System performance monitoring",
        "Professional license validation",
        "Platform analytics and reporting"
      ],
      badgeColor: "bg-gray-100 text-gray-800"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="text-white text-2xl font-bold">E</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Erlessed Healthcare Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive role-based dashboards for modern healthcare claims processing, 
            featuring AI-powered preauthorization, biometric verification, and blockchain anchoring
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="outline" className="text-teal-600 border-teal-200 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              AI-Powered Decisions
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-200 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Real-time Processing
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-200 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Fraud Detection
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-200 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Blockchain Security
            </Badge>
          </div>
        </div>

        {/* Role-based Dashboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {roles.map((role, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-teal-600">
                    {role.icon}
                  </div>
                  <Badge className={role.badgeColor}>
                    {role.role}
                  </Badge>
                </div>
                <CardTitle className="text-xl mb-2">{role.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  {role.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={role.route}>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 group-hover:shadow-md transition-all">
                    Explore Dashboard
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Features Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Platform Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Clinical Workflow</h3>
              <p className="text-gray-600 text-sm">
                Streamlined patient consultations with AI-powered diagnosis coding and prescription management
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Decision Engine</h3>
              <p className="text-gray-600 text-sm">
                Intelligent preauthorization with confidence scoring and transparent reasoning chains
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Network Analytics</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive provider performance monitoring and cost benchmarking across networks
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Patient Transparency</h3>
              <p className="text-gray-600 text-sm">
                Complete visibility into claims, benefits, and family coverage with self-service appeals
              </p>
            </div>
          </div>
        </div>

        {/* System Architecture */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-3xl font-bold text-center mb-8">
            Enterprise Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="font-semibold text-xl mb-4">Frontend</h3>
              <div className="space-y-2 text-teal-100">
                <div>React 18 + TypeScript</div>
                <div>Tailwind CSS + shadcn/ui</div>
                <div>TanStack Query</div>
                <div>Wouter Routing</div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-xl mb-4">Backend</h3>
              <div className="space-y-2 text-blue-100">
                <div>Node.js + Express</div>
                <div>PostgreSQL + Drizzle ORM</div>
                <div>Passport.js Authentication</div>
                <div>OpenAI Integration</div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-xl mb-4">Features</h3>
              <div className="space-y-2 text-indigo-100">
                <div>AI-Powered Preauthorization</div>
                <div>Fraud Pattern Detection</div>
                <div>Biometric Verification</div>
                <div>Blockchain Anchoring</div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Access */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Explore?
          </h2>
          <p className="text-gray-600 mb-6">
            Click on any dashboard above to experience the role-specific workflows and AI-powered features
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/secure-auth">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                Secure Registration
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline">
                Quick Demo Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-16">
          Powered by Aboolean
        </div>
      </div>
    </div>
  );
}