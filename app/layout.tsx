import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wuni — Descubra onde você pode chegar",
  description:
    "Wuni é a plataforma de orientação universitária que cruza seu perfil acadêmico, financeiro e pessoal para recomendar os cursos e faculdades certos para você — e o caminho para chegar até eles.",
};

const themeScript =
  '(function(){try{var t=localStorage.getItem("wuni-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${sora.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Pular para o conteúdo principal
        </a>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
