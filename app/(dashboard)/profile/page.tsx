"use client";

import { useAuth } from "@/lib/auth-context";
import { useDataStore } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  Database,
  Brain,
  Lightbulb,
  LogOut,
  Shield,
  Bell,
  Palette,
} from "lucide-react";
import { useTheme } from "next-themes";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { files, analyses } = useDataStore();
  const { theme, setTheme } = useTheme();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const totalInsights = analyses.reduce((acc, a) => acc + a.insights.length, 0);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Member since{" "}
                  {user?.createdAt
                    ? formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })
                    : "recently"}
                </span>
              </div>
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
              <div className="p-3 rounded-xl bg-primary/10">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {files.length}
                </p>
                <p className="text-sm text-muted-foreground">Datasets Uploaded</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
              <div className="p-3 rounded-xl bg-accent/10">
                <Brain className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {analyses.length}
                </p>
                <p className="text-sm text-muted-foreground">AI Analyses Run</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
              <div className="p-3 rounded-xl bg-success/10">
                <Lightbulb className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalInsights}
                </p>
                <p className="text-sm text-muted-foreground">Insights Generated</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  defaultValue={user?.name}
                  className="pl-10"
                  readOnly
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  defaultValue={user?.email}
                  className="pl-10"
                  readOnly
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Preferences</h3>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Palette className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Theme</p>
                  <p className="text-xs text-muted-foreground">
                    Choose your preferred appearance
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                >
                  System
                </Button>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Bell className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email alerts for analysis completion
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>

            {/* Security */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Shield className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Security</p>
                  <p className="text-xs text-muted-foreground">
                    Password and two-factor authentication
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-destructive">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div>
              <p className="font-medium text-foreground">Sign Out</p>
              <p className="text-sm text-muted-foreground">
                Log out of your CortexCloud account
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
