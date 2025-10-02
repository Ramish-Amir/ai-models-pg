"use client";

import { useState } from "react";
import {
  Brain,
  History,
  Wifi,
  WifiOff,
  Settings,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onToggleHistory: () => void;
  isConnected: boolean;
}

/**
 * Header component for the AI Model Playground application.
 *
 * This component provides:
 * - Application branding and navigation
 * - Connection status indicator
 * - History toggle functionality
 * - Settings and configuration access
 */
export function Header({ onToggleHistory, isConnected }: HeaderProps) {
  const { user, logout, isLoading, isAuthenticated, login } = useAuth();

  // Debug user data
  console.log("User data:", user);
  console.log("User keys:", user ? Object.keys(user) : "No user");
  console.log("User name:", user?.name);
  console.log("User email:", user?.email);
  console.log("User picture:", user?.picture);
  console.log("Is loading:", isLoading);
  console.log("Is authenticated:", isAuthenticated);
  return (
    <header className="bg-white shadow-sm border-b px-6 border-gray-200">
      <div className="py-2 w-full">
        <div className="flex items-center justify-between w-full">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                AI Model Playground
              </h1>
              <p className="text-xs text-gray-500">
                Compare AI models in real-time
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-4">
            {/* Connection Indicator */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-medium">Disconnected</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* History Toggle */}
              <button
                onClick={onToggleHistory}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>

              {/* Login Button (when not authenticated) */}
              {!isAuthenticated && !isLoading && (
                <button
                  onClick={login}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}

              {/* Enhanced User Menu (when authenticated) */}
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 bg-white border border-gray-200 shadow-xl rounded-xl p-0 overflow-hidden"
                    align="end"
                    forceMount
                  >
                    {/* Menu Items */}
                    <div className="py-2">
                      <DropdownMenuItem
                        asChild
                        className="px-4 py-1 hover:bg-gray-50 transition-colors"
                      >
                        <a href="/profile" className="flex items-center w-full">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              Profile
                            </span>
                            <p className="text-xs text-gray-500">
                              Manage your account
                            </p>
                          </div>
                        </a>
                      </DropdownMenuItem>
                    </div>

                    {/* Logout Section */}
                    <div className="border-t border-gray-200 py-2">
                      <DropdownMenuItem
                        onClick={logout}
                        className="px-4 py-1 hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mr-3">
                          <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">Sign Out</span>
                          <p className="text-xs text-red-500">
                            End your session
                          </p>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
