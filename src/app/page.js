"use client";

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Github } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const route = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      route.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, path]);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = params.get("token");
      const error = params.get("error");

      if (error) {
        route.push("/dashboard");

        // console.error("OAuth error:", error);
        // alert(`GitHub authentication failed: ${error}. Please try again.`);
        // // Clear the error from URL
        // const newUrl = new URL(window.location);
        // newUrl.searchParams.delete("error");
        // window.history.replaceState({}, "", newUrl);
        return;
      }

      if (token) {
        setIsLoading(true);
        try {
          await login(token);
          // Clear the token from URL for security
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete("token");
          window.history.replaceState({}, "", newUrl);
          route.push("/dashboard");
        } catch (error) {
          console.error("Login failed:", error);
          alert(`Login failed: ${error.message}. Please try again.`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [params, login, route]);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/github");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to initiate GitHub login:", error);
      alert(`Failed to start GitHub login: ${error.message}`);
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center mx-auto mb-6">
            <div className="w-6 h-6 bg-background rounded-sm"></div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Welcome to AI Debugger
          </h1>
          <p className="text-muted-foreground">
            Connect your GitHub repositories and manage them with ease
          </p>
        </div>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <Button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full h-12 bg-foreground hover:bg-gray-800 text-background flex items-center justify-center gap-3 font-medium transition-colors"
            >
              <Github className="w-5 h-5" />
              {isLoading ? "Connecting..." : "Continue with GitHub"}
            </Button>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <a
                  href="#"
                  className="underline hover:text-foreground transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="underline hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </div>

            {/* {searchParams.get("error") && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive text-center">
                  Authentication failed. Please try again.
                </p>
              </div>
            )} */}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <a href="#" className="text-foreground hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
