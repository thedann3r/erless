import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsPrognosisDashboard } from "@/components/analytics-prognosis-dashboard";
import { CostComparisonDashboard } from "@/components/cost-comparison-dashboard";
import { Brain, BarChart3, TrendingUp, Users, Activity, Shield } from "lucide-react";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("prognosis");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Healthcare Analytics</h1>
          <p className="text-gray-600">Comprehensive analytics, prognosis modeling, and outcome tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-purple-600 border-purple-200">
            <Brain className="w-4 h-4 mr-1" />
            AI-Powered Insights
          </Badge>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Models Active</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Predictions Made</p>
                <p className="text-2xl font-bold text-gray-900">2,847</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                <p className="text-2xl font-bold text-gray-900">89.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-teal-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Patients Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prognosis">Prognosis & Outcome Analytics</TabsTrigger>
          <TabsTrigger value="cost-analysis">Cost Comparison Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="prognosis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                Advanced Prognosis Modeling & Outcome Tracking
              </CardTitle>
              <CardDescription>
                AI-powered predictive analytics with comprehensive patient outcome monitoring and population health trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsPrognosisDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Real-Time Cost Comparison & Provider Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive cost benchmarking, provider performance analysis, and optimization insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CostComparisonDashboard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8">
        Powered by Aboolean
      </div>
    </div>
  );
}