import Link from "next/link"
import Container from "@/components/Container"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Container>
        <header className="sticky top-0 z-40 w-full border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                <path d="m2 17 10 5 10-5" />
                <path d="m2 12 10 5 10-5" />
              </svg>
              <span className="text-xl font-bold">Starter Kit</span>
            </div>
            <nav>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            </nav>
          </div>
        </header>
      </Container>
      <main className="flex-1">
        <Container>
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Build Better, Launch Faster
                  </h1>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    Our Starter Kit provides everything you need to get your
                    project off the ground quickly. Stop wasting time on
                    boilerplate and focus on what matters most - your product.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/app">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </Container>
      </main>
    </div>
  )
}
