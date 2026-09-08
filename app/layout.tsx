export const metadata = {
  title: 'מודל חיזוי עימותים בישראל',
  description: 'מודל חיזוי סטטיסטי-היסטורי',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Heebo', sans-serif; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}