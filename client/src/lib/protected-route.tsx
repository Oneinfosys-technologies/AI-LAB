import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  roles?: string[];
}

export function ProtectedRoute({
  path,
  component: Component,
  roles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Debug what's happening with roles and routing
    if (user && roles) {
      console.log(`Protected route ${path}:`, {
        userRole: user.role,
        requiredRoles: roles,
        hasAccess: roles.includes(user.role)
      });
    }
  }, [user, roles, path]);

  if (isLoading) {
    return (
      <Route path={path}>
        {() => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </Route>
    );
  }

  if (!user) {
    console.log(`Redirecting to /auth from ${path} - user not authenticated`);
    return (
      <Route path={path}>
        {() => <Redirect to="/auth" />}
      </Route>
    );
  }

  // Redirect admins to admin dashboard
  if (user.role === "admin" && path === "/") {
    console.log("Admin user detected, redirecting to admin dashboard");
    return (
      <Route path={path}>
        {() => <Redirect to="/admin" />}
      </Route>
    );
  }

  // Redirect superadmins to superadmin dashboard
  if (user.role === "superadmin" && path === "/") {
    console.log("Superadmin user detected, redirecting to superadmin dashboard");
    return (
      <Route path={path}>
        {() => <Redirect to="/sa-dashboard" />}
      </Route>
    );
  }

  // Check role-based access
  if (roles && !roles.includes(user.role)) {
    console.log(`Access denied to ${path} for role ${user.role}, redirecting to home`);
    return (
      <Route path={path}>
        {() => <Redirect to="/" />}
      </Route>
    );
  }

  return <Route path={path}>{() => <Component />}</Route>;
}
