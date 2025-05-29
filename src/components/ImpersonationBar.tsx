// src/components/ImpersonationBar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ImpersonationBar() {
	const [isImpersonating, setIsImpersonating] = useState(false);
	const [clientName, setClientName] = useState("");
	const router = useRouter();
	const { toast } = useToast();

	const checkImpersonation = () => {
		if (typeof window === "undefined") return;

		const lsImpersonating = localStorage.getItem("isImpersonating") === "true";

		const cookieImpersonating =
			document.cookie
				.split("; ")
				.find((row) => row.startsWith("isImpersonating="))
				?.split("=")[1] === "true";

		let name = localStorage.getItem("impersonatedClient") || "";

		if (!name) {
			const clientNameCookie = document.cookie
				.split("; ")
				.find((row) => row.startsWith("impersonatedClient="));

			if (clientNameCookie) {
				name = decodeURIComponent(clientNameCookie.split("=")[1]);
			}
		}

		setIsImpersonating(lsImpersonating || cookieImpersonating);
		setClientName(name);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		checkImpersonation();

		const intervalId = setInterval(checkImpersonation, 2000);

		window.addEventListener("storage", checkImpersonation);

		return () => {
			clearInterval(intervalId);
			window.removeEventListener("storage", checkImpersonation);
		};
	}, []);

	const handleExitImpersonation = () => {
		const adminUserJson = localStorage.getItem("adminUser");
		if (adminUserJson) {
			localStorage.setItem("user", adminUserJson);
			document.cookie = `user=${encodeURIComponent(adminUserJson)}; path=/; max-age=${60 * 60 * 24 * 7}`;
			localStorage.removeItem("adminUser");
		}

		localStorage.removeItem("isImpersonating");
		localStorage.removeItem("impersonatedClient");

		document.cookie =
			"isImpersonating=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		document.cookie =
			"impersonatedClient=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

		const adminToken = localStorage.getItem("adminToken");
		if (adminToken) {
			document.cookie = `access_token=${adminToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
			localStorage.setItem("access_token", adminToken);
			localStorage.removeItem("adminToken");
		}

		toast({
			title: "Modo de administrador restaurado",
			description: "Você não está mais se passando por um cliente",
		});

		router.push("/clients");
	};

	if (!isImpersonating) return null;

	return (
		<div className="bg-[#9238c7] text-black py-2 px-4 sticky top-0 z-50">
			<div className="container mx-auto flex justify-between items-center">
				<p>
					Você está visualizando como cliente:{" "}
					<span className="font-bold">{clientName}</span>
				</p>
				<Button
					onClick={handleExitImpersonation}
					className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
				>
					<UserX className="h-4 w-4" />
					Voltar ao administrador
				</Button>
			</div>
		</div>
	);
}
