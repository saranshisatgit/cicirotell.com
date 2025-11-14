'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { 
  HomeIcon, 
  FolderIcon, 
  PhotoIcon, 
  DocumentTextIcon, 
  NewspaperIcon,
  ArrowRightOnRectangleIcon,
  ChevronUpIcon
} from '@heroicons/react/20/solid';
import { SidebarLayout } from '@/components/catalyst/sidebar-layout';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/catalyst/sidebar';
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/catalyst/navbar';
import { Avatar } from '@/components/catalyst/avatar';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/catalyst/dropdown';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar initials={session.user?.email?.[0].toUpperCase() || 'A'} square />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="bottom end">
                <DropdownItem onClick={() => signOut({ callbackUrl: '/admin/login' })}>
                  <ArrowRightStartOnRectangleIcon />
                  <DropdownLabel>Sign out</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <SidebarSection>
              <SidebarLabel className="text-lg font-semibold">Manage my website</SidebarLabel>
            </SidebarSection>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/admin/dashboard" current={pathname === '/admin/dashboard'}>
                <HomeIcon />
                <SidebarLabel>Dashboard</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/admin/dashboard/categories" current={pathname === '/admin/dashboard/categories'}>
                <FolderIcon />
                <SidebarLabel>Categories</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/admin/dashboard/files" current={pathname === '/admin/dashboard/files'}>
                <PhotoIcon />
                <SidebarLabel>Files</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/admin/dashboard/pages" current={pathname === '/admin/dashboard/pages'}>
                <DocumentTextIcon />
                <SidebarLabel>Pages</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/admin/dashboard/blog" current={pathname === '/admin/dashboard/blog'}>
                <NewspaperIcon />
                <SidebarLabel>Blog</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
          <SidebarFooter>
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar initials={session.user?.email?.[0].toUpperCase() || 'A'} className="size-10" square />
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      Admin
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      {session.user?.email}
                    </span>
                  </span>
                </span>
                <ChevronUpIcon />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="top start">
                <DropdownItem onClick={() => signOut({ callbackUrl: '/admin/login' })}>
                  <ArrowRightOnRectangleIcon />
                  <DropdownLabel>Sign out</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}

function DropdownLabel({ children }: { children: React.ReactNode }) {
  return <span className="ml-2">{children}</span>;
}
