// components/Sidebar.tsx
"use client";

import logoEvolution from "@/assets/asset-0.svg";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
	Bot,
	FileText,
	LogOut,
	MessageCircleMore,
	Server,
	Smartphone,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const [isAdmin, setIsAdmin] = useState(false);
	const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			try {
				const parsed = JSON.parse(localStorage.getItem("user") || "{}");
				setIsAdmin(Boolean(parsed.is_admin));
			} catch {}
		}
	}, []);

	const primaryMenu = isAdmin
		? [
				{ name: "MCP Servers", href: "/mcp-servers", icon: Server },
				{ name: "Clients", href: "/clients", icon: Users },
				{ name: "Documentação", href: "/documentation", icon: FileText },
			]
		: [
				{ name: "Agents", href: "/agents", icon: Bot },
				{ name: "Chat", href: "/chat", icon: MessageCircleMore },
				{ name: "WhatsApp", href: "/whatsapp", icon: Smartphone },
				{ name: "Documentação", href: "/documentation", icon: FileText },
			];

	const handleLogout = () => {
		setLogoutDialogOpen(false);
		router.push("/logout");
	};

	return (
		<aside
			aria-label="Sidebar navigation"
			className="flex flex-col bg-[#cad3cd] dark:bg-[#16151D] text-gray-800 dark:text-gray-200 w-64 md:w-56 lg:w-64 p-4 shadow-2xl overflow-hidden"
		>
			{/* Logo */}
			<div className="flex items-center gap-2 mb-8 px-2">
				<Image src={logoEvolution} alt="Zap IA" width={36} height={36} />
				<span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
					Zap IA
				</span>
			</div>

			{/* Menu Items */}
			<nav className="flex-1 space-y-1" role="menu">
				{primaryMenu.map(({ name, href, icon: Icon }) => {
					const active = pathname === href;
					return (
						<Link
							key={href}
							href={href}
							role="menuitem"
							className={cn(
								"group flex items-center gap-4 p-3 rounded-lg text-base font-medium transition-colors",
								active
									? "bg-white dark:bg-[#222030] text-[#9238c7] border-l-4 border-[#9238c7]"
									: "text-gray-700 dark:text-gray-400 hover:bg-white hover:dark:bg-[#222030] hover:text-[#9238c7]",
							)}
							aria-current={active ? "page" : undefined}
						>
							<Icon className="h-5 w-5" aria-hidden="true" />
							<span className="truncate">{name}</span>
						</Link>
					);
				})}
			</nav>

			{/* Footer & Logout */}
			<div className="mt-auto pt-4 border-t border-gray-300 dark:border-gray-700">
				<div className="flex flex-col text-xs text-gray-600 dark:text-gray-400 px-2 mb-3">
					<span>ZAP AI Platform</span>
					<span>© {new Date().getFullYear()}</span>
				</div>
				<Button
					className="w-full justify-start gap-3 px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 transition-colors"
					onClick={() => setLogoutDialogOpen(true)}
				>
					<LogOut className="h-5 w-5" />
					<span>Sair</span>
				</Button>
			</div>

			{/* Logout Confirmation Dialog */}
			<Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
				<DialogContent className="bg-white dark:bg-[#222030]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<LogOut className="text-red-500" />
							Confirmar logout
						</DialogTitle>
						<DialogDescription className="text-gray-600 dark:text-gray-400">
							Tem certeza que deseja sair da plataforma?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => setLogoutDialogOpen(false)}>Cancelar</Button>
						<Button
							className="bg-red-600 dark:bg-red-700 text-white"
							onClick={handleLogout}
						>
							Sim, sair
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</aside>
	);
}
