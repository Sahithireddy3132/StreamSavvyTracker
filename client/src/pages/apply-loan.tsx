import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/lib/auth";
import type { Bank } from "@shared/schema";

export default function ApplyLoan() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [loanData, setLoanData] = useState({
    requestedAmount: "",
    interestRate: "9.5",
    tenure: "60", // 5 years in months
    bankId: "",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const { data: banks = [] } = useQuery({
    queryKey: ["/api/banks"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/banks");
      if (!response.ok) throw new Error("Failed to fetch banks");
      return response.json();
    },
  });

  const applyLoanMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await authenticatedFetch("/api/loans", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to apply for loan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({
        title: "Loan Application Submitted",
        description: "Your loan application has been submitted for review.",
      });
      navigate("/my-loans");
    },
    onError: () => {
      toast({
        title: "Application Failed",
        description: "Failed to submit loan application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loanData.bankId) {
      toast({
        title: "Bank Required",
        description: "Please select a bank for your loan application.",
        variant: "destructive",
      });
      return;
    }

    const numericData = {
      ...loanData,
      requestedAmount: parseFloat(loanData.requestedAmount),
      interestRate: parseFloat(loanData.interestRate),
      tenure: parseInt(loanData.tenure),
      bankId: parseInt(loanData.bankId),
    };

    applyLoanMutation.mutate(numericData);
  };

  const calculateEMI = () => {
    const principal = parseFloat(loanData.requestedAmount) || 0;
    const rate = parseFloat(loanData.interestRate) || 0;
    const tenure = parseInt(loanData.tenure) || 0;
    
    if (principal && rate && tenure) {
      const monthlyRate = rate / (12 * 100);
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                  (Math.pow(1 + monthlyRate, tenure) - 1);
      return Math.round(emi);
    }
    return 0;
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
          <div className="max-w-4xl mx-auto space-y-6">
            
            <Card className="professional-card">
              <CardHeader className="professional-card-header">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Apply for Loan
                </CardTitle>
                <p className="text-gray-600">
                  Fill out the form below to apply for a loan. Our AI system will process your application instantly.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="requestedAmount">Loan Amount (₹)</Label>
                      <Input
                        id="requestedAmount"
                        type="number"
                        placeholder="Enter loan amount"
                        value={loanData.requestedAmount}
                        onChange={(e) => setLoanData({ ...loanData, requestedAmount: e.target.value })}
                        min="10000"
                        max="10000000"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tenure">Loan Tenure (Months)</Label>
                      <Select value={loanData.tenure} onValueChange={(value) => setLoanData({ ...loanData, tenure: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tenure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">1 Year (12 months)</SelectItem>
                          <SelectItem value="24">2 Years (24 months)</SelectItem>
                          <SelectItem value="36">3 Years (36 months)</SelectItem>
                          <SelectItem value="48">4 Years (48 months)</SelectItem>
                          <SelectItem value="60">5 Years (60 months)</SelectItem>
                          <SelectItem value="84">7 Years (84 months)</SelectItem>
                          <SelectItem value="120">10 Years (120 months)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
                      <Select value={loanData.interestRate} onValueChange={(value) => setLoanData({ ...loanData, interestRate: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interest rate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8.5">8.5% p.a.</SelectItem>
                          <SelectItem value="9.0">9.0% p.a.</SelectItem>
                          <SelectItem value="9.5">9.5% p.a.</SelectItem>
                          <SelectItem value="10.0">10.0% p.a.</SelectItem>
                          <SelectItem value="10.5">10.5% p.a.</SelectItem>
                          <SelectItem value="11.0">11.0% p.a.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankId">Select Bank</Label>
                      <Select value={loanData.bankId} onValueChange={(value) => setLoanData({ ...loanData, bankId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {banks.map((bank: Bank) => (
                            <SelectItem key={bank.id} value={bank.id.toString()}>
                              {bank.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* EMI Calculator */}
                  {loanData.requestedAmount && loanData.interestRate && loanData.tenure && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Estimated Monthly EMI</h4>
                        <p className="text-2xl font-bold text-primary">
                          ₹{calculateEMI().toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Total Amount: ₹{(calculateEMI() * parseInt(loanData.tenure)).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Processing fee: 1% of loan amount (minimum ₹500)</li>
                      <li>• Documentation charges may apply</li>
                      <li>• Interest rates are subject to bank approval</li>
                      <li>• Loan approval depends on credit score and eligibility criteria</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="btn-primary"
                      disabled={applyLoanMutation.isPending}
                    >
                      {applyLoanMutation.isPending ? "Processing..." : "Submit Application"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
