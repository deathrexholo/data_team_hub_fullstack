import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

import Dashboard from "@/pages/dashboard";
import Meetings from "@/pages/meetings";
import Team from "@/pages/team";
import Feed from "@/pages/feed";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

export type User = {
  id: number;
  name: string;
  email: string;
  username: string;
  title: string;
  department: string;
  profileImage: string;
  skills: string[];
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate login for demo purposes
    const loginUser = async () => {
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "sophia.chen",
            password: "password123",
          }),
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          console.error("Login failed");
        }
      } catch (error) {
        console.error("Error during login:", error);
      } finally {
        // Simulate loading time
        setTimeout(() => setLoading(false), 1000);
      }
    };

    loginUser();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading TeamSync...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-xl shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">TeamSync Login</h1>
          <p className="text-center text-red-500 mb-4">Login failed. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex">
          <Sidebar
            user={currentUser}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              sidebarOpen={sidebarOpen} 
              onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
              user={currentUser}
            />

            <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
              <div className="animate-fade-in">
                <Switch>
                  <Route path="/" component={() => <Dashboard user={currentUser} />} />
                  <Route path="/meetings" component={() => <Meetings user={currentUser} />} />
                  <Route path="/team" component={() => <Team user={currentUser} />} />
                  <Route path="/feed" component={() => <Feed user={currentUser} />} />
                  <Route path="/profile" component={() => <Profile user={currentUser} />} />
                  <Route component={NotFound} />
                </Switch>
              </div>
            </main>
          </div>

          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
