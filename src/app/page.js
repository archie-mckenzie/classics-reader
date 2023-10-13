import Reader from "../../components/Reader"
import Link from "next/link"

function Header() {
  return (
    <Link href='/'><h2 className="title">Classics Reader</h2></Link>
  )
}

function Footer() {
  return (
    <div style={{"minHeight": "50px"}}>
      <Link href="https://archiemckenzie.com">
          © {new Date().getFullYear()} Archie McKenzie
      </Link>
    </div>
  )
}

export default function App( { searchParams } ) {

  return (
    <>
      <main>
        <Header />
        <Reader language={searchParams.lang || searchParams.language || 'latin'}/>
      </main>
      <Footer />
    </>
  )
}
