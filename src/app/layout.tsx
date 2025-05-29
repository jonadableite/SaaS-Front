// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Ou sua fonte principal
import "./globals.css"; // Seu arquivo CSS global
import { ThemeProvider } from "./providers"; // Importe o ThemeProvider que criamos

// Configure suas fontes aqui
const inter = Inter({ subsets: ["latin"] }); // Exemplo com Inter

export const metadata: Metadata = {
	title: "SaaS", // Seu título
	description: "Orquestre seus agentes de IA", // Sua descrição
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			{/* suppressHydrationWarning é necessário com next-themes */}
			<body className={inter.className}>
				{/* Envolvemos os children com o ThemeProvider */}
				<ThemeProvider
					attribute="class" // Onde o tema será aplicado (no atributo class do html)
					defaultTheme="system" // Tema padrão (pode ser "dark", "light", ou "system")
					enableSystem // Permite que o tema do sistema seja usado como padrão
					disableTransitionOnChange // Desabilita transições ao mudar o tema
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
