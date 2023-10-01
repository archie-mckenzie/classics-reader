import Reader from "../../components/Reader"
import Link from "next/link"

function Header() {
  return (
    <Link href='/'><h1>Classics Reader</h1></Link>
  )
}

function Footer() {
  return (
    <div style={{"minHeight": "50px;"}}>
      <Link href="https://archiemckenzie.com">
          © {new Date().getFullYear()} Archie McKenzie
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <>
      <main>
        <Header />
        <Reader />
      </main>
      <Footer />
    </>
  )
}
