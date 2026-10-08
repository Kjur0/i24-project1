import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Form from "next/form"
import Logo from "@/components/logo"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  "use client"

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form action="/auth">
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo vertical />
            <h1 className="text-xl font-bold">Logowanie</h1>
            <FieldDescription className="text-center">
              Nie masz konta? <Link href="/signup">Zarejestruj się</Link>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="uczen@tm1.edu.pl"
              required
            />
          </Field>
          <Field>
            <Button type="submit">Zaloguj się</Button>
          </Field>
        </FieldGroup>
      </Form>
      <FieldDescription className="px-6 text-center">
        Poprzez kliknięcie przycisku &ldquo;Zaloguj się&rdquo; akceptujesz{" "}
        <a href="#">Regulamin</a> oraz <a href="#">Politykę Prywatności</a>.
      </FieldDescription>
    </div>
  )
}
