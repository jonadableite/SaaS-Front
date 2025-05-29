// components/Header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
	BellRing,
	ChevronLeft,
	CircleUserRound,
	LogOut,
	Moon,
	Shield,
	Sun,
	UserCog,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Notification {
	id: number;
	title: string;
	read: boolean;
	time: string;
	desc: string;
}

interface HeaderProps {
	title?: string;
	showBackButton?: boolean;
	backUrl?: string;
	theme: string;
	toggleTheme: () => void;
}

export default function Header({
	title = "",
	showBackButton = false,
	backUrl = "/agents",
	theme,
	toggleTheme,
}: HeaderProps) {
	const router = useRouter();
	const [isDark, setIsDark] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		setIsDark(theme === "dark");
	}, [theme]);

	// notifications
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [notifications, setNotifications] = useState<Notification[]>([
		{
			id: 1,
			title: "Novo agente disponível",
			read: false,
			time: "Agora",
			desc: "Um novo assistente IA foi adicionado.",
		},
		{
			id: 2,
			title: "Atualização de sistema",
			read: true,
			time: "2h atrás",
			desc: "Melhorias de desempenho aplicadas.",
		},
		{
			id: 3,
			title: "Mensagem de suporte",
			read: false,
			time: "1d atrás",
			desc: "Sua solicitação foi respondida.",
		},
	]);
	const notificationsRef = useRef<HTMLDivElement>(null);

	// profile
	const [profileOpen, setProfileOpen] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);
	const unreadCount = notifications.filter((n) => !n.read).length;

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (
				notificationsRef.current &&
				!notificationsRef.current.contains(e.target as Node)
			) {
				setNotificationsOpen(false);
			}
			if (
				profileRef.current &&
				!profileRef.current.contains(e.target as Node)
			) {
				setProfileOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	const dropdown = {
		hidden: { opacity: 0, y: -10, scale: 0.95 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: { type: "spring", stiffness: 300, damping: 20 },
		},
		exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.1 } },
	};

	const userMenuItems = [
		{ icon: UserCog, label: "Perfil", action: () => router.push("/profile") },
		{
			icon: Shield,
			label: "Segurança",
			action: () => router.push("/security"),
		},
		{ icon: LogOut, label: "Sair", action: () => router.push("/logout") },
	];

	const markAllAsRead = () =>
		setNotifications((n) => n.map((x) => ({ ...x, read: true })));
	const markAsRead = (id: number) =>
		setNotifications((n) =>
			n.map((x) => (x.id === id ? { ...x, read: true } : x)),
		);

	// conteúdo interno do header
	const HeaderContent = () => (
		<div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
			<div className="flex items-center space-x-4">
				{showBackButton && (
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push(backUrl)}
						className="hover:scale-110 transition-transform"
					>
						<ChevronLeft size={24} />
					</Button>
				)}
				<h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 animate-text">
					{title}
				</h1>
			</div>

			<div className="flex items-center space-x-4">
				{/* Notificações */}
				<div className="relative" ref={notificationsRef}>
					<Button
						size="icon"
						onClick={() => setNotificationsOpen((o) => !o)}
						className="hover:scale-125 transition-transform"
					>
						<BellRing
							size={22}
							className={unreadCount ? "animate-pulse" : ""}
						/>
					</Button>
					<AnimatePresence>
						{notificationsOpen && (
							<motion.div
								variants={dropdown}
								initial="hidden"
								animate="visible"
								exit="exit"
								className={cn(
									"absolute right-0 mt-2 w-80 rounded-xl overflow-hidden shadow-2xl",
									isDark ? "bg-[#16151d]" : "bg-[#cad3cd]",
								)}
							>
								<div className="px-4 py-2 flex justify-between items-center border-b">
									<span className="font-semibold text-purple-500">
										Notificações
									</span>
									{unreadCount > 0 && (
										<button
											onClick={markAllAsRead}
											className="text-xs text-gray-500 hover:text-gray-700"
										>
											Marcar todas
										</button>
									)}
								</div>
								<div className="max-h-64 overflow-y-auto">
									{notifications.map((n) => (
										<div
											key={n.id}
											onClick={() => markAsRead(n.id)}
											className={cn(
												"px-4 py-2 cursor-pointer flex flex-col border-b",
												n.read ? "" : "bg-purple-50",
											)}
										>
											<div className="flex justify-between">
												<span
													className={n.read ? "" : "font-bold text-purple-600"}
												>
													{n.title}
												</span>
												<span className="text-xs text-gray-400">{n.time}</span>
											</div>
											<p className="text-sm text-gray-500 mt-1">{n.desc}</p>
										</div>
									))}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Toggle tema */}
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleTheme}
					className="hover:rotate-45 transition-transform"
				>
					{mounted ? (
						isDark ? (
							<Sun size={36} className="text-yellow-400" />
						) : (
							<Moon size={36} className="text-[#0000EE]" />
						)
					) : (
						<Sun size={36} className="text-yellow-400" />
					)}
				</Button>

				<div className="h-6 border-l border-gray-600 mx-2"></div>

				{/* Perfil */}
				<div className="relative" ref={profileRef}>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setProfileOpen((o) => !o)}
						className="hover:scale-110 transition-transform"
					>
						<CircleUserRound size={40} />
					</Button>
					<AnimatePresence>
						{profileOpen && (
							<motion.div
								variants={dropdown}
								initial="hidden"
								animate="visible"
								exit="exit"
								className={cn(
									"absolute right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-2xl",
									isDark ? "bg-[#16151d]" : "bg-[#cad3cd]",
								)}
							>
								{userMenuItems.map((item, i) => (
									<button
										key={i}
										onClick={item.action}
										className="w-full flex items-center px-4 py-2 hover:bg-[#cad3cd]"
									>
										<item.icon className="mr-2 text-purple-500" />
										<span>{item.label}</span>
									</button>
								))}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);

	return (
		<>
			{/* header estático até mount para SSR */}
			{!mounted && (
				<header
					className={cn(
						"sticky top-0 z-20 w-full border-b backdrop-blur-md",
						isDark
							? "bg-[#16151d] border-gray-800"
							: "bg-[#cad3cd] border-[#cad3cd]",
					)}
				>
					<HeaderContent />
				</header>
			)}

			{/* após mount, usa Framer Motion */}
			{mounted && (
				<motion.header
					initial={{ y: -30, opacity: 0 }}
					animate={{
						y: 0,
						opacity: 1,
						transition: { duration: 0.5, ease: "easeOut" },
					}}
					className={cn(
						"sticky top-0 z-20 backdrop-blur-md",
						isDark
							? "bg-opacity-80 bg-[#16151d] border-b border-gray-800"
							: "bg-opacity-80 bg-[#cad3cd] border-b border-[#cad3cd]",
					)}
				>
					<HeaderContent />
				</motion.header>
			)}
		</>
	);
}
