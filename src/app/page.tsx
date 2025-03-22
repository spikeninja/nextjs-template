import Link from "next/link"

export default function Home() {
  return (
    <div>
      <h1>Landing page</h1>
      <Link href="/app">Go to App</Link>
    </div>
  )
}
