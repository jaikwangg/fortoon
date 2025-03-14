import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AppearanceSettings() {
    const [theme, setTheme] = useState('system');
    const [fontSize, setFontSize] = useState('medium');
    const [reducedMotion, setReducedMotion] = useState(false);
  
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Preferences</CardTitle>
            <CardDescription>Customize your visual experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Theme Mode</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
  
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex space-x-2">
                {['blue', 'green', 'purple', 'orange'].map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    className={`w-8 h-8 rounded-full bg-${color}-500 hover:bg-${color}-600`}
                  />
                ))}
              </div>
            </div>
  
            <Separator />
  
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
  
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Reduced Motion</h4>
                <p className="text-sm text-gray-500">Decrease animation effects</p>
              </div>
              <Switch 
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
              />
            </div>
          </CardContent>
        </Card>
  
        <Card>
          <CardHeader>
            <CardTitle>Custom CSS</CardTitle>
            <CardDescription>Add your own custom CSS styles</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea 
              className="w-full min-h-[100px] p-2 font-mono text-sm border rounded-md"
              placeholder="/* Add your custom CSS here */"
            />
            <Button className="mt-4">Save CSS</Button>
          </CardContent>
        </Card>
      </div>
    );
  }