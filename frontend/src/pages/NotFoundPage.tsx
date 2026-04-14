import { Link } from "react-router-dom"
import { House } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-8xl font-bold text-border">404</p>
      <h1 className="font-heading text-2xl font-bold mt-4">Page not found</h1>
      <p className="text-muted-foreground text-sm mt-2 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button className="gap-2">
          <House size={16} />
          Back to home
        </Button>
      </Link>
    </div>
  )
}
