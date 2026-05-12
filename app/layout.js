import "./styles.css";

export const metadata = {
  title: "Atelier Supply",
  description: "Editorial commerce storefront with accounts, cart, checkout, and admin operations."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
