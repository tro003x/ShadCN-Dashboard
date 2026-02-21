import { Home, Inbox, Calendar, Search, Settings, Plus } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";


const items = [
    { title: "Home", url: "/", icon: Home },
    { title: "Inbox", url: "/inbox", icon: Inbox },
    { title: "Calendar", url: "/calendar", icon: Calendar },
    { title: "Search", url: "/search", icon: Search },
    { title: "Settings", url: "/settings", icon: Settings },
]

const AppSidebar = () => {
    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href={"/"}>
                            <Image src="/logo.svg" alt = "logo" height={20} width={20}/>

                            <span>Tros Verse</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                     <SidebarMenu>
                    {items.map(item=>(
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <Link href={item.url}>
                                    <item.icon/>
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                     </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>

            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;