"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Lock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { PasswordInput } from "@/components/ui/password-input";

interface EditProfileMenuProps {
  onClose: () => void;
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function EditProfileMenu({ onClose }: EditProfileMenuProps) {
  const { user, updateProfile, deleteAccount } = useAuth();
  const [showFirstConfirmation, setShowFirstConfirmation] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [showPasswordMenu, setShowPasswordMenu] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    username: "",
    email: user?.email || "",
    dateOfBirth: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const debouncedFormData = useDebounce(formData, 500);

  useEffect(() => {
    // Auto-save when form data changes (after debounce)
    const saveChanges = async () => {
      try {
        await updateProfile(debouncedFormData);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    };
    saveChanges();
  }, [debouncedFormData, updateProfile]);

  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // Show error message
      return;
    }
    try {
      await updateProfile({
        ...formData,
        oldPassword: passwordData.oldPassword,
        password: passwordData.newPassword,
      });
      setShowPasswordMenu(false);
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      router.push("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  if (showPasswordMenu) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        <div className="flex flex-col h-full">
          <div className="flex items-center p-4 border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPasswordMenu(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="ml-4 text-lg font-semibold">Change Password</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <PasswordInput
                  id="oldPassword"
                  value={passwordData.oldPassword}
                  onChangeValue={(value) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      oldPassword: value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <PasswordInput
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChangeValue={(value) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChangeValue={(value) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <Button className="w-full" onClick={handlePasswordSave}>
              Save Password
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showFinalConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
          <h3 className="text-lg font-semibold mb-2">Final Confirmation</h3>
          <p className="text-gray-600 mb-4">
            This action cannot be undone. All your data will be permanently
            deleted. Are you absolutely sure?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowFinalConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteAccount}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showFirstConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
          <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete your account? This will remove all
            your data and progress.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowFirstConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => setShowFinalConfirmation(true)}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="ml-4 text-lg font-semibold">Edit Profile</h2>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div
                className="relative cursor-pointer"
                onClick={() => setShowPasswordMenu(true)}
              >
                <Input
                  id="password"
                  type="password"
                  value="••••••••"
                  readOnly
                  className="cursor-pointer pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="relative">
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
                  }
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowFirstConfirmation(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
