import type { ReactNode } from "react"

import { SettingsLayout } from "@/components/settings-layout"

export default function SettingsRouteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <SettingsLayout>{children}</SettingsLayout>
}
