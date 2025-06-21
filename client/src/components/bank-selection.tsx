import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticatedFetch } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Bank } from "@shared/schema";

export default function BankSelection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: banks = [], isLoading } = useQuery({
    queryKey: ["/api/banks"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/banks");
      if (!response.ok) throw new Error("Failed to fetch banks");
      return response.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (selectedBankId: number) => {
      const response = await authenticatedFetch("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({ selectedBankId }),
      });
      if (!response.ok) throw new Error("Failed to update bank selection");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Bank Updated",
        description: "Your bank selection has been saved successfully.",
      });
    },
  });

  const handleBankSelect = (bank: Bank) => {
    updateProfileMutation.mutate(bank.id);
  };

  if (isLoading) {
    return (
      <Card className="professional-card">
        <CardHeader>
          <CardTitle>Select Your Bank</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border-2 border-gray-200 p-4 rounded-lg animate-pulse">
                <div className="w-16 h-10 bg-gray-200 mx-auto mb-2 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="professional-card">
      <CardHeader>
        <CardTitle>Select Your Bank</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {banks.map((bank: Bank) => (
            <div
              key={bank.id}
              onClick={() => handleBankSelect(bank)}
              className={`
                border-2 p-4 rounded-lg cursor-pointer hover:shadow-md transition-all
                ${user?.selectedBankId === bank.id
                  ? "border-primary bg-blue-50"
                  : "border-gray-200 hover:border-primary"
                }
              `}
            >
              <div className="w-16 h-10 bg-gray-100 mx-auto mb-2 rounded flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {bank.code}
                </span>
              </div>
              <p className="text-center text-sm font-medium text-gray-900">
                {bank.name}
              </p>
              {user?.selectedBankId === bank.id && (
                <p className="text-center text-xs text-primary mt-1">Selected</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
