'use client'

import React, { useState, useEffect } from 'react';
import { CreditCard, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const coinPackages = [
  { coins: 10, price: 5 },
  { coins: 50, price: 20 },
  { coins: 100, price: 35 },
];

export default function TopUpPage() {
  const [selectedPackage, setSelectedPackage] = useState<{ coins: number; price: number; } | null>(coinPackages[0]);
  const [customCoins, setCustomCoins] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  const { theme } = useSettings();
  const { user, refreshUser } = useAuth();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/payment/coin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch balance');
        const data = await response.json();
        setBalance(data.data.balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
        // toast({
        //   title: "Error",
        //   description: "Failed to fetch current balance",
        //   variant: "destructive",
        // });
      }
    };

    fetchBalance();
  }, [toast]);

  const handleCustomCoinsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCoins(e.target.value);
    setSelectedPackage(null);
  };

  const handlePackageSelect = (pkg: { coins: number; price: number }) => {
    setSelectedPackage(pkg);
    setCustomCoins('');
  };

  const handleTopUpClick = () => {
    if (!selectedPackage && !customCoins) {
      toast({
        title: "Error",
        description: "Please select a package or enter a custom amount",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleTopUp = async () => {
    setIsLoading(true);
    const coinsToAdd = selectedPackage ? selectedPackage.coins : parseInt(customCoins);
    
    try {
      const response = await fetch('/api/payment/coin/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: coinsToAdd }),
      });

      if (!response.ok) {
        throw new Error('Deposit failed');
      }

      const data = await response.json();
      
      // Update local state
      if (user) {
        user.credit = data.data.newBalance;
      }
      setBalance(data.data.newBalance);
      
      toast({
        title: "Success!",
        description: `Successfully added ${coinsToAdd} coins to your balance!`,
        variant: "default"
      });
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error depositing coins:', error);
      toast({
        title: "Top Up Failed",
        description: "There was an error processing your top up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4">
        <h1 className={`text-3xl font-bold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Top Up Coins
        </h1>
        
        {/* Current Balance Card */}
        <Card className={`mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {balance} coins
            </p>
          </CardContent>
        </Card>

        {/* Coin Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {coinPackages.map((pkg) => (
            <Card 
              key={pkg.coins} 
              className={`cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                selectedPackage === pkg ? 'ring-2 ring-blue-500' : ''
              } ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`} 
              onClick={() => handlePackageSelect(pkg)}
            >
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {pkg.coins} Coins
                </CardTitle>
                <CardDescription className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  ${pkg.price}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Coins className={`w-12 h-12 mx-auto ${
                  theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'
                }`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Amount */}
        <Card className={`mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              Custom Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Label htmlFor="customCoins" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Coins:
              </Label>
              <Input
                id="customCoins"
                type="number"
                value={customCoins}
                onChange={handleCustomCoinsChange}
                placeholder="Enter custom coin amount"
                className={`${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Up Button */}
        <div className="mt-6">
          <Button 
            onClick={handleTopUpClick} 
            className={`w-full ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`} 
            disabled={isLoading || (!selectedPackage && !customCoins)}
          >
            <CreditCard className="mr-2 h-4 w-4" /> 
            {isLoading ? 'Processing...' : 'Top Up Now'}
          </Button>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
            <DialogHeader>
              <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Confirm Top Up
              </DialogTitle>
              <DialogDescription className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Are you sure you want to purchase{' '}
                <span className="font-bold">
                  ${selectedPackage ? selectedPackage.price : (parseInt(customCoins) * 0.7).toFixed(2)}
                </span>
                for{' '}
                <span className="font-bold">
                  {selectedPackage ? selectedPackage.coins : customCoins} credits
                </span>{' '}
                ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className={theme === 'dark' ? 'text-white' : ''}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTopUp}
                disabled={isLoading}
                className={`${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {isLoading ? 'Processing...' : 'Confirm Purchase'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}