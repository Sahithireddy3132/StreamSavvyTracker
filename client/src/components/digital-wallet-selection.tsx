import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticatedFetch } from "@/lib/auth";
import type { DigitalWallet } from "@shared/schema";

interface DigitalWalletSelectionProps {
  selectedWalletId?: number;
  onWalletSelect?: (wallet: DigitalWallet) => void;
}

export default function DigitalWalletSelection({ 
  selectedWalletId, 
  onWalletSelect 
}: DigitalWalletSelectionProps) {
  const [selected, setSelected] = useState<number | undefined>(selectedWalletId);

  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ["/api/digital-wallets"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/digital-wallets");
      if (!response.ok) throw new Error("Failed to fetch digital wallets");
      return response.json();
    },
  });

  const handleWalletSelect = (wallet: DigitalWallet) => {
    setSelected(wallet.id);
    onWalletSelect?.(wallet);
  };

  if (isLoading) {
    return (
      <Card className="professional-card">
        <CardHeader>
          <CardTitle>Select Digital Wallet for Disbursal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-2 border-gray-200 p-4 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 mx-auto mb-2 rounded"></div>
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
        <CardTitle>Select Digital Wallet for Disbursal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {wallets.map((wallet: DigitalWallet) => (
            <div
              key={wallet.id}
              onClick={() => handleWalletSelect(wallet)}
              className={`
                border-2 p-4 rounded-lg cursor-pointer hover:shadow-md transition-all text-center
                ${selected === wallet.id
                  ? "border-primary bg-blue-50"
                  : "border-gray-200 hover:border-primary"
                }
              `}
            >
              <div className="mb-2">
                <i className={`${wallet.iconClass} text-3xl`} style={{
                  color: wallet.name === 'Google Pay' ? '#4285F4' :
                         wallet.name === 'PhonePe' ? '#5F259F' :
                         wallet.name === 'BHIM UPI' ? '#FF6B35' :
                         wallet.name === 'Razorpay' ? '#3395FF' :
                         wallet.name === 'PayPal' ? '#0070BA' : '#6B7280'
                }}></i>
              </div>
              <p className="text-sm font-medium text-gray-700">{wallet.name}</p>
              {selected === wallet.id && (
                <p className="text-xs text-primary mt-1">Selected</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
