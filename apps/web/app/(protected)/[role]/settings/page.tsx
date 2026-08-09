"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import {
  Loader2,
  Users,
  UserPlus,
  Settings,
  ChevronRight,
  UserMinus,
} from "lucide-react";
import InviteMentorDialog from "@/components/layout/organisation/dashboard/InviteMentorDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import UserManagementTable from "@/components/layout/organisation/dashboard/UserManagementTable";
import { ProfilePictureUpload } from "@/components/form-input/ProfilePictureUpload";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Loading from "@/app/loading";
import UserAvatar from "@/components/ui/UserAvatar";

export default function OrganizationSettingsPage() {
  const [activeSection, setActiveSection] = useState("users");
  const { data: session } = useSession();
  const { data: profileData } = trpc.users.profileCheckup.useQuery();
  const updateUserMutation = trpc.users.updateUser.useMutation({
    onSuccess: async () => {
      utils.users.profileCheckup.invalidate();
      toast.success("Profile picture updated successfully!");
      // Force a page refresh to ensure the session is updated
      console.log("Profile picture updated, refreshing page...");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile picture");
    },
  });
  const {
    data: mentors,
    isLoading: isLoadingMentors,
    refetch: refetchMentors,
  } = trpc.mentors.getMentors.useQuery(
    { organizationId: profileData?.organizationProfile?._id || "" },
    { enabled: !!profileData?.organizationProfile?._id }
  );

  const utils = trpc.useUtils();

  const demoteMentorMutation = trpc.users.demoteMentor.useMutation({
    onSuccess: () => {
      toast.success("Mentor role removed successfully");
      refetchMentors();
      utils.users.getOrganizationUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove mentor role");
    },
  });

  const handleRemoveMentorRole = (mentorId: string) => {
    demoteMentorMutation.mutate({
      userId: mentorId,
    });
  };

  const isVolunteer = session?.user?.role === "volunteer";
  const isOrganization =
    session?.user?.role === "admin" || session?.user?.role === "mentor";

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        id: "users",
        label: "Users & Roles",
        icon: Users,
        description: "Manage organisation users and their roles",
      },
      {
        id: "general",
        label: "General Settings",
        icon: Settings,
        description: "Organisation preferences and settings",
      },
    ];

    // Only show mentors section for organization users
    if (isOrganization) {
      baseItems.splice(1, 0, {
        id: "mentors",
        label: "Mentors",
        icon: UserPlus,
        description: "Invite and manage mentors",
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  // Set default active section based on available options
  useEffect(() => {
    if (!menuItems.find((item) => item.id === activeSection)) {
      setActiveSection(menuItems[0]?.id || "users");
    }
  }, [menuItems, activeSection]);

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isVolunteer ? "Account Settings" : "Organisation Settings"}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              {isVolunteer
                ? "Manage your account settings and preferences"
                : "Manage your organisation&apos;s users, mentors, and general settings"}
            </p>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-lg shadow-sm border">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 border-b last:border-b-0 transition-colors",
                      activeSection === item.id
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          activeSection === item.id
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          {item.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex gap-8">
            {/* Desktop Sidebar */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {isVolunteer ? "Settings" : "Settings"}
                </h2>
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                          activeSection === item.id
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            activeSection === item.id
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {activeSection === "users" && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-6 w-6 text-blue-600" />
                      {isVolunteer ? "Account Information" : "Manage Users"}
                    </CardTitle>
                    <CardDescription>
                      {isVolunteer
                        ? "View and manage your account information"
                        : "View and manage users in your organisation"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isVolunteer ? (
                      <div className="space-y-6">
                        <div className="flex justify-center">
                          <ProfilePictureUpload
                            currentImage={session?.user?.image || undefined}
                            onImageChange={(imageUrl) => {
                              updateUserMutation.mutate({ image: imageUrl });
                            }}
                            userName={session?.user?.name || "User"}
                            size="lg"
                          />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Account Information
                          </h3>
                          <p className="text-sm text-gray-500">
                            Update your profile picture and manage account
                            settings
                          </p>
                        </div>
                      </div>
                    ) : (
                      <UserManagementTable
                        organizationId={
                          profileData?.organizationProfile?._id || ""
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {activeSection === "mentors" && isOrganization && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <UserPlus className="h-6 w-6 text-blue-600" />
                          Manage Mentors
                        </CardTitle>
                        <CardDescription>
                          Invite and manage mentors for your organisation
                        </CardDescription>
                      </div>
                      <InviteMentorDialog
                        organizationId={
                          profileData?.organizationProfile?._id || ""
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMentors ? (
                      <Loading size="medium">
                        <p className="text-gray-600 mt-2">Wait a sec...</p>
                      </Loading>
                    ) : mentors && mentors.length > 0 ? (
                      <div className="space-y-4">
                        {mentors.map((mentor) => (
                          <div
                            key={mentor._id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                user={{
                                  name: mentor.name,
                                  image: mentor.image
                                }}
                                size={40}
                                className="w-10 h-10"
                              />
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {mentor.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {mentor.email}
                                </p>
                              </div>
                            </div>
                            {session?.user?.role === "admin" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleRemoveMentorRole(mentor._id)
                                }
                                disabled={demoteMentorMutation.isPending}
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 font-medium"
                              >
                                {demoteMentorMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <UserMinus className="w-4 h-4 mr-2" />
                                )}
                                <span>Remove Role</span>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">
                          <UserPlus className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No mentors yet
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Invite mentors to help manage your organisation
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeSection === "general" && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-6 w-6 text-blue-600" />
                      General Settings
                    </CardTitle>
                    <CardDescription>
                      {isVolunteer
                        ? "Manage your account preferences and settings"
                        : "Manage your organisation&apos;s general settings"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-2">
                        <Settings className="h-12 w-12 mx-auto" />
                      </div>
                      <p className="text-gray-500 font-medium">Coming Soon</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {isVolunteer
                          ? "Account settings features are under development"
                          : "General settings features are under development"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Mobile Content */}
          <div className="lg:hidden">
            {activeSection === "users" && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-blue-600" />
                    {isVolunteer ? "Account Information" : "Manage Users"}
                  </CardTitle>
                  <CardDescription>
                    {isVolunteer
                      ? "View and manage your account information"
                      : "View and manage users in your organisation"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isVolunteer ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-2">
                        <Users className="h-12 w-12 mx-auto" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        Account Management
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Manage your volunteer account settings
                      </p>
                    </div>
                  ) : (
                    <UserManagementTable
                      organizationId={
                        profileData?.organizationProfile?._id || ""
                      }
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "mentors" && isOrganization && (
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex flex-col gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-6 w-6 text-blue-600" />
                        Manage Mentors
                      </CardTitle>
                      <CardDescription>
                        Invite and manage mentors for your organisation
                      </CardDescription>
                    </div>
                    <InviteMentorDialog
                      organizationId={
                        profileData?.organizationProfile?._id || ""
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingMentors ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : mentors && mentors.length > 0 ? (
                    <div className="space-y-3">
                      {mentors.map((mentor) => (
                        <div
                          key={mentor._id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              user={{
                                name: mentor.name,
                                image: mentor.image
                              }}
                              size={40}
                              className="w-10 h-10"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {mentor.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {mentor.email}
                              </p>
                            </div>
                          </div>
                          {session?.user?.role === "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMentorRole(mentor._id)}
                              disabled={demoteMentorMutation.isPending}
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 font-medium"
                            >
                              {demoteMentorMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <UserMinus className="w-4 h-4 mr-2" />
                              )}
                              <span>Remove Role</span>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-2">
                        <UserPlus className="h-12 w-12 mx-auto" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No mentors yet
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Invite mentors to help manage your organisation
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "general" && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-6 w-6 text-blue-600" />
                    General Settings
                  </CardTitle>
                  <CardDescription>
                    {isVolunteer
                      ? "Manage your account preferences and settings"
                      : "Manage your organisation&apos;s general settings"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-2">
                      <Settings className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-500 font-medium">Coming Soon</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {isVolunteer
                        ? "Account settings features are under development"
                        : "General settings features are under development"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
