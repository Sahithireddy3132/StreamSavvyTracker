import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authenticatedFetch } from "@/lib/auth";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Target,
  Award,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import type { Transaction, Loan, UtilityBill } from "@shared/schema";

export default function Analytics() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });

  const { data: loans = [] } = useQuery({
    queryKey: ["/api/loans"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/loans");
      if (!response.ok) throw new Error("Failed to fetch loans");
      return response.json();
    },
  });

  const { data: bills = [] } = useQuery({
    queryKey: ["/api/utility-bills"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/utility-bills");
      if (!response.ok) throw new Error("Failed to fetch bills");
      return response.json();
    },
  });

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

  // Calculate analytics data
  const creditLimit = parseFloat(user.creditLimit || "75000");
  const usedCredit = parseFloat(user.usedCredit || "40000");
  const utilizationPercentage = (usedCredit / creditLimit) * 100;

  // Transaction analytics
  const totalTransactionAmount = transactions.reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0);
  const completedTransactions = transactions.filter((t: Transaction) => t.status === "completed");
  const monthlyTransactions = transactions.reduce((acc: any, transaction: Transaction) => {
    const month = new Date(transaction.createdAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + parseFloat(transaction.amount);
    return acc;
  }, {});

  const transactionChartData = Object.entries(monthlyTransactions).map(([month, amount]) => ({
    month,
    amount: amount as number,
  }));

  // Transaction type distribution
  const transactionTypes = transactions.reduce((acc: any, transaction: Transaction) => {
    acc[transaction.type] = (acc[transaction.type] || 0) + parseFloat(transaction.amount);
    return acc;
  }, {});

  const typeChartData = Object.entries(transactionTypes).map(([type, amount]) => ({
    type,
    amount: amount as number,
  }));

  // Loan analytics
  const approvedLoans = loans.filter((loan: Loan) => loan.status === 'approved' || loan.status === 'disbursed');
  const totalSanctioned = approvedLoans.reduce((sum: number, loan: Loan) => sum + parseFloat(loan.sanctionedAmount || '0'), 0);
  const averageApprovalScore = loans.length > 0 ? 
    loans.reduce((sum: number, loan: Loan) => sum + (loan.approvalScore || 0), 0) / loans.length : 0;

  // Bill analytics
  const totalBillAmount = bills.reduce((sum: number, bill: UtilityBill) => sum + parseFloat(bill.amount), 0);
  const paidBills = bills.filter((bill: UtilityBill) => bill.paymentStatus === 'paid');
  const billTypes = bills.reduce((acc: any, bill: UtilityBill) => {
    acc[bill.billType] = (acc[bill.billType] || 0) + parseFloat(bill.amount);
    return acc;
  }, {});

  const billChartData = Object.entries(billTypes).map(([type, amount]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    amount: amount as number,
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Credit utilization trend (mock data for demonstration)
  const creditTrendData = [
    { month: 'Jan', utilization: 45 },
    { month: 'Feb', utilization: 52 },
    { month: 'Mar', utilization: 48 },
    { month: 'Apr', utilization: 55 },
    { month: 'May', utilization: 53 },
    { month: 'Jun', utilization: utilizationPercentage },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 p-6">
          <div className="space-y-6">
            
            {/* Header */}
            <Card className="professional-card">
              <CardHeader className="professional-card-header">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Financial Analytics
                </CardTitle>
                <p className="text-gray-600">
                  Comprehensive insights into your financial health and loan management
                </p>
              </CardHeader>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="professional-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Credit Utilization</p>
                      <p className="text-2xl font-bold text-gray-900">{utilizationPercentage.toFixed(1)}%</p>
                      <div className="flex items-center mt-1">
                        {utilizationPercentage > 30 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600 ml-1">Above recommended</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 ml-1">Healthy</span>
                          </>
                        )}
                      </div>
                    </div>
                    <CreditCard className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Credit Score</p>
                      <p className="text-2xl font-bold text-gray-900">{user.creditScore}</p>
                      <div className="flex items-center mt-1">
                        <Award className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 ml-1">Excellent</span>
                      </div>
                    </div>
                    <Target className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sanctioned</p>
                      <p className="text-2xl font-bold text-gray-900">₹{totalSanctioned.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-600">{approvedLoans.length} active loans</span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Approval Score</p>
                      <p className="text-2xl font-bold text-gray-900">{averageApprovalScore.toFixed(0)}%</p>
                      <div className="flex items-center mt-1">
                        {averageApprovalScore >= 70 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 ml-1">Strong profile</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600 ml-1">Needs improvement</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Award className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Credit Utilization Trend */}
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle>Credit Utilization Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={creditTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                        <Area 
                          type="monotone" 
                          dataKey="utilization" 
                          stroke="#3B82F6" 
                          fill="#3B82F6" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Volume */}
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle>Monthly Transaction Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {transactionChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={transactionChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                          <Bar dataKey="amount" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>No transaction data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transaction Types Distribution */}
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle>Transaction Types Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {typeChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={typeChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="amount"
                          >
                            {typeChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>No transaction type data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Utility Bills Breakdown */}
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle>Utility Bills Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {billChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={billChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                          <Bar dataKey="amount" fill="#F59E0B" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>No utility bill data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Health Insights */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Financial Health Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Credit Management</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Credit Utilization</span>
                        <Badge className={utilizationPercentage <= 30 ? "status-completed" : "status-pending"}>
                          {utilizationPercentage <= 30 ? "Excellent" : "Needs Attention"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Payment History</span>
                        <Badge className="status-completed">Perfect</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Credit Score</span>
                        <Badge className="status-completed">Excellent</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Loan Portfolio</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Active Loans</span>
                        <span className="font-medium">{approvedLoans.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Sanctioned</span>
                        <span className="font-medium">₹{totalSanctioned.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Avg. Approval Rate</span>
                        <span className="font-medium">{averageApprovalScore.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Bill Management</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Bills</span>
                        <span className="font-medium">{bills.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Paid Bills</span>
                        <span className="font-medium">{paidBills.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Monthly Average</span>
                        <span className="font-medium">₹{bills.length > 0 ? Math.round(totalBillAmount / bills.length).toLocaleString() : '0'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
