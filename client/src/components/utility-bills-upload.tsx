import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { authenticatedFetch, getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Bolt, Droplets, Flame, Upload } from "lucide-react";
import type { UtilityBill } from "@shared/schema";

const billTypes = [
  { type: "power", label: "Power Bill", icon: Bolt, color: "text-yellow-500" },
  { type: "water", label: "Water Bill", icon: Droplets, color: "text-blue-500" },
  { type: "gas", label: "Gas Bill", icon: Flame, color: "text-red-500" },
];

export default function UtilityBillsUpload() {
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["/api/utility-bills"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/utility-bills");
      if (!response.ok) throw new Error("Failed to fetch bills");
      return response.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, billType, amount, dueDate }: {
      file: File;
      billType: string;
      amount: string;
      dueDate: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("billType", billType);
      formData.append("amount", amount);
      formData.append("dueDate", dueDate);
      formData.append("paymentStatus", "pending");

      const response = await fetch("/api/utility-bills", {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload bill");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility-bills"] });
      setUploadingType(null);
      toast({
        title: "Bill Uploaded",
        description: "Your utility bill has been uploaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload utility bill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, billType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or image file (JPEG, PNG, GIF).",
        variant: "destructive",
      });
      return;
    }

    // Mock data extraction - in real app this would be actual extraction
    const mockAmount = Math.floor(Math.random() * 3000) + 500;
    const mockDueDate = new Date();
    mockDueDate.setDate(mockDueDate.getDate() + 15);

    setUploadingType(billType);
    
    uploadMutation.mutate({
      file,
      billType,
      amount: mockAmount.toString(),
      dueDate: mockDueDate.toISOString(),
    });

    // Reset the input
    event.target.value = '';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { variant: "default" as const, className: "status-completed" },
      pending: { variant: "secondary" as const, className: "status-pending" },
      overdue: { variant: "destructive" as const, className: "status-rejected" },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <Card className="professional-card">
      <CardHeader>
        <CardTitle>Upload Utility Bills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {billTypes.map((billType) => {
            const Icon = billType.icon;
            const isUploading = uploadingType === billType.type;
            
            return (
              <div
                key={billType.type}
                className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center hover:border-primary transition-colors"
              >
                <Icon className={`${billType.color} text-3xl mb-4 mx-auto`} />
                <h4 className="font-medium text-gray-900 mb-2">{billType.label}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Upload your {billType.label.toLowerCase()} (PDF/Image)
                </p>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, billType.type)}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <Button 
                    className="btn-primary text-sm"
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? "Uploading..." : "Choose File"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bills Summary Table */}
        <div className="mt-8">
          <h4 className="font-medium text-gray-900 mb-4">Uploaded Bills Summary</h4>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No bills uploaded yet. Upload your first utility bill above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Bill Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bills.map((bill: UtilityBill) => {
                    const statusConfig = getStatusBadge(bill.paymentStatus || 'pending');
                    return (
                      <tr key={bill.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {bill.billType} Bill
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{parseFloat(bill.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(bill.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={statusConfig.className}>
                            {(bill.paymentStatus || 'pending').charAt(0).toUpperCase() + 
                             (bill.paymentStatus || 'pending').slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
