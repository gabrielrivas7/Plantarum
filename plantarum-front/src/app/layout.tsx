import "./globals.css";
import Header from "../components/Header";
import { WalletProvider } from "../context/WalletContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <WalletProvider>
          <Header />
          <main>{children}</main>
          <footer style={{ backgroundColor: "#111827", padding: "12px", marginTop: "24px" }}>
            <p className="text-center text-green-500 text-sm">
              © Septiembre 2025 – Gabriel Emilio Rivas Mier y Terán  – TFM Universidad de Salamanca  🌍
            </p>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}

