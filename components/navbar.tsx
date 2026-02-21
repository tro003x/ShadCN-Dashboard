import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { LogOut, Moon, Settings, User } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Navbar = () => {
    return (
        <nav className='p-4 flex items-center justify-between'>
            collapsebutton
            <div className='flex items-center gap-4'>
                <Link href="/">Dashboard</Link>
                <Moon />
              
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" />}>
                          <Avatar>
                    <AvatarImage src="https://github.com/tro003x.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                                <DropdownMenuItem><User className="h-[1.2 rem] w-[1.2 rem] mr-2"/>Profile</DropdownMenuItem>
                            <DropdownMenuItem><Settings className="h-[1.2 rem] w-[1.2 rem] mr-2"/>Settings</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive"><LogOut className="h-[1.2 rem] w-[1.2 rem] mr-2"/>Log Out</DropdownMenuItem>
                        </DropdownMenuGroup>
                       
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>

        </nav>
    );
};

export default Navbar;