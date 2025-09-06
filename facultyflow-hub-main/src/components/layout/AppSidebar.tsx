import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Settings,
  FileText,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    roles: ['FACULTY', 'HOD', 'ADMIN', 'IT'],
  },
  {
    title: 'My Tasks',
    url: '/tasks',
    icon: CheckSquare,
    roles: ['FACULTY'],
  },
  {
    title: 'All Tasks',
    url: '/tasks',
    icon: FileText,
    roles: ['HOD', 'ADMIN'],
  },
  {
    title: 'Create Task',
    url: '/tasks/create',
    icon: Plus,
    roles: ['HOD', 'ADMIN'],
  },
  {
  title: 'Portfolio',
  url: '/portfolio',
  icon: FileText, // or import a more specific icon like Briefcase
  roles: ['FACULTY', 'HOD', 'ADMIN'],
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChart3,
    roles: ['HOD', 'ADMIN'],
  },
  {
    title: 'Faculty Management',
    url: '/faculty',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    roles: ['FACULTY', 'HOD', 'ADMIN', 'IT'],
  },
];

export const AppSidebar: React.FC = () => {
  const { state, isMobile } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  const getNavClassName = (url: string) => {
    const isActive = url === '/' ? currentPath === '/' : currentPath.startsWith(url);
    return isActive 
      ? 'bg-primary text-primary-foreground shadow-medium font-medium' 
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';
  };

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent className="bg-card border-r">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-foreground">Facultique</span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${getNavClassName(item.url)}`}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};