import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,  
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Upload, AlertCircle } from "lucide-react"; 
// Redux
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import {
  fetchUserProfile,
  updateUserProfile,
  changeUserPassword, // Import changeUserPassword action
  clearProfileError, // Import action to clear profile errors
  clearUpdateSuccess, // Import action to clear update success message
  clearPasswordChangeSuccess, // Import action to clear password change success
} from "../redux/slices/profile/userSlice";

const Profile = () => {
  // Redux state for profile
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error, updateSuccess, passwordChangeSuccess } = useSelector(
    (state: RootState) => state.user
  );

  // Local UI states
  const [activeTab, setActiveTab] = useState("personal");
  const [showLocalSuccess, setShowLocalSuccess] = useState(false); // For local success message
  const [localError, setLocalError] = useState<string | null>(null); // For local validation errors

  // Initialize local form state based on Redux profile
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phoneNo: "",
    position: "",
  });

  
  const [securityInfo, setSecurityInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });

  // 1. Fetch user profile on component mount
  useEffect(() => {
    // You might want to get the token from Redux auth slice or check isAuthenticated there
    // For now, let's assume if the component mounts, we should try to fetch
    dispatch(fetchUserProfile());

    // Clear any success messages when component mounts or tab changes
    dispatch(clearUpdateSuccess());
    dispatch(clearPasswordChangeSuccess());
    setLocalError(null);
    setShowLocalSuccess(false);

  }, [dispatch]);

  // 2. Populate form when profile data is loaded from Redux
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        name: profile.name || "",
        email: profile.email || "", // Email usually isn't updated via this endpoint
        phoneNo: profile.phoneNo || "",
        position: profile.position || "",
      });
      // Assuming notification settings might be part of the profile eventually,
      // or set default/fetch them separately if they are stored server-side.
      // For now, they remain client-side controlled.
    }
  }, [profile]);

  // 3. Handle success and error messages
  useEffect(() => {
    if (updateSuccess) {
      setShowLocalSuccess(true);
      const timer = setTimeout(() => {
        setShowLocalSuccess(false);
        dispatch(clearUpdateSuccess()); // Clear success state in Redux after showing
      }, 3000); // Show success message for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, dispatch]);

  useEffect(() => {
    if (passwordChangeSuccess) {
      setShowLocalSuccess(true); // Re-use the same success alert
      const timer = setTimeout(() => {
        setShowLocalSuccess(false);
        dispatch(clearPasswordChangeSuccess()); // Clear success state in Redux after showing
      }, 3000); // Show success message for 3 seconds
      // Also clear password fields after successful change
      setSecurityInfo({ currentPassword: "", newPassword: "", confirmPassword: "" });
      return () => clearTimeout(timer);
    }
  }, [passwordChangeSuccess, dispatch]);

  // Clear Redux error and local error when fields are changed
  useEffect(() => {
    if (error) {
      dispatch(clearProfileError());
    }
    if (localError) {
      setLocalError(null);
    }
  }, [personalInfo, securityInfo, notificationSettings, error, localError, dispatch]);


  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecurityInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null); // Clear previous local errors
    setShowLocalSuccess(false); // Hide success message

    // Client-side validation
    if (!personalInfo.name.trim() || !personalInfo.phoneNo?.trim() || !personalInfo.position?.trim()) {
      setLocalError("Name, Phone Number, and Position are required.");
      return;
    }

    try {
      // Dispatch the updateUserProfile async thunk
      const resultAction = await dispatch(
        updateUserProfile({
          name: personalInfo.name,
          phoneNo: personalInfo.phoneNo,
          position: personalInfo.position,
        })
      );

      if (updateUserProfile.rejected.match(resultAction)) {
        setLocalError(resultAction.payload as string); // Set error from API
      }
    } catch (err: any) {
      setLocalError("An unexpected error occurred during profile update.");
      console.error(err);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null); // Clear previous local errors
    setShowLocalSuccess(false); // Hide success message

    // Client-side validation
    if (!securityInfo.currentPassword || !securityInfo.newPassword || !securityInfo.confirmPassword) {
      setLocalError("All password fields are required.");
      return;
    }
    if (securityInfo.newPassword !== securityInfo.confirmPassword) {
      setLocalError("New password and confirm password do not match.");
      return;
    }
    if (securityInfo.newPassword.length < 6) { // Example: minimum password length
        setLocalError("New password must be at least 6 characters long.");
        return;
    }

    try {
      // Dispatch the changeUserPassword async thunk
      const resultAction = await dispatch(
        changeUserPassword({
          oldPassword: securityInfo.currentPassword,
          newPassword: securityInfo.newPassword,
        })
      );

      if (changeUserPassword.rejected.match(resultAction)) {
        setLocalError(resultAction.payload as string); // Set error from API
      }
    } catch (err: any) {
      setLocalError("An unexpected error occurred during password change.");
      console.error(err);
    }
  };

 
  const handleSaveAllChanges = () => {
    if (activeTab === "personal") {
      handlePersonalSubmit(new Event('submit') as unknown as React.FormEvent);
    } else if (activeTab === "security") {
      handlePasswordChangeSubmit(new Event('submit') as unknown as React.FormEvent);
    }
   
  };

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32 border-4 border-primary/20">
            <AvatarImage
              src={profile?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=farmer"}
              alt={profile?.name || "User"}
            />
            <AvatarFallback className="text-4xl">
              {profile?.name?.substring(0, 2).toUpperCase() || "JD"}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Change Photo
          </Button>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{profile?.name || "John Doe"}</h1>
          <p className="text-muted-foreground">{profile?.position || "Farm Manager"}</p>
          <p className="mt-4 text-sm">
            Manage your account settings, update your profile information, and
            configure your notification preferences.
          </p>
        </div>
      </div>

      {/* Conditional Success and Error Alerts */}
      {(showLocalSuccess && (updateSuccess || passwordChangeSuccess)) && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            {updateSuccess && "Your personal information has been updated successfully!"}
            {passwordChangeSuccess && "Your password has been changed successfully!"}
          </AlertDescription>
        </Alert>
      )}

      {(error || localError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || localError}
          </AlertDescription>
        </Alert>
      )}


      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your profile information and account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6">
              <form onSubmit={handlePersonalSubmit}> {/* Use specific handler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={personalInfo.name}
                      onChange={handlePersonalInfoChange}
                      disabled={loading} // Disable input during loading
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                   
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={personalInfo.email}
                      disabled // Email is typically not editable here
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNo">Phone Number</Label> {/* Corrected name from 'phone' to 'phoneNo' to match API */}
                    <Input
                      id="phoneNo"
                      name="phoneNo"
                      value={personalInfo.phoneNo}
                      onChange={handlePersonalInfoChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      name="position"
                      value={personalInfo.position}
                      onChange={handlePersonalInfoChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-6" disabled={loading}>
                  {loading ? "Saving..." : "Save Personal Information"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <form onSubmit={handlePasswordChangeSubmit}> {/* Use specific handler */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={securityInfo.currentPassword}
                      onChange={handleSecurityInfoChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={securityInfo.newPassword}
                      onChange={handleSecurityInfoChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={securityInfo.confirmPassword}
                      onChange={handleSecurityInfoChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-6" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              {/* Note: Notifications typically require backend storage/update.
                  If these are client-side only settings, no API integration needed here.
                  If they need to be saved, create a separate thunk for them. */}
              <form> {/* No onSubmit for now if purely client-side */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="emailNotifications"
                        className="mb-1 block"
                      >
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    {/* Using Input type="checkbox" as in your original code.
                        Consider using the Switch component provided by shadcn/ui consistently. */}
                    <Input
                        type="checkbox"
                        id="emailNotifications"
                        className="toggle w-5 h-5  float-end" // Assuming this applies styling
                        checked={notificationSettings.emailNotifications}
                        onChange={() =>
                            setNotificationSettings((prev) => ({
                                ...prev,
                                emailNotifications: !prev.emailNotifications,
                            }))
                        }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications" className="mb-1 block">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          smsNotifications: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications" className="mb-1 block">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via push notifications
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          pushNotifications: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* If notifications are server-side, this button would submit a form */}
                <Button type="submit" className="mt-6" disabled={loading}>
                  Save Notification Preferences
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => dispatch(fetchUserProfile())} disabled={loading}>Cancel</Button> {/* Revert to fetched profile */}
            <Button onClick={handleSaveAllChanges} disabled={loading}>Save All Changes</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;