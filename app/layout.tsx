import "./globals.css";
import Header from "./components/Header";
import { CartProvider } from "./context/CartContext";

export const metadata = {
  title: "OZERKA BAGS",
  description: "Інтернет-магазин сумок та аксесуарів",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
