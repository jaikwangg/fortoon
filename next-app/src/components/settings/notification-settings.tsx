import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';

export function NotificationSettings() {
    const [notifications, setNotifications] = useState({
      email: {
        security: true,
        updates: true,
        marketing: false,
      },
      push: {
        messages: true,
        security: true,
        updates: false,
      }
    });
  
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Manage your email notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Security Alerts</h4>
                <p className="text-sm text-gray-500">Get notified about security updates</p>
              </div>
              <Switch 
                checked={notifications.email.security}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({
                    ...prev,
                    email: {...prev.email, security: checked}
                  }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Product Updates</h4>
                <p className="text-sm text-gray-500">Receive product update notifications</p>
              </div>
              <Switch 
                checked={notifications.email.updates}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({
                    ...prev,
                    email: {...prev.email, updates: checked}
                  }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Marketing Emails</h4>
                <p className="text-sm text-gray-500">Receive marketing communications</p>
              </div>
              <Switch 
                checked={notifications.email.marketing}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({
                    ...prev,
                    email: {...prev.email, marketing: checked}
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
  
        <Card>
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>Manage your mobile and desktop notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Direct Messages</h4>
                <p className="text-sm text-gray-500">Get notified about new messages</p>
              </div>
              <Switch 
                checked={notifications.push.messages}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({
                    ...prev,
                    push: {...prev.push, messages: checked}
                  }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Security Alerts</h4>
                <p className="text-sm text-gray-500">Get notified about security issues</p>
              </div>
              <Switch 
                checked={notifications.push.security}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({
                    ...prev,
                    push: {...prev.push, security: checked}
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }