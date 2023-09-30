import '../../css/stylesheet.css'

export const metadata = {
  title: 'Classics Reader',
  description: 'reader.archiemckenzie.com',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
