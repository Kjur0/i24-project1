"use client"

import type { ReactNode } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const settingsSections = [
  { href: "/settings/profile", label: "Profil" },
  { href: "/settings/login", label: "Logowanie" },
] as const

function SettingsContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  return (
    <>
      <Sidebar className="top-18 h-[calc(100dvh-4.5rem)]">
        <SidebarHeader>
          <div className="flex flex-col gap-1 px-4 py-6">
            <h1 className="text-xl font-semibold">Ustawienia</h1>
            <p className="text-sm text-muted-foreground">
              Zarządzaj profilem i dostępem do konta.
            </p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="px-3">
            <nav aria-label="Sekcje ustawień">
              <SidebarMenu>
                {settingsSections.map((section) => (
                  <SidebarMenuItem key={section.href}>
                    <SidebarMenuButton
                      render={<Link href={section.href} />}
                      isActive={pathname === section.href}
                      aria-current={
                        pathname === section.href ? "page" : undefined
                      }
                      onClick={() => setOpenMobile(false)}
                    >
                      {section.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </nav>
          </div>
        </SidebarContent>
      </Sidebar>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3 p-4 md:hidden">
          <SidebarTrigger
            aria-label="Otwórz nawigację ustawień"
            title="Otwórz nawigację ustawień"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold">Ustawienia</h1>
            <p className="text-sm text-muted-foreground">
              Zarządzaj profilem i dostępem do konta.
            </p>
          </div>
        </div>
        {children}
      </div>
    </>
  )
}

export function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="min-h-[calc(100dvh-4.5rem)]">
      <SettingsContent>{children}</SettingsContent>
    </SidebarProvider>
  )
}
