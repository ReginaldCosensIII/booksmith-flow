import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Edit3, 
  Users, 
  Globe, 
  Image, 
  Download,
  BarChart3 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileTabBarProps {
  projectId?: string;
}

const MobileTabBar = ({ projectId }: MobileTabBarProps) => {
  const location = useLocation();

  if (!projectId) return null;

  const tabs = [
    { 
      label: "Overview", 
      icon: BarChart3, 
      path: `/project/${projectId}` 
    },
    { 
      label: "Editor", 
      icon: Edit3, 
      path: `/project/${projectId}/editor` 
    },
    { 
      label: "Characters", 
      icon: Users, 
      path: `/project/${projectId}/characters` 
    },
    { 
      label: "World", 
      icon: Globe, 
      path: `/project/${projectId}/worldbuilding` 
    },
    { 
      label: "Art", 
      icon: Image, 
      path: `/project/${projectId}/art` 
    },
    { 
      label: "Export", 
      icon: Download, 
      path: `/project/${projectId}/export` 
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid grid-cols-6 gap-1 p-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          
          return (
            <Button
              key={tab.path}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "flex flex-col h-12 gap-1 text-xs",
                isActive && "bg-primary/10 text-primary"
              )}
            >
              <Link to={tab.path}>
                <Icon className="h-4 w-4" />
                <span className="truncate">{tab.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileTabBar;