import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboardIcon, 
  UploadIcon, 
  FilterIcon, 
  BarChart3Icon, 
  FileTextIcon, 
  Settings2Icon, 
  CircleHelpIcon, 
  ShieldAlertIcon 
} from "lucide-react"

const data = {
  user: {
    name: "PFMEA User",
    email: "user@pfmea.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: (
        <LayoutDashboardIcon />
      ),
    },
    {
      title: "Upload Procedure",
      url: "#",
      icon: (
        <UploadIcon />
      ),
    },
    {
      title: "Risk Analysis",
      url: "#",
      icon: (
        <ShieldAlertIcon />
      ),
    },
    {
      title: "Charts & Reports",
      url: "#",
      icon: (
        <BarChart3Icon />
      ),
    },
    {
      title: "Procedures",
      url: "#",
      icon: (
        <FileTextIcon />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Filters",
      url: "#",
      icon: (
        <FilterIcon />
      ),
    },
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon />
      ),
    },
    {
      title: "Help & Documentation",
      url: "#",
      icon: (
        <CircleHelpIcon />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <ShieldAlertIcon className="size-5!" />
                <span className="text-base font-semibold">PFMEA Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

