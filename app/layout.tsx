// This file is required but the actual layout is in app/[locale]/layout.tsx
// The middleware handles redirecting to the appropriate locale

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
