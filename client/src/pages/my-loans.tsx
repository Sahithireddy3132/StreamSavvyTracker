import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authenticatedFetch } from "@/lib/auth";
import { FileText, IndianRupee, Calendar, Eye } from "lucide-react";
import type { Loan } from "@shared/schema";

export default function MyLoans() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const { data: loans = [], isLoading: loansLoading } = useQuery({
    queryKey: ["/api/loans"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/loans");
      if (!response.ok) throw new Error("Failed to fetch loans");
      return response.json();
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { className: "status-approved", label: "Approved" },
      pending: { className: "status-pending", label: "Pending" },
      rejected: { className: "status-rejected", label: "Rejected" },
      disbursed: { className: "status-completed", label: "Disbursed" },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

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
            
            <Card className="professional-card">
              <CardHeader className="professional-card-header">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  My Loans
                </CardTitle>
                <p className="text-gray-600">
                  View and manage all your loan applications and active loans.
                </p>
              </CardHeader>
            </Card>

            {loansLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="professional-card">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : loans.length === 0 ? (
              <Card className="professional-card">
                <CardContent className="p-12">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Loans Found</h3>
                    <p className="text-gray-600 mb-6">
                      You haven't applied for any loans yet. Start your loan application to see it here.
                    </p>
                    <Button 
                      className="btn-primary"
                      onClick={() => navigate("/apply-loan")}
                    >
                      Apply for Loan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loans.map((loan: Loan) => {
                  const statusConfig = getStatusBadge(loan.status || 'pending');
                  const isApproved = loan.status === 'approved' || loan.status === 'disbursed';
                  
                  return (
                    <Card key={loan.id} className="professional-card hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              Loan Application
                            </h3>
                            <p className="text-sm text-gray-600">
                              ID: {loan.applicationId}
                            </p>
                          </div>
                          <Badge className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <IndianRupee className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Requested Amount</span>
                            </div>
                            <span className="font-medium">
                              ₹{parseFloat(loan.requestedAmount).toLocaleString()}
                            </span>
                          </div>

                          {isApproved && loan.sanctionedAmount && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <IndianRupee className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-600">Sanctioned Amount</span>
                              </div>
                              <span className="font-medium text-green-600">
                                ₹{parseFloat(loan.sanctionedAmount).toLocaleString()}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Tenure</span>
                            </div>
                            <span className="font-medium">
                              {loan.tenure} months
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Interest Rate</span>
                            <span className="font-medium">
                              {loan.interestRate}% p.a.
                            </span>
                          </div>

                          {isApproved && loan.monthlyEmi && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Monthly EMI</span>
                              <span className="font-medium text-primary">
                                ₹{parseFloat(loan.monthlyEmi).toLocaleString()}
                              </span>
                            </div>
                          )}

                          {loan.approvalScore && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Approval Score</span>
                              <span className="font-medium">
                                {loan.approvalScore}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <span className="text-xs text-gray-500">
                            Applied: {new Date(loan.appliedAt).toLocaleDateString()}
                          </span>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Summary Stats */}
            {loans.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="professional-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {loans.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Applications</div>
                  </CardContent>
                </Card>

                <Card className="professional-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {loans.filter((loan: Loan) => loan.status === 'approved' || loan.status === 'disbursed').length}
                    </div>
                    <div className="text-sm text-gray-600">Approved Loans</div>
                  </CardContent>
                </Card>

                <Card className="professional-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-primary">
                      ₹{loans
                        .filter((loan: Loan) => loan.status === 'approved' || loan.status === 'disbursed')
                        .reduce((total, loan: Loan) => total + parseFloat(loan.sanctionedAmount || '0'), 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Sanctioned</div>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
