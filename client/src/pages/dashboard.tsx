import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import CreditUtilizationWidget from "@/components/credit-utilization-widget";
import BankSelection from "@/components/bank-selection";
import UtilityBillsUpload from "@/components/utility-bills-upload";
import LoanApprovalStatus from "@/components/loan-approval-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, IndianRupee, Calendar, Star } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const creditLimit = parseFloat(user.creditLimit || "75000");
  const usedCredit = parseFloat(user.usedCredit || "40000");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 p-6">
          <div className="space-y-6">
            
            {/* Welcome Section */}
            <div className="gradient-main text-white p-8 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome back, {user.firstName}!
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Your financial journey continues with Loanlytic
                  </p>
                </div>
                <div className="hidden md:block w-32 h-24 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-center">Financial<br/>Dashboard</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="professional-card border-l-4 border-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Loans</p>
                      <p className="text-2xl font-bold text-gray-900">2</p>
                    </div>
                    <FileText className="text-green-500 h-8 w-8" />
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card border-l-4 border-primary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Borrowed</p>
                      <p className="text-2xl font-bold text-gray-900">₹12,50,000</p>
                    </div>
                    <IndianRupee className="text-primary h-8 w-8" />
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card border-l-4 border-yellow-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Next EMI</p>
                      <p className="text-2xl font-bold text-gray-900">₹42,500</p>
                    </div>
                    <Calendar className="text-yellow-500 h-8 w-8" />
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card border-l-4 border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Credit Score</p>
                      <p className="text-2xl font-bold text-gray-900">{user.creditScore}</p>
                    </div>
                    <Star className="text-purple-500 h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Credit Utilization Widget */}
            <CreditUtilizationWidget 
              totalCredit={creditLimit} 
              usedCredit={usedCredit} 
            />

            {/* Bank Selection */}
            <BankSelection />

            {/* Utility Bills Upload */}
            <UtilityBillsUpload />

            {/* Loan Approval Status */}
            <LoanApprovalStatus />

          </div>
        </div>
      </div>
    </div>
  );
}
