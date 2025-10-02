"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, LogIn, Shield, Zap } from "lucide-react";

/**
 * Login page component with professional UI.
 *
 * This page provides:
 * - Auth0 login integration
 * - Professional design
 * - Feature highlights
 * - Responsive layout
 */
export default function LoginPage() {
  const { user, isLoading, redirectIfAuthenticated, login } = useAuth();

  useEffect(() => {
    redirectIfAuthenticated();
  }, [redirectIfAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                AI Model Playground
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Compare multiple AI models side-by-side in real-time
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Secure authentication with Auth0</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Zap className="h-4 w-4 text-blue-600" />
                <span>Real-time model comparison</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <LogIn className="h-4 w-4 text-purple-600" />
                <span>Personal session history</span>
              </div>
            </div>

            <Button
              onClick={login}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              size="lg"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In with Auth0
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our terms of service and privacy
                policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
