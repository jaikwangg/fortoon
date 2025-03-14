import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export function SecuritySettings() {
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password & Authentication</CardTitle>
          <CardDescription>Manage your password and login security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showPasswordChange ? (
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordChange(true)}
            >
              Change Password
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <div className="flex space-x-2">
                <Button>Update Password</Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordChange(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">
                Secure your account with 2FA authentication
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Current Session</AlertTitle>
              <AlertDescription>
                Windows • Chrome • San Francisco, CA
              </AlertDescription>
            </Alert>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Active Session</AlertTitle>
              <AlertDescription>
                iPhone • Safari • New York, NY
              </AlertDescription>
            </Alert>
          </div>
          <Button variant="destructive">End All Other Sessions</Button>
        </CardContent>
      </Card>
    </div>
  );
}