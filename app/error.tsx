"use client"

import { WebAuthnError } from "@simplewebauthn/browser"

import Logo from "@/components/logo"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { BugIcon, RotateCcwIcon } from "lucide-react"

export default function ErrorBoundary({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
  reset: () => void
}) {
  let ErrorModule

  if (error instanceof WebAuthnError) {
    ErrorModule = (
      <>
        <AlertTitle>Błąd logowania natychmiastowego</AlertTitle>
        <AlertDescription>
          <p>
            KOD BŁĘDU: <span className="font-mono bg-accent">{error.code}</span>
          </p>
        </AlertDescription>
      </>
    )
  } else if (error instanceof Error) {
    ErrorModule = (
      <>
        <AlertTitle>
          Błąd {"digest" in error ? "serwera" : "klienta"}
        </AlertTitle>
        <AlertDescription>
          <p>
            {"digest" in error ? (
              <>
                ID BŁĘDU:{" "}
                <span className="font-mono bg-accent">
                  {error.digest?.toString()}
                </span>
              </>
            ) : (
              error.message
            )}
          </p>
        </AlertDescription>
      </>
    )
  } else {
    ErrorModule = (
      <>
        <AlertTitle>Nieznany błąd klienta</AlertTitle>
        <AlertDescription>
          <p>
            Nieznany błąd:
            <span className="font-mono bg-accent">{String(error)}</span>
          </p>
        </AlertDescription>
      </>
    )
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo vertical />
            <h1 className="text-xl font-bold">Ups...</h1>
          </div>
        </div>

        <Alert variant="destructive" className="my-6">
          <BugIcon />
          {ErrorModule}
        </Alert>
        <Button variant="secondary" onClick={retry}>
          <RotateCcwIcon />
          Spróbuj ponownie
        </Button>
      </div>
    </main>
  )
}
