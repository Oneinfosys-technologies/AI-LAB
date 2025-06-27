import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  TestTube, 
  FileText, 
  History, 
  HeadphonesIcon, 
  LogOut,
  Users,
  Settings,
  UserCircle,
  Building2,
  Brain,
  MessageSquare,
  Activity,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import React from "react";

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
}

export function Sidebar({ className, isMobile = false }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role === "superadmin";

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
    },
    {
      name: "Book Test",
      path: "/book-test",
      icon: <TestTube className="mr-3 h-5 w-5" />,
    },
    {
      name: "My Reports",
      path: "/my-reports",
      icon: <FileText className="mr-3 h-5 w-5" />,
    },
    {
      name: "History",
      path: "/history",
      icon: <History className="mr-3 h-5 w-5" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <UserCircle className="mr-3 h-5 w-5" />,
    },
    {
      name: "Support",
      path: "/support",
      icon: <HeadphonesIcon className="mr-3 h-5 w-5" />,
    }
  ];
  
  const aiFeatureItems = [
    {
      name: "Health Insights",
      path: "/health-insights",
      icon: <Brain className="mr-3 h-5 w-5" />,
    },
    {
      name: "Health Chat",
      path: "/health-chat",
      icon: <MessageSquare className="mr-3 h-5 w-5" />,
    }
  ];

  const adminMenuItems = [
    {
      name: "Admin Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
    },
    {
      name: "Test Management",
      path: "/admin/tests",
      icon: <TestTube className="mr-3 h-5 w-5" />,
    },
    {
      name: "Reporting",
      path: "/admin/reporting",
      icon: <FileText className="mr-3 h-5 w-5" />,
    },
    {
      name: "Test Result Entry",
      path: "/admin/test-result-entry",
      icon: <FileText className="mr-3 h-5 w-5" />,
    },
    {
      name: "Reports History",
      path: "/admin/reports-history",
      icon: <FileText className="mr-3 h-5 w-5" />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users className="mr-3 h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings className="mr-3 h-5 w-5" />,
    }
  ];
  
  const superAdminMenuItems = [
    {
      name: "SuperAdmin Dashboard",
      path: "/sa-dashboard",
      icon: <Building2 className="mr-3 h-5 w-5" />,
    },
    {
      name: "Labs Management",
      path: "/sa-dashboard?tab=labs",
      icon: <Building2 className="mr-3 h-5 w-5" />,
    },
    {
      name: "Subscriptions",
      path: "/sa-dashboard?tab=subscriptions",
      icon: <FileText className="mr-3 h-5 w-5" />,
    },
    {
      name: "System Settings",
      path: "/sa-dashboard?tab=settings",
      icon: <Settings className="mr-3 h-5 w-5" />,
    }
  ];

  return (
    <aside 
      className={cn(
        "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out",
        isMobile && "-translate-x-full",
        isCollapsed ? "w-20" : "w-64",
        "bg-white dark:bg-slate-800 shadow-lg",
        className
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-5 flex items-center justify-between">
          {!isCollapsed && <Logo />}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a 
                    className={cn(
                      "flex items-center p-3 text-base rounded-lg",
                      location === item.path 
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50",
                      isCollapsed && "justify-center"
                    )}
                  >
                    {React.cloneElement(item.icon as React.ReactElement, { 
                      className: cn(
                        "h-5 w-5",
                        isCollapsed ? "mr-0" : "mr-3"
                      )
                    })}
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
          
          {!isCollapsed && (
            <h3 className="mt-6 mb-2 px-3 text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center">
              <Brain className="h-4 w-4 mr-1" />
              <span>AI Health</span>
            </h3>
          )}
          <ul className="space-y-1">
            {aiFeatureItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a 
                    className={cn(
                      "flex items-center p-3 text-base rounded-lg",
                      location === item.path 
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50",
                      isCollapsed && "justify-center"
                    )}
                  >
                    {React.cloneElement(item.icon as React.ReactElement, { 
                      className: cn(
                        "h-5 w-5",
                        isCollapsed ? "mr-0" : "mr-3"
                      )
                    })}
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
          
          {isAdmin && (
            <>
              {!isCollapsed && (
                <h3 className="mt-6 mb-2 px-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Admin
                </h3>
              )}
              <ul className="space-y-1">
                {adminMenuItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <a 
                        className={cn(
                          "flex items-center p-3 text-base rounded-lg",
                          location === item.path 
                            ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50",
                          isCollapsed && "justify-center"
                        )}
                      >
                        {React.cloneElement(item.icon as React.ReactElement, { 
                          className: cn(
                            "h-5 w-5",
                            isCollapsed ? "mr-0" : "mr-3"
                          )
                        })}
                        {!isCollapsed && <span className="ml-3">{item.name}</span>}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          
          {isSuperAdmin && (
            <>
              {!isCollapsed && (
                <h3 className="mt-6 mb-2 px-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                  SuperAdmin
                </h3>
              )}
              <ul className="space-y-1">
                {superAdminMenuItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <a 
                        className={cn(
                          "flex items-center p-3 text-base rounded-lg",
                          location.startsWith(item.path.split('?')[0])
                            ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50",
                          isCollapsed && "justify-center"
                        )}
                      >
                        {React.cloneElement(item.icon as React.ReactElement, { 
                          className: cn(
                            "h-5 w-5",
                            isCollapsed ? "mr-0" : "mr-3"
                          )
                        })}
                        {!isCollapsed && <span className="ml-3">{item.name}</span>}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>
        
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <ThemeToggle variant="switch" label={!isCollapsed} className="mb-4" />
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start p-3 text-base rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50",
              isCollapsed && "justify-center"
            )}
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && (
              <span className="ml-3">Sign Out</span>
            )}
            {logoutMutation.isPending && (
              <span className="spinner ml-2"></span>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
