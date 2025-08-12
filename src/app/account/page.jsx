"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  MapPin,
  Globe,
  Building,
  Calendar,
  Github,
  Save,
  Camera,
  ExternalLink,
  Users,
  UserPlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { githubAPI } from "@/lib/github";
import { Settings } from "lucide-react";
import { Plus } from "lucide-react";

export default function Account() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && githubAPI.isAuthenticated()) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const userStats = await githubAPI.getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([refreshUser(), fetchStats()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Note: GitHub user profile updates require different API endpoints and permissions
      // This is a placeholder for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            User data not available
          </h3>
          <p className="text-muted-foreground">
            Please try refreshing the page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Account</h1>
            <p className="text-muted-foreground mt-2">
              Manage your GitHub profile and account information
            </p>
          </div>
          <Button
            onClick={handleRefreshData}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>

        {/* Profile Picture & Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={user.avatar_url}
                  alt={user.name || user.login}
                />
                <AvatarFallback className="text-2xl">
                  {(user.name || user.login).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  {user.name || user.login}
                </h3>
                <p className="text-muted-foreground">@{user.login}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {user.followers} followers
                  </div>
                  <div className="flex items-center gap-1">
                    <UserPlus className="w-4 h-4" />
                    {user.following} following
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Member since {memberSince}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={user.name || ""}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || "Not public"}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={user.bio || ""}
                readOnly
                className="bg-muted resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={user.location || "Not specified"}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={user.blog || "Not specified"}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">
                  <Building className="w-4 h-4 inline mr-1" />
                  Company
                </Label>
                <Input
                  id="company"
                  value={user.company || "Not specified"}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUsername">
                  <Github className="w-4 h-4 inline mr-1" />
                  GitHub Username
                </Label>
                <Input
                  id="githubUsername"
                  value={user.login}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Profile information is synced from your
                GitHub account. To update this information, please visit your{" "}
                <a
                  href="https://github.com/settings/profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub profile settings
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Repository Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {stats?.totalRepos || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Total Repositories
                </p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {stats?.totalStars || 0}
                </div>
                <p className="text-sm text-muted-foreground">Total Stars</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {stats?.totalForks || 0}
                </div>
                <p className="text-sm text-muted-foreground">Total Forks</p>
              </div>
            </div>

            {stats && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {stats.publicRepos} public repositories • {stats.privateRepos}{" "}
                private repositories
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">GitHub</span>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      Connected
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connected as @{user.login}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://github.com/${user.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Profile
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* GitHub Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              GitHub Profile Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Account Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <span>{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Public Repositories:
                    </span>
                    <span>{user.public_repos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Followers:</span>
                    <span>{user.followers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Following:</span>
                    <span>{user.following}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href={`https://github.com/${user.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View GitHub Profile
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href="https://github.com/settings/profile"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit GitHub Profile
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href="https://github.com/new"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Repository
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
