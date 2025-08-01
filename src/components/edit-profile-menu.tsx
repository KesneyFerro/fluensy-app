"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { LocalUserProfileManager } from "@/lib/services/local-profile-manager";
import { cn } from "@/lib/utils";

// --- Type Definitions ---
interface EditProfileMenuProps {
  readonly onClose: () => void;
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type ProfileField = "name" | "username" | "email" | "dateOfBirth";

export function EditProfileMenu({ onClose }: EditProfileMenuProps) {
  const { user, userProfile, updateProfile, updateLocalProfile } = useAuth();

  // Initialize local profile manager for immediate data persistence
  const localProfileManager = useMemo(() => new LocalUserProfileManager(), []);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    dateOfBirth: "",
  });
  const [originalData, setOriginalData] = useState(formData);
  const [isInitialized, setIsInitialized] = useState(false);
  const [editField, setEditField] = useState<ProfileField | null>(null);
  const [saving, setSaving] = useState<Record<ProfileField, boolean>>({
    name: false,
    username: false,
    email: false,
    dateOfBirth: false,
  });
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordMatchError, setPasswordMatchError] = useState<string | null>(
    null
  );
  const [passwordStrengthError, setPasswordStrengthError] = useState<
    string | null
  >(null);

  const [showPasswordMenu, setShowPasswordMenu] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialize form from userProfile / user - prioritize local cache for immediate display
  useEffect(() => {
    if (!user?.uid || isInitialized) return;

    // First, try to get the most up-to-date data from local storage
    let profile = localProfileManager.getProfile(user.uid);

    // If no local data, fall back to userProfile/user
    profile ??= userProfile;

    const name = profile?.name ?? user?.displayName ?? "";
    const username = profile?.username ?? "";
    const email = profile?.email ?? user?.email ?? "";
    const dob = profile?.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
      : "";
    const newData = { name, username, email, dateOfBirth: dob };
    setFormData(newData);
    setOriginalData(newData);
    setIsInitialized(true);
  }, [userProfile, user, isInitialized, localProfileManager]);

  // Remove the problematic second useEffect that was causing the reset
  // The form data will be managed manually in the save functions

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const validateUsername = (username: string): string | null => {
    if (username.length === 0) {
      return "Username is required";
    }
    if (username.length > 15) {
      return "Username must be less than 15 characters";
    }
    if (/\s/.test(username)) {
      return "Username cannot contain spaces";
    }
    return null;
  };

  // Local auto-save for immediate persistence across navigation
  const handleFieldChange = (field: ProfileField, value: string) => {
    if (!user?.uid) return;

    // Update form state
    setFormData((p) => ({ ...p, [field]: value }));

    // Save to local storage immediately for persistence across navigation
    localProfileManager.updateProfile(user.uid, { [field]: value }, false);

    // Update the AuthContext state immediately
    updateLocalProfile({ [field]: value });
  };

  const handleSaveField = async (field: ProfileField) => {
    if (!user?.uid) return;

    // Validate username before saving
    if (field === "username") {
      const usernameValidationError = validateUsername(formData.username);
      if (usernameValidationError) {
        setUsernameError(usernameValidationError);
        return;
      }
    }

    setSaving((p) => ({ ...p, [field]: true }));

    // Store the current value before making the API call
    const currentValue = formData[field];

    try {
      if (field === "username") {
        const res = await fetch(
          "/api/check-username?username=" +
            encodeURIComponent(formData.username)
        );
        const data = await res.json();
        if (data.exists) {
          setUsernameError("Username already in use");
          return;
        }
        setUsernameError(null);
      }

      // Create the update object with only the changed field and current user data
      const currentProfile =
        localProfileManager.getProfile(user?.uid || "") || userProfile;
      const updateData: any = {
        name: currentProfile?.name || user?.displayName || "",
        username: currentProfile?.username || "",
        email: currentProfile?.email || user?.email || "",
        dateOfBirth: currentProfile?.dateOfBirth || "",
        [field]: currentValue,
      };

      // Only include non-empty required fields to avoid validation errors
      Object.keys(updateData).forEach((key) => {
        if (
          updateData[key] === "" &&
          ["name", "username", "email"].includes(key)
        ) {
          delete updateData[key];
        }
      });

      // Always ensure the field being updated is included
      updateData[field] = currentValue;

      // Try to update the server
      await updateProfile(updateData);

      // Update originalData to reflect the successful save
      setOriginalData((p) => ({ ...p, [field]: currentValue }));

      // Keep the form data updated - don't let it reset
      setFormData((p) => ({ ...p, [field]: currentValue }));

      setEditField(null);
    } catch (err) {
      console.error("Server update failed, but data is saved locally:", err);

      // Even if server fails, the data is already persisted locally via handleFieldChange
      // So we still update the original data to reflect the local save
      setOriginalData((p) => ({ ...p, [field]: currentValue }));

      if (field === "username") {
        setUsernameError(
          "Saved locally. Will sync when connection is restored."
        );
      }

      // Don't revert the form - keep the user's changes
      setEditField(null);

      // Show a brief success message even though server failed
      console.log(
        `✅ ${field} saved locally and will sync when server is available`
      );
    } finally {
      setSaving((p) => ({ ...p, [field]: false }));
    }
  };

  const handlePasswordSave = async () => {
    setPasswordMatchError(null);
    setPasswordStrengthError(null);

    // Validate password strength
    const strengthError = validatePassword(passwordData.newPassword);
    if (strengthError) {
      setPasswordStrengthError(strengthError);
      return;
    }

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMatchError("Passwords do not match");
      return;
    }

    // Password change functionality would be implemented here
    alert("Password change not implemented.");
    setShowPasswordMenu(false);
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  // === Password Change View ===
  if (showPasswordMenu) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
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
          <div className="space-y-6 w-full mx-auto">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <PasswordInput
                id="oldPassword"
                value={passwordData.oldPassword}
                onChangeValue={(val) =>
                  setPasswordData((p) => ({ ...p, oldPassword: val }))
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <PasswordInput
                id="newPassword"
                value={passwordData.newPassword}
                onChangeValue={(val) => {
                  setPasswordData((p) => ({ ...p, newPassword: val }));
                  setPasswordStrengthError(null);
                }}
                className={cn(
                  "w-full",
                  passwordStrengthError ? "border-red-500" : ""
                )}
              />
              {passwordStrengthError && (
                <div className="text-red-500 text-sm mt-1">
                  {passwordStrengthError}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <PasswordInput
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChangeValue={(val) => {
                  setPasswordData((p) => ({ ...p, confirmPassword: val }));
                  setPasswordMatchError(null);
                }}
                className={cn(
                  "w-full",
                  passwordMatchError ? "border-red-500" : ""
                )}
              />
              {passwordMatchError && (
                <div className="text-red-500 text-sm mt-1">
                  {passwordMatchError}
                </div>
              )}
            </div>
            <Button className="w-full mt-4" onClick={handlePasswordSave}>
              Save Password
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // === Main Profile Edit View ===
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="ml-4 text-lg font-semibold">Edit Profile</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6 w-full mx-auto text-left">
          {/* First Name */}
          <div className="space-y-2 relative">
            <Label htmlFor="name">First Name</Label>
            <div className="relative">
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                readOnly={editField !== "name"}
                onFocus={() => setEditField("name")}
                onBlur={(e) => {
                  // Only reset if clicking outside the confirm button
                  if (
                    editField === "name" &&
                    !e.relatedTarget?.closest('button[data-field="name"]')
                  ) {
                    setFormData((p) => ({ ...p, name: originalData.name }));
                    setEditField(null);
                  }
                }}
                className="w-full pr-10"
              />
              {editField === "name" && (
                <button
                  type="button"
                  data-field="name"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 cursor-pointer w-6 h-6 rounded hover:bg-green-50 flex items-center justify-center transition-colors"
                  disabled={saving.name}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSaveField("name")}
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2 relative">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => {
                  handleFieldChange("username", e.target.value);
                  setUsernameError(null);
                }}
                readOnly={editField !== "username"}
                onFocus={() => setEditField("username")}
                onBlur={(e) => {
                  // Only reset if clicking outside the confirm button
                  if (
                    editField === "username" &&
                    !e.relatedTarget?.closest('button[data-field="username"]')
                  ) {
                    setFormData((p) => ({
                      ...p,
                      username: originalData.username,
                    }));
                    setEditField(null);
                    setUsernameError(null);
                  }
                }}
                className={cn(
                  "w-full",
                  usernameError ? "border-red-500 pr-10" : "",
                  editField === "username" ? "pr-10" : ""
                )}
              />
              {editField === "username" && (
                <button
                  type="button"
                  data-field="username"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 cursor-pointer w-6 h-6 rounded hover:bg-green-50 flex items-center justify-center transition-colors"
                  disabled={saving.username}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSaveField("username")}
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {usernameError && (
                <div className="text-red-500 text-sm mt-1">{usernameError}</div>
              )}
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="px-1">
              Date of Birth
            </Label>
            <Popover
              open={editField === "dateOfBirth"}
              onOpenChange={(open) => setEditField(open ? "dateOfBirth" : null)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="dateOfBirth"
                  className="w-full justify-between font-normal"
                >
                  {formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toLocaleDateString()
                    : "Select date"}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      editField === "dateOfBirth" ? "rotate-180" : ""
                    )}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={
                    formData.dateOfBirth
                      ? new Date(formData.dateOfBirth)
                      : undefined
                  }
                  defaultMonth={
                    formData.dateOfBirth
                      ? new Date(formData.dateOfBirth)
                      : new Date(new Date().getFullYear() - 25, 0, 1)
                  }
                  captionLayout="dropdown"
                  onSelect={async (date) => {
                    if (!date) return;
                    const iso = date.toISOString().split("T")[0];

                    // Update locally first for immediate persistence
                    handleFieldChange("dateOfBirth", iso);
                    setSaving((p) => ({ ...p, dateOfBirth: true }));

                    try {
                      // Create the update object with current profile data
                      const currentProfile =
                        localProfileManager.getProfile(user?.uid || "") ||
                        userProfile;
                      const updateData: any = {
                        name: currentProfile?.name || user?.displayName || "",
                        username: currentProfile?.username || "",
                        email: currentProfile?.email || user?.email || "",
                        dateOfBirth: iso,
                      };

                      // Only include non-empty required fields
                      Object.keys(updateData).forEach((key) => {
                        if (
                          updateData[key] === "" &&
                          ["name", "username", "email"].includes(key)
                        ) {
                          delete updateData[key];
                        }
                      });

                      // Always ensure dateOfBirth is included
                      updateData.dateOfBirth = iso;

                      await updateProfile(updateData);

                      // Update originalData to reflect the successful save
                      setOriginalData((p) => ({ ...p, dateOfBirth: iso }));

                      // Keep the form data updated - don't let it reset
                      setFormData((p) => ({ ...p, dateOfBirth: iso }));
                    } catch (err) {
                      console.error(
                        "Server update failed for DOB, but saved locally:",
                        err
                      );

                      // Even if server fails, data is already saved locally
                      setOriginalData((p) => ({ ...p, dateOfBirth: iso }));

                      console.log(
                        "✅ Date of birth saved locally and will sync when server is available"
                      );
                    } finally {
                      setSaving((p) => ({ ...p, dateOfBirth: false }));
                      setEditField(null);
                    }
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                />
              </PopoverContent>
            </Popover>
            <div className="text-gray-500 text-xs mt-1">
              Your date of birth is used to calculate your age.
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2 relative">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                readOnly={editField !== "email"}
                onFocus={() => setEditField("email")}
                onBlur={(e) => {
                  // Only reset if clicking outside the confirm button
                  if (
                    editField === "email" &&
                    !e.relatedTarget?.closest('button[data-field="email"]')
                  ) {
                    setFormData((p) => ({ ...p, email: originalData.email }));
                    setEditField(null);
                  }
                }}
                className={cn("w-full", editField === "email" ? "pr-10" : "")}
              />
              {editField === "email" && (
                <button
                  type="button"
                  data-field="email"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 cursor-pointer w-6 h-6 rounded hover:bg-green-50 flex items-center justify-center transition-colors"
                  disabled={saving.email}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSaveField("email")}
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label>Password</Label>
            <button
              type="button"
              className="relative w-full cursor-pointer border rounded px-3 py-2 text-left"
              onClick={() => setShowPasswordMenu(true)}
            >
              <span className="inline-block w-full select-none">
                <span className="pr-10">••••••••</span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
