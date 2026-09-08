import './globals.css'; // או עיצוב גלובלי אם קיים, או פשוט החלפה

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
      <body>{children}</body>
    </html>
  )
}