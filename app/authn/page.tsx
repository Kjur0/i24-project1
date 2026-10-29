import { AuthnAddForm } from "@/components/forms/authn-add"

export default function AuthnPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <AuthnAddForm />
      </div>
    </main>
  )
}
