'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UserProfile {
  username: string;
  displayName: string;
  profilePic: string | null;
  background: string | null;
  email: string;
  createdAt: string;
  status: string;
}

interface DataPreviewDialogProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  profileData: UserProfile | null;
  profilePicFile: File | null;
  backgroundFile: File | null;
  profilePicPreview: string | null;
  backgroundPreview: string | null;
  loading: boolean;
  handleSubmit: () => Promise<void>;
}

const DataPreviewDialog: React.FC<DataPreviewDialogProps> = ({
  showPreview,
  setShowPreview,
  profileData,
  profilePicPreview,
  backgroundPreview,
  loading,
  handleSubmit,
}) => (
  <Dialog open={showPreview} onOpenChange={setShowPreview}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Review Changes</DialogTitle>
        <DialogDescription>Please review your changes before saving</DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <ImagePreview label="Profile Picture" src={profilePicPreview || profileData?.profilePic || 'profile pic'} />
          <ImagePreview label="Background Image" src={backgroundPreview || profileData?.background || 'background'} />
        </div>
        <UserProfileDetails profileData={profileData} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setShowPreview(false)}>Cancel</Button>
        <Button onClick={() => { setShowPreview(false); handleSubmit(); }} disabled={loading}>
          {loading ? 'Saving Changes...' : 'Confirm & Save'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const ImagePreview: React.FC<{ label: string; src: string | null }> = ({ label, src }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="relative h-32 w-full">
      <img src={src || '/api/placeholder/80/80'} alt={label} className="object-cover w-full h-full rounded-lg" />
    </div>
  </div>
);

const UserProfileDetails: React.FC<{ profileData: UserProfile | null }> = ({ profileData }) => (
  <div className="grid grid-cols-2 gap-4">
    <ProfileField label="Username" value={profileData?.username || 'Not set'} />
    <ProfileField label="Display Name" value={profileData?.displayName || 'Not set'} />
    <ProfileField label="Email" value={profileData?.email || 'Not set'} />
    <ProfileField label="Status" value={profileData?.status || 'Not set'} />
  </div>
);

const ProfileField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-2">
    <Label className="font-bold">{label}</Label>
    <p className="text-sm">{value}</p>
  </div>
);

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user?.uId) return;

    fetchUserProfile();
  }, [user?.uId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user', { method: 'GET', credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch user profile');

      const data = await response.json();
      setProfileData(data);
      setProfilePicPreview(data.profilePic);
      setBackgroundPreview(data.background);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load user profile', variant: 'destructive' });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'profilePic' | 'background') => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      if (type === 'profilePic') {
        setProfilePicFile(file);
        setProfilePicPreview(URL.createObjectURL(file));
      } else {
        setBackgroundFile(file);
        setBackgroundPreview(URL.createObjectURL(file));
      }
    } else {
      toast({ title: 'Error', description: 'File size must be under 5MB', variant: 'destructive' });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (profileData?.username) formData.append('username', profileData.username);
      if (profileData?.displayName) formData.append('displayName', profileData.displayName);
      if (profilePicFile) formData.append('profilePic', profilePicFile);
      if (backgroundFile) formData.append('background', backgroundFile);

      const response = await fetch('/api/user', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update profile');

      const updatedData = await response.json();
      setProfileData(updatedData);
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (profilePicPreview) URL.revokeObjectURL(profilePicPreview);
      if (backgroundPreview) URL.revokeObjectURL(backgroundPreview);
    };
  }, [profilePicPreview, backgroundPreview]);

  if (!profileData) return <LoadingSpinner />;

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="security"><Lock className="h-4 w-4" /> Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={(e) => { e.preventDefault(); setShowPreview(true); }} className="space-y-6">
                <FileUpload label="Profile Picture" onChange={(e) => handleFileChange(e, 'profilePic')} />
                <FileUpload label="Background Image" onChange={(e) => handleFileChange(e, 'background')} />
                <Button type="submit" disabled={loading}>Preview Changes</Button>
              </form>
              <DataPreviewDialog
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                profileData={profileData}
                profilePicPreview={profilePicPreview}
                backgroundPreview={backgroundPreview}
                loading={loading}
                handleSubmit={handleSubmit} profilePicFile={profilePicFile} backgroundFile={backgroundFile}              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const FileUpload: React.FC<{ label: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }> = ({ label, onChange }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input type="file" accept="image/*" onChange={onChange} />
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

export default ProfileSettings;
