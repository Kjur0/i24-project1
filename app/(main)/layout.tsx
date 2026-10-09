import { SiteHeader } from "@/components/site-header";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
    </>
  )
}
