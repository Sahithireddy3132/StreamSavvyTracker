import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authenticatedFetch } from "@/lib/auth";
import { CheckCircle, XCircle, RotateCcw, Download } from "lucide-react";
import type { Loan } from "@shared/schema";

export default function LoanApprovalStatus() {
  const { data: loans = [], isLoading } = useQuery({
    queryKey: ["/api/loans"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/loans");
      if (!response.ok) throw new Error("Failed to fetch loans");
      return response.json();
    },
  });

  // Get the most recent loan application
  const latestLoan = loans[0] as Loan | undefined;

  if (isLoading) {
    return (
      <Card className="professional-card">
        <CardHeader>
          <CardTitle>Loan Application Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-100 rounded-xl"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-gray-100 rounded"></div>
              <div className="h-24 bg-gray-100 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestLoan) {
    return (
      <Card className="professional-card">
        <CardHeader>
          <CardTitle>Loan Application Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No loan applications found. Apply for your first loan to see status here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isApproved = latestLoan.status === "approved";
  const isRejected = latestLoan.status === "rejected";
  const isPending = latestLoan.status === "pending";

  return (
    <Card className="professional-card">
      <CardHeader>
        <CardTitle>Loan Application Status</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Status Card */}
        <div className={`
          p-6 rounded-xl mb-6 border
          ${isApproved ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200" : ""}
          ${isRejected ? "bg-gradient-to-r from-red-50 to-red-100 border-red-200" : ""}
          ${isPending ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200" : ""}
        `}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`
                p-2 rounded-full
                ${isApproved ? "bg-green-500" : ""}
                ${isRejected ? "bg-red-500" : ""}
                ${isPending ? "bg-yellow-500" : ""}
              `}>
                {isApproved && <CheckCircle className="text-white h-5 w-5" />}
                {isRejected && <XCircle className="text-white h-5 w-5" />}
                {isPending && <RotateCcw className="text-white h-5 w-5" />}
              </div>
              <div>
                <h4 className={`
                  text-lg font-bold
                  ${isApproved ? "text-green-800" : ""}
                  ${isRejected ? "text-red-800" : ""}
                  ${isPending ? "text-yellow-800" : ""}
                `}>
                  {isApproved && "Loan Approved!"}
                  {isRejected && "Loan Rejected"}
                  {isPending && "Under Review"}
                </h4>
                <p className={`
                  ${isApproved ? "text-green-600" : ""}
                  ${isRejected ? "text-red-600" : ""}
                  ${isPending ? "text-yellow-600" : ""}
                `}>
                  Application ID: {latestLoan.applicationId}
                </p>
              </div>
            </div>
            {latestLoan.approvalScore && (
              <div className="text-right">
                <p className={`
                  text-3xl font-bold
                  ${isApproved ? "text-green-800" : ""}
                  ${isRejected ? "text-red-800" : ""}
                  ${isPending ? "text-yellow-800" : ""}
                `}>
                  {latestLoan.approvalScore}%
                </p>
                <p className={`
                  text-sm
                  ${isApproved ? "text-green-600" : ""}
                  ${isRejected ? "text-red-600" : ""}
                  ${isPending ? "text-yellow-600" : ""}
                `}>
                  Approval Score
                </p>
              </div>
            )}
          </div>

          {isApproved && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-green-600">Sanctioned Amount</p>
                <p className="text-2xl font-bold text-green-800">
                  ₹{parseFloat(latestLoan.sanctionedAmount || "0").toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-600">Interest Rate</p>
                <p className="text-2xl font-bold text-green-800">
                  {latestLoan.interestRate}% p.a.
                </p>
              </div>
              <div>
                <p className="text-sm text-green-600">Tenure</p>
                <p className="text-2xl font-bold text-green-800">
                  {latestLoan.tenure} Months
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Loan Details Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-4">Loan Details</h5>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Requested Amount</span>
                <span className="font-medium">
                  ₹{parseFloat(latestLoan.requestedAmount).toLocaleString()}
                </span>
              </div>
              {latestLoan.monthlyEmi && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly EMI</span>
                  <span className="font-medium">
                    ₹{parseFloat(latestLoan.monthlyEmi).toLocaleString()}
                  </span>
                </div>
              )}
              {latestLoan.processingFee && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium">
                    ₹{parseFloat(latestLoan.processingFee).toLocaleString()}
                  </span>
                </div>
              )}
              {latestLoan.totalInterest && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest</span>
                  <span className="font-medium">
                    ₹{parseFloat(latestLoan.totalInterest).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 mb-4">Assessment Factors</h5>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Credit Score</span>
                <Badge className="status-approved">Excellent (785)</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Income Stability</span>
                <Badge className="status-approved">High</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Existing Liabilities</span>
                <Badge className="status-pending">Moderate</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Repayment History</span>
                <Badge className="status-approved">Excellent</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isApproved && (
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <Button className="btn-success flex items-center justify-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept Loan Offer
            </Button>
            <Button className="btn-secondary flex items-center justify-center">
              <RotateCcw className="mr-2 h-4 w-4" />
              Request Re-evaluation
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <Download className="mr-2 h-4 w-4" />
              Download PDF Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
