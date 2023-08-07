import "./globals.css";
import { Inter } from "next/font/google";
import Provider from "./context/AuthContext";
import ToasterContext from "./context/ToasterContext";
import ClientOnly from "./components/ClientOnly";
import PusherContext from "./context/PusherContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.className}`}>
          <ToasterContext />
          <ClientOnly><Provider>{children}</Provider></ClientOnly>
      </body>
    </html>
  );
}
