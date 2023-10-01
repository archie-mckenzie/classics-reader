'use client'

import Link from "next/link"

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <h1>There's been an error.</h1>
        <i><Link href='/'>Return to homepage?</Link></i>
      </body>
    </html>
  )
}