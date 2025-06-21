import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authenticatedFetch } from "@/lib/auth";
import { Search, Filter, Download, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function Transactions() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { className: "status-completed", label: "Completed" },
      pending: { className: "status-pending", label: "Pending" },
      failed: { className: "status-rejected", label: "Failed" },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const getTransactionIcon = (type: string) => {
    const iconConfig = {
      "EMI Payment": { icon: ArrowUpRight, color: "text-red-500" },
      "Bill Payment": { icon: ArrowUpRight, color: "text-orange-500" },
      "Loan Disbursal": { icon: ArrowDownRight, color: "text-green-500" },
      "Processing Fee": { icon: ArrowUpRight, color: "text-blue-500" },
    };
    
    return iconConfig[type as keyof typeof iconConfig] || { icon: CreditCard, color: "text-gray-500" };
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    const matchesSearch = transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    
    // Date filtering
    const transactionDate = new Date(transaction.createdAt);
    const now = new Date();
    const daysAgo = parseInt(dateRange);
    const filterDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const matchesDate = transactionDate >= filterDate;
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Calculate summary statistics
  const totalAmount = filteredTransactions.reduce((sum, t: Transaction) => sum + parseFloat(t.amount), 0);
  const completedTransactions = filteredTransactions.filter((t: Transaction) => t.status === "completed");
  const pendingTransactions = filteredTransactions.filter((t: Transaction) => t.status === "pending");

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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Transactions
                    </CardTitle>
                    <p className="text-gray-600">
                      View and manage all your financial transactions
                    </p>
                  </div>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="professional-card">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {filteredTransactions.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Transactions</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      ₹{totalAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {completedTransactions.length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {pendingTransactions.length}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="professional-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by transaction ID or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="EMI Payment">EMI Payment</SelectItem>
                      <SelectItem value="Bill Payment">Bill Payment</SelectItem>
                      <SelectItem value="Loan Disbursal">Loan Disbursal</SelectItem>
                      <SelectItem value="Processing Fee">Processing Fee</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 Days</SelectItem>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="90">Last 3 Months</SelectItem>
                      <SelectItem value="365">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card className="professional-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Transaction History</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {filteredTransactions.length} of {transactions.length} transactions
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                    <p className="text-gray-600">
                      {searchTerm || filterType !== "all" || filterStatus !== "all"
                        ? "Try adjusting your filters to see more transactions."
                        : "Your transactions will appear here once you start using Loanlytic services."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Method
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map((transaction: Transaction) => {
                          const statusConfig = getStatusBadge(transaction.status || 'pending');
                          const iconConfig = getTransactionIcon(transaction.type);
                          const Icon = iconConfig.icon;
                          
                          return (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ${iconConfig.color}`}>
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {transaction.transactionId}
                                    </div>
                                    {transaction.description && (
                                      <div className="text-sm text-gray-500">
                                        {transaction.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className={transaction.type.includes('Disbursal') ? 'text-green-600 font-medium' : 'text-gray-900'}>
                                  {transaction.type.includes('Disbursal') ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={statusConfig.className}>
                                  {statusConfig.label}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.paymentMethod || 'N/A'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
