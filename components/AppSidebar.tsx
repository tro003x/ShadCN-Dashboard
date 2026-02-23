import { Home, Inbox, Calendar, Search, Settings, Plus, User, User2, ChevronUp } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";




const items = [
    { title: "Home", url: "/", icon: Home },
    { title: "Inbox", url: "/inbox", icon: Inbox },
    { title: "Calendar", url: "/calendar", icon: Calendar },
    { title: "Search", url: "/search", icon: Search },
    { title: "Settings", url: "/settings", icon: Settings },
]

const AppSidebar = () => {
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader className="py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href={"/"}>
                            <Image src="/logo.svg.jpg" alt = "logo" height={20} width={20} className="rounded-full"/>
                                
                            <span>Tros Verse</span>
                            </Link>
                            
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
                            <Separator></Separator>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
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
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton>
                                        <User2/> Tro Baba <ChevronUp className="ml-auto"/>
                                        <DropdownMenuContent align= "end" >
                                            <DropdownMenuItem>Balance</DropdownMenuItem>
                                            <DropdownMenuItem>Skills</DropdownMenuItem>
                                            <DropdownMenuItem>Account</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;