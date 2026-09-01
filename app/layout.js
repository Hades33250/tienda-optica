import "./globals.css";

export const metadata = {
  title: "Óptica | Demo",
  description: "Demostración de tienda en línea de lentes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
