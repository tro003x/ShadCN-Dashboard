"use client";

import { Home, Globe, Network, Server, Monitor, ShieldAlert, Settings, User2, ChevronUp } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";

const items = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Domains", url: "/domains", icon: Globe },
    { title: "Subdomains", url: "/subdomains", icon: Network },
    { title: "Ports", url: "/ports", icon: Server },
    { title: "Probed Hosts", url: "/probed-hosts", icon: Monitor },
    { title: "Vulnerabilities", url: "/vulnerabilities", icon: ShieldAlert },
    { title: "Settings", url: "/settings", icon: Settings },
];

const AppSidebar = () => {
    const pathname = usePathname();

    const handleLogout = () => {
        document.cookie = "token=; path=/; max-age=0";
        window.location.href = "/login";
    };

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader className="py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/dashboard">
                                <ShieldAlert className="text-red-500" />
                                <span className="font-bold">Radon</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <Separator />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarMenu>
                        {items.map(item => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === item.url || pathname.startsWith(item.url + "/")}>
                                    <Link href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User2 /> Researcher <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href="/settings">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;
