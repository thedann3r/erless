import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2, 
  Users, 
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  Target
} from "lucide-react";

interface CostMetrics {
  totalCosts: number;
  avgCostPerClaim: number;
  costTrend: number;
  topCostDrivers: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

interface ProviderComparison {
  providerId: string;
  providerName: string;
  providerType: string;
  totalClaims: number;
  totalCosts: number;
  avgCostPerClaim: number;
  costEfficiencyRank: number;
  specialtyFocus: string;
  qualityScore: number;
  patientSatisfaction: number;
}

interface ServiceComparison {
  serviceCode: string;
  serviceName: string;
  category: string;
  minCost: number;
  maxCost: number;
  avgCost: number;
  medianCost: number;
  standardDeviation: number;
  providerCount: number;
  claimVolume: number;
}

interface RegionalData {
  region: string;
  avgCost: number;
  claimVolume: number;
  providerCount: number;
  costTrend: number;
}

export function CostComparisonDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("last_30_days");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [comparisonView, setComparisonView] = useState("providers");

  // Fetch cost metrics
  const { data: costMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/analytics/cost-metrics", selectedTimeRange, selectedCategory, selectedRegion],
    queryFn: async () => ({
      totalCosts: 2847500,
      avgCostPerClaim: 3250,
      costTrend: -8.5,
      topCostDrivers: [
        { category: "Inpatient Care", amount: 1420000, percentage: 49.9 },
        { category: "Specialist Consultations", amount: 568000, percentage: 19.9 },
        { category: "Diagnostic Imaging", amount: 341000, percentage: 12.0 },
        { category: "Laboratory Tests", amount: 284000, percentage: 10.0 },
        { category: "Emergency Services", amount: 234500, percentage: 8.2 }
      ]
    } as CostMetrics),
  });

  // Fetch provider comparison data
  const { data: providerComparisons, isLoading: providersLoading } = useQuery({
    queryKey: ["/api/analytics/provider-comparison", selectedTimeRange, selectedCategory],
    queryFn: async () => [
      {
        providerId: "P001",
        providerName: "Kenyatta National Hospital",
        providerType: "Public Hospital",
        totalClaims: 1250,
        totalCosts: 4875000,
        avgCostPerClaim: 3900,
        costEfficiencyRank: 3,
        specialtyFocus: "General Medicine",
        qualityScore: 87,
        patientSatisfaction: 78
      },
      {
        providerId: "P002",
        providerName: "Aga Khan University Hospital",
        providerType: "Private Hospital",
        totalClaims: 890,
        totalCosts: 3560000,
        avgCostPerClaim: 4000,
        costEfficiencyRank: 4,
        specialtyFocus: "Specialist Care",
        qualityScore: 94,
        patientSatisfaction: 92
      },
      {
        providerId: "P003",
        providerName: "Nairobi Hospital",
        providerType: "Private Hospital",
        totalClaims: 756,
        totalCosts: 2268000,
        avgCostPerClaim: 3000,
        costEfficiencyRank: 1,
        specialtyFocus: "Cardiology",
        qualityScore: 91,
        patientSatisfaction: 89
      },
      {
        providerId: "P004",
        providerName: "MP Shah Hospital",
        providerType: "Private Hospital",
        totalClaims: 623,
        totalCosts: 2180500,
        avgCostPerClaim: 3500,
        costEfficiencyRank: 2,
        specialtyFocus: "Maternity Care",
        qualityScore: 88,
        patientSatisfaction: 85
      },
      {
        providerId: "P005",
        providerName: "Mater Hospital",
        providerType: "Private Hospital",
        totalClaims: 445,
        totalCosts: 1780000,
        avgCostPerClaim: 4000,
        costEfficiencyRank: 5,
        specialtyFocus: "Pediatrics",
        qualityScore: 90,
        patientSatisfaction: 87
      }
    ] as ProviderComparison[],
  });

  // Fetch service comparison data
  const { data: serviceComparisons, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/analytics/service-comparison", selectedTimeRange],
    queryFn: async () => [
      {
        serviceCode: "99213",
        serviceName: "Office Visit - Established Patient",
        category: "Primary Care",
        minCost: 1500,
        maxCost: 4500,
        avgCost: 2750,
        medianCost: 2600,
        standardDeviation: 650,
        providerCount: 45,
        claimVolume: 2340
      },
      {
        serviceCode: "99285",
        serviceName: "Emergency Department Visit - High Complexity",
        category: "Emergency Care",
        minCost: 8000,
        maxCost: 25000,
        avgCost: 15500,
        medianCost: 14000,
        standardDeviation: 4200,
        providerCount: 12,
        claimVolume: 567
      },
      {
        serviceCode: "73030",
        serviceName: "X-Ray Shoulder",
        category: "Diagnostic Imaging",
        minCost: 2500,
        maxCost: 8000,
        avgCost: 4250,
        medianCost: 4000,
        standardDeviation: 1100,
        providerCount: 28,
        claimVolume: 890
      },
      {
        serviceCode: "80053",
        serviceName: "Comprehensive Metabolic Panel",
        category: "Laboratory",
        minCost: 800,
        maxCost: 2500,
        avgCost: 1400,
        medianCost: 1300,
        standardDeviation: 380,
        providerCount: 35,
        claimVolume: 1560
      }
    ] as ServiceComparison[],
  });

  // Fetch regional data
  const { data: regionalData, isLoading: regionalLoading } = useQuery({
    queryKey: ["/api/analytics/regional-costs", selectedTimeRange],
    queryFn: async () => [
      { region: "Nairobi", avgCost: 3800, claimVolume: 4567, providerCount: 45, costTrend: -5.2 },
      { region: "Mombasa", avgCost: 3200, claimVolume: 2890, providerCount: 28, costTrend: 2.1 },
      { region: "Kisumu", avgCost: 2850, claimVolume: 1780, providerCount: 18, costTrend: -1.8 },
      { region: "Nakuru", avgCost: 2950, claimVolume: 1456, providerCount: 15, costTrend: 1.5 },
      { region: "Eldoret", avgCost: 2700, claimVolume: 1234, providerCount: 12, costTrend: -3.1 }
    ] as RegionalData[],
  });

  const getCostTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    }
    return <div className="w-4 h-4" />;
  };

  const getCostTrendColor = (trend: number) => {
    if (trend > 5) return "text-red-600";
    if (trend > 0) return "text-yellow-600";
    if (trend < -5) return "text-green-600";
    return "text-green-500";
  };

  const getEfficiencyBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-green-100 text-green-800">Most Efficient</Badge>;
    if (rank <= 3) return <Badge className="bg-blue-100 text-blue-800">Efficient</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const costTrendData = [
    { month: 'Jan', cost: 3200, claims: 850 },
    { month: 'Feb', cost: 3400, claims: 920 },
    { month: 'Mar', cost: 3100, claims: 780 },
    { month: 'Apr', cost: 3350, claims: 890 },
    { month: 'May', cost: 3250, claims: 850 },
    { month: 'Jun', cost: 3180, claims: 800 }
  ];

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cost Comparison Analytics</h2>
          <p className="text-gray-600">Real-time cost analysis and provider benchmarking</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="timeRange">Time Range</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Service Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="primary_care">Primary Care</SelectItem>
                  <SelectItem value="specialist_care">Specialist Care</SelectItem>
                  <SelectItem value="emergency">Emergency Care</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="region">Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="nairobi">Nairobi</SelectItem>
                  <SelectItem value="mombasa">Mombasa</SelectItem>
                  <SelectItem value="kisumu">Kisumu</SelectItem>
                  <SelectItem value="nakuru">Nakuru</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="comparison">Comparison View</Label>
              <Select value={comparisonView} onValueChange={setComparisonView}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="providers">Provider Comparison</SelectItem>
                  <SelectItem value="services">Service Comparison</SelectItem>
                  <SelectItem value="regional">Regional Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Costs</p>
                <p className="text-2xl font-bold">
                  KES {costMetrics?.totalCosts?.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              {getCostTrendIcon(costMetrics?.costTrend || 0)}
              <span className={`text-sm ml-1 ${getCostTrendColor(costMetrics?.costTrend || 0)}`}>
                {Math.abs(costMetrics?.costTrend || 0)}% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Cost/Claim</p>
                <p className="text-2xl font-bold">
                  KES {costMetrics?.avgCostPerClaim?.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">Across all providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cost Efficiency</p>
                <p className="text-2xl font-bold text-green-600">Good</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">8.5% below benchmark</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  KES 285K
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">Through optimization</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={comparisonView} onValueChange={setComparisonView}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">Provider Comparison</TabsTrigger>
          <TabsTrigger value="services">Service Analysis</TabsTrigger>
          <TabsTrigger value="regional">Regional Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Trends Analysis</CardTitle>
                <CardDescription>Average cost per claim over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={costTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cost" stroke="#0ea5e9" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Drivers Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Cost Drivers</CardTitle>
                <CardDescription>Distribution of costs by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costMetrics?.topCostDrivers}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {costMetrics?.topCostDrivers?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Provider Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Provider Performance Comparison</CardTitle>
              <CardDescription>Detailed cost efficiency and quality metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerComparisons?.map((provider) => (
                  <Card key={provider.providerId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{provider.providerName}</h3>
                          <p className="text-sm text-gray-600">{provider.providerType} • {provider.specialtyFocus}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getEfficiencyBadge(provider.costEfficiencyRank)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Claims</p>
                        <p className="text-lg font-semibold">{provider.totalClaims.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Costs</p>
                        <p className="text-lg font-semibold">KES {provider.totalCosts.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Cost/Claim</p>
                        <p className="text-lg font-semibold">KES {provider.avgCostPerClaim.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Quality Score</p>
                        <p className="text-lg font-semibold text-green-600">{provider.qualityScore}/100</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Patient Satisfaction</p>
                        <p className="text-lg font-semibold text-blue-600">{provider.patientSatisfaction}%</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Cost Analysis</CardTitle>
              <CardDescription>Cost variation analysis across common procedures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceComparisons?.map((service) => (
                  <Card key={service.serviceCode} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{service.serviceName}</h3>
                        <p className="text-sm text-gray-600">Code: {service.serviceCode} • {service.category}</p>
                      </div>
                      <Badge variant="outline">{service.providerCount} providers</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Min Cost</p>
                        <p className="text-lg font-semibold text-green-600">KES {service.minCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Max Cost</p>
                        <p className="text-lg font-semibold text-red-600">KES {service.maxCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Average</p>
                        <p className="text-lg font-semibold">KES {service.avgCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Median</p>
                        <p className="text-lg font-semibold">KES {service.medianCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Std Dev</p>
                        <p className="text-lg font-semibold">±{service.standardDeviation}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Volume</p>
                        <p className="text-lg font-semibold">{service.claimVolume} claims</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full"
                          style={{ 
                            background: `linear-gradient(to right, 
                              #10b981 ${((service.avgCost - service.minCost) / (service.maxCost - service.minCost)) * 100}%, 
                              #f59e0b ${((service.avgCost - service.minCost) / (service.maxCost - service.minCost)) * 100}%)`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Most Affordable</span>
                        <span>Market Average</span>
                        <span>Premium</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regional Cost Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Cost Comparison</CardTitle>
                <CardDescription>Average cost per claim by region</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgCost" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Regional Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Summary</CardTitle>
                <CardDescription>Key metrics by region</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {regionalData?.map((region) => (
                  <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{region.region}</h3>
                      <p className="text-sm text-gray-600">{region.providerCount} providers</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">KES {region.avgCost.toLocaleString()}</p>
                      <div className="flex items-center">
                        {getCostTrendIcon(region.costTrend)}
                        <span className={`text-sm ml-1 ${getCostTrendColor(region.costTrend)}`}>
                          {Math.abs(region.costTrend)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}