"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your application settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Settings Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page is under construction. Continue prompting to fill in
              this page content.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
