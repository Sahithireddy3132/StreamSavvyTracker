import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface CreditUtilizationWidgetProps {
  totalCredit: number;
  usedCredit: number;
}

export default function CreditUtilizationWidget({ 
  totalCredit = 75000, 
  usedCredit = 40000 
}: CreditUtilizationWidgetProps) {
  const utilizationPercentage = (usedCredit / totalCredit) * 100;
  const availableCredit = totalCredit - usedCredit;
  
  // Calculate stroke-dashoffset for the progress circle
  const circumference = 2 * Math.PI * 80; // radius = 80
  const strokeDashoffset = circumference - (utilizationPercentage / 100) * circumference;

  return (
    <Card className="professional-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          Credit Utilization Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="relative w-64 h-64 mb-6 md:mb-0">
            <svg className="w-64 h-64 circle-progress" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="#E5E7EB"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="#3B82F6"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {utilizationPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Utilized</div>
              </div>
            </div>
          </div>

          <div className="flex-1 md:ml-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Credit Limit</span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{totalCredit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Used Credit</span>
                <span className="text-xl font-bold text-primary">
                  ₹{usedCredit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Credit</span>
                <span className="text-xl font-bold text-green-600">
                  ₹{availableCredit.toLocaleString()}
                </span>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="text-yellow-500 mt-1 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Pro Tip</p>
                    <p className="text-sm text-yellow-700">
                      Keeping utilization under 30% helps improve loan approval rates and credit score.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
