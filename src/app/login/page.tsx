// src/app/login/page.tsx
"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import {
	FiAlertCircle,
	FiArrowRight,
	FiCheckCircle,
	FiEye,
	FiEyeOff,
	FiMoon,
	FiSun,
} from "react-icons/fi";
import {
	RiFlowChart,
	RiLockLine,
	RiMailLine,
	RiRobot2Line,
	RiUserLine,
} from "react-icons/ri";
import { TbBrandGraphql } from "react-icons/tb";

import androidCharacter from "../../assets/Imagem_de_Imagem.png";
import logoEvolution from "../../assets/asset-0.svg";
import backgroundImage from "../../assets/asset-72.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Importar o cliente Better Auth
import { authClient } from "@/lib/auth-client";

// Definir pageAnimations (placeholder, ajuste conforme necessário)
const pageAnimations = {
	item: {
		hidden: { y: 20, opacity: 0 },
		visible: { y: 0, opacity: 1 },
	},
};

// TODO: Importar useToast se estiver usando shadcn/ui toast
// import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
	const router = useRouter();
	// const { toast } = useToast(); // Descomente se estiver usando shadcn/ui toast

	// Use o hook useTheme
	const { theme, setTheme } = useTheme();

	// Estados para formulários e autenticação
	const [isLoading, setIsLoading] = useState(false); // Pode ser removido ou usado para um estado geral
	const [activeTab, setActiveTab] = useState("login");
	const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
	const [showForgotSuccess, setShowForgotSuccess] = useState(false); // Manter para a simulação
	const [redirectSeconds, setRedirectSeconds] = useState(5);
	const redirectTimer = useRef<NodeJS.Timeout | null>(null);
	const [loginError, setLoginError] = useState("");
	const [registerError, setRegisterError] = useState(""); // Adicionar estado para erro de registro
	const [forgotPasswordError, setForgotPasswordError] = useState(""); // Adicionar estado para erro de forgot password
	const [isEmailNotVerified, setIsEmailNotVerified] = useState(false); // Manter para o fluxo de login
	const [isResendingVerification, setIsResendingVerification] = useState(false); // Manter para a simulação
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Adicionar para registro

	// A função toggleTheme agora usa o setTheme do next-themes
	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	// Estados de loading por operação
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	// Estado combinado para desabilitar botões enquanto qualquer operação está carregando
	const isButtonDisabled =
		isFormLoading || isGoogleLoading || isResendingVerification || isLoading; // Manter isLoading por enquanto

	// Estados de dados de formulário
	const [loginData, setLoginData] = useState({
		email: "",
		password: "",
	});
	const [registerData, setRegisterData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		name: "",
	});
	const [forgotEmail, setForgotEmail] = useState("");

	// --- Funções de autenticação integradas com Better Auth ---

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsFormLoading(true);
		setLoginError(""); // Limpa erros anteriores
		setIsEmailNotVerified(false); // Limpa estado de email não verificado

		const { error } = await authClient.signIn.email(
			{
				email: loginData.email,
				password: loginData.password,
				callbackURL: "/dashboard", // Redireciona após login bem-sucedido
				rememberMe: true, // Opcional: lembrar sessão
			},
			{
				onRequest: (ctx) => {
					// Lógica onRequest (já coberta pelo setIsFormLoading(true) inicial)
				},
				onSuccess: (ctx) => {
					// O Better Auth Client com callbackURL já redireciona,
					// mas você pode adicionar lógica extra aqui se precisar.
					console.log("Login bem-sucedido", ctx.data);
					// router.push('/dashboard'); // Opcional, se callbackURL não for suficiente
				},
				onError: (ctx) => {
					console.error("Erro no login:", ctx.error);
					// Exemplo de tratamento de erro:
					if (ctx.error.code === "email_not_verified") {
						setIsEmailNotVerified(true);
						setLoginError(
							"Email não verificado. Por favor, verifique sua caixa de entrada ou reenvie o email.",
						);
					} else {
						setLoginError(ctx.error.message || "Erro ao fazer login.");
					}
				},
			},
		);

		// O onError do callback já trata o erro, então não precisamos verificar 'error' aqui diretamente
		setIsFormLoading(false);
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsFormLoading(true);
		setRegisterError(""); // Limpa erros anteriores

		if (registerData.password !== registerData.confirmPassword) {
			setRegisterError("A senha e a confirmação de senha não coincidem.");
			setIsFormLoading(false);
			return;
		}

		const { error } = await authClient.signUp.email(
			{
				email: registerData.email,
				password: registerData.password,
				name: registerData.name,
				// callbackURL: "/dashboard", // Opcional: redirecionar após verificar email
			},
			{
				onRequest: (ctx) => {
					// Lógica onRequest
				},
				onSuccess: (ctx) => {
					console.log("Registro bem-sucedido", ctx.data);
					setShowRegisterSuccess(true);
					// Limpar formulário após sucesso (opcional)
					setRegisterData({
						email: "",
						password: "",
						confirmPassword: "",
						name: "",
					});
				},
				onError: (ctx) => {
					console.error("Erro no registro:", ctx.error);
					setRegisterError(ctx.error.message || "Erro ao registrar usuário.");
				},
			},
		);

		setIsFormLoading(false);
	};

	// --- Simulação para funções não encontradas na documentação fornecida ---

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsFormLoading(true);
		setForgotPasswordError(""); // Limpa erros anteriores

		console.log("Tentativa de recuperação de senha para:", forgotEmail);

		// TODO: Verificar a documentação completa do Better Auth para o método cliente de Forgot Password.
		// Se não existir, esta funcionalidade precisará ser implementada via uma rota de API no servidor.
		// Por enquanto, mantemos a simulação:
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Simulação de sucesso:
		setShowForgotSuccess(true);
		setForgotEmail(""); // Limpa o campo após sucesso

		// Simulação de falha (descomente para testar):
		// setForgotPasswordError("Erro ao enviar email de recuperação. Tente novamente.");

		setIsFormLoading(false);
	};

	const handleResendVerificationEmail = async () => {
		setIsResendingVerification(true);
		// TODO: Verificar a documentação completa do Better Auth para o método cliente de Reenviar Email de Verificação.
		// Se não existir, esta funcionalidade precisará ser implementada via uma rota de API no servidor.
		// Por enquanto, mantemos a simulação:
		console.log("Reenviando email de verificação para:", loginData.email);
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Simulação de sucesso:
		// toast({ // Exemplo de toast
		// title: "Email enviado!",
		// description: "Verifique sua caixa de entrada.",
		// });
		alert("Email de verificação reenviado (simulação)."); // Use alert provisoriamente

		// Simulação de falha (descomente para testar):
		// alert("Erro ao reenviar email de verificação (simulação).");

		setIsResendingVerification(false);
		setIsEmailNotVerified(false); // Oculta a mensagem após tentar reenviar (assumindo sucesso)
	};

	// --- Integração de Login Social com Better Auth ---

	const handleGoogleLogin = async () => {
		setIsGoogleLoading(true);
		// Não precisamos de try/catch aqui, pois o Better Auth Client lida com erros via callbacks ou redirecionamento
		await authClient.signIn.social(
			{
				provider: "google",
				callbackURL: "/dashboard", // URL para redirecionar após sucesso
				errorCallbackURL: "/login?error=google_auth_failed", // URL para redirecionar em caso de erro
				// disableRedirect: false, // Deixe como false para o fluxo padrão de redirecionamento
			},
			{
				onRequest: (ctx) => {
					// Lógica onRequest
				},
				onSuccess: (ctx) => {
					// Este callback pode não ser chamado se disableRedirect for false,
					// pois o navegador será redirecionado diretamente pelo Better Auth.
					console.log("Início do fluxo de login com Google", ctx);
				},
				onError: (ctx) => {
					// Este callback é chamado se houver um erro ANTES do redirecionamento para o Google.
					// Erros APÓS o redirecionamento (ex: usuário cancelou) serão tratados pela errorCallbackURL.
					console.error("Erro ao iniciar login com Google:", ctx.error);
					setLoginError(
						"Não foi possível iniciar o login com Google. Tente novamente.",
					); // Ou um estado de erro específico para Google
				},
			},
		);

		// A flag isGoogleLoading será resetada pela errorCallbackURL ou na página de destino (dashboard)
		// após um login bem-sucedido. Não resete aqui, pois o usuário será redirecionado.
		// setIsGoogleLoading(false); // Remova este reset
	};

	// Efeito para o timer de redirecionamento após sucesso (mantido para simulação)
	useEffect(() => {
		if (showRegisterSuccess || showForgotSuccess) {
			setRedirectSeconds(5); // Reinicia o contador
			redirectTimer.current = setInterval(() => {
				setRedirectSeconds((prev) => {
					if (prev <= 1) {
						clearInterval(redirectTimer.current!);
						redirectTimer.current = null;
						// Redireciona para a aba de login após o timer
						setActiveTab("login");
						setShowRegisterSuccess(false);
						setShowForgotSuccess(false);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		} else {
			// Limpa o timer se não estiver em estado de sucesso
			if (redirectTimer.current) {
				clearInterval(redirectTimer.current);
				redirectTimer.current = null;
			}
		}

		// Função de limpeza para o useEffect
		return () => {
			if (redirectTimer.current) {
				clearInterval(redirectTimer.current);
			}
		};
	}, [showRegisterSuccess, showForgotSuccess]); // Dependências do useEffect

	// A toast de sucesso de login que estava solta precisa ser chamada dentro de uma função ou useEffect
	// Exemplo:
	// useEffect(() => {
	// if (loginSuccessState) { // Crie um estado para sucesso de login
	// toast({
	// title: "Login bem-sucedido",
	// description: "Redirecionando...",
	// });
	// // Lógica de redirecionamento após um pequeno delay
	// }
	// }, [loginSuccessState, toast]);

	return (
		// Container principal sem divisão flexível
		<div className="min-h-screen w-full relative overflow-hidden">
			{/* Imagem de fundo fixa que cobre TODA a página */}
			<div className="fixed inset-0 w-full h-full">
				<AnimatePresence mode="wait">
					<motion.div
						key="background-transition" // Chave fixa ou baseada na imagem, não no tema
						className="absolute inset-0"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.8 }}
					>
						<Image
							src={backgroundImage}
							alt="Background"
							fill
							priority
							className="object-cover"
							style={{ objectPosition: "center" }}
						/>
						{/* Sobreposição semi-transparente para melhorar a legibilidade */}
						{/* A classe da sobreposição agora depende do tema obtido pelo useTheme */}
						<div
							className={`absolute inset-0 w-full h-full ${
								theme === "dark" ? "bg-[#0d0c14]/80" : "bg-background/40"
							}`}
						></div>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Botão de alternar tema - Adicionei um exemplo */}
			<div className="absolute top-6 right-6 z-50">
				<Button
					variant="outline"
					size="icon"
					onClick={toggleTheme}
					className="rounded-full border-border bg-card text-foreground hover:bg-accent/50 transition-colors duration-200"
					aria-label="Alternar tema"
				>
					<AnimatePresence mode="wait" initial={false}>
						<motion.div
							key={theme === "dark" ? "moon" : "sun"}
							initial={{ y: -20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: 20, opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							{/* Usei os ícones que você já importou */}
							{theme === "dark" ? <FiMoon size={20} /> : <FiSun size={20} />}
						</motion.div>
					</AnimatePresence>
				</Button>
			</div>

			{/* Personagem Android - Posicionado à esquerda e sem sobreposição com o texto */}
			<div className="hidden md:block absolute bottom-0 left-0 z-10 h-[90vh] w-[70%]">
				<motion.div
					className="absolute bottom-0 left-0 h-full w-full"
					initial={{ opacity: 0, y: 100 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 100 }}
					transition={{ duration: 0.8, delay: 0.5 }}
				>
					<Image
						src={androidCharacter}
						alt="Android Character"
						fill
						priority
						className="object-contain object-bottom"
						style={{ left: "-5%" }}
					/>
					{/* Efeito de brilho ao redor do personagem */}
					<motion.div
						className="absolute inset-0 rounded-full bg-[#9137c6]/10 blur-3xl -z-10"
						animate={{
							scale: [1, 1.05, 1],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{
							duration: 3.5,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					/>
				</motion.div>
			</div>

			{/* Conteúdo central (título e recursos) - Posicionado ENTRE o android e o formulário */}
			{/* Ajustei a largura para dar mais espaço ao formulário e ao personagem */}
			<div className="hidden md:block absolute top-1/2 left-[45%] transform -translate-y-1/2 -translate-x-[65%] z-20 w-[40%] max-w-md">
				<div className="relative mx-auto text-center text-foreground">
					<motion.h1
						className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight font-zen"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.4 }}
					>
						Orquestre seus
						<br />
						{/* A classe do gradiente agora depende do tema obtido pelo useTheme */}
						<span
							className={`${
								theme === "dark"
									? "bg-gradient-to-r from-[#9137c6] to-accent text-transparent bg-clip-text"
									: "bg-gradient-to-r from-[#9137c6] to-accent text-transparent bg-clip-text"
							}`}
						>
							agentes de IA
						</span>
					</motion.h1>

					<motion.p
						className="text-lg md:text-xl mt-6 mb-8 mx-auto text-muted-foreground font-montserrat"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.6 }}
					>
						Crie, gerencie e conecte agentes inteligentes com fluxos de trabalho
						avançados e integrações perfeitas.
					</motion.p>

					{/* Seção de recursos com animações aprimoradas */}
					<div className="mt-8 flex flex-col items-center space-y-5 mx-auto">
						<h3 className="text-xl font-semibold text-white mb-2 font-zen-dots">
							Recursos avançados
						</h3>

						{/* Item 1: Múltiplos tipos de agentes */}
						<motion.div
							variants={pageAnimations.item}
							initial="hidden"
							animate="visible"
							transition={{ delay: 0.6 }}
							className="flex items-center gap-3 group"
							whileHover={{ x: 5 }}
						>
							<TooltipProvider delayDuration={300}>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center gap-3 cursor-pointer">
											<div className="relative">
												<motion.div
													className="absolute inset-0 bg-[#9137c6]/20 rounded-full blur-md"
													animate={{
														scale: [1, 1.1, 1],
														opacity: [0.5, 0.8, 0.5],
													}}
													transition={{
														duration: 3,
														repeat: Number.POSITIVE_INFINITY,
														ease: "easeInOut",
													}}
												/>
												{/* A classe da sombra depende do tema */}
												<div
													className={`p-3 rounded-full bg-card border border-border transition duration-300 transform group-hover:scale-110 group-hover:border-[#9137c6] shadow-lg ${
														theme === "dark"
															? "shadow-[#9137c6]/20"
															: "shadow-[#9137c6]/10"
													} relative z-10`}
												>
													<RiRobot2Line
														className={`text-2xl ${
															theme === "dark"
																? "text-[#9137c6]"
																: "text-[#9137c6]"
														}`}
													/>
												</div>
											</div>
											<span className="text-lg font-montserrat">
												Múltiplos tipos de agentes
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent className="font-montserrat">
										<p>Suporte para Agentes Autônomos, Colaborativos e mais.</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</motion.div>

						{/* Item 2: Fluxos de trabalho visuais */}
						<motion.div
							variants={pageAnimations.item}
							initial="hidden"
							animate="visible"
							transition={{ delay: 0.7 }}
							className="flex items-center gap-3 group"
							whileHover={{ x: 5 }}
						>
							<TooltipProvider delayDuration={300}>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center gap-3 cursor-pointer">
											<div className="relative">
												<motion.div
													className="absolute inset-0 bg-accent/20 rounded-full blur-md"
													animate={{
														scale: [1, 1.1, 1],
														opacity: [0.5, 0.8, 0.5],
													}}
													transition={{
														duration: 3,
														repeat: Number.POSITIVE_INFINITY,
														ease: "easeInOut",
													}}
												/>
												<div
													className={`p-3 rounded-full bg-card border border-border transition duration-300 transform group-hover:scale-110 group-hover:border-accent shadow-lg ${
														theme === "dark"
															? "shadow-accent/20"
															: "shadow-accent/10"
													} relative z-10`}
												>
													<RiFlowChart
														className={`text-2xl ${
															theme === "dark" ? "text-accent" : "text-accent"
														}`}
													/>
												</div>
											</div>
											<span className="text-lg font-montserrat">
												Fluxos de trabalho visuais
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent className="font-montserrat">
										<p>Crie e visualize interações complexas entre agentes.</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</motion.div>

						{/* Item 3: Integração com APIs e Dados */}
						<motion.div
							variants={pageAnimations.item}
							initial="hidden"
							animate="visible"
							transition={{ delay: 0.8 }}
							className="flex items-center gap-3 group"
							whileHover={{ x: 5 }}
						>
							<TooltipProvider delayDuration={300}>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center gap-3 cursor-pointer">
											<div className="relative">
												<motion.div
													className="absolute inset-0 bg-[#7046c0]/20 rounded-full blur-md"
													animate={{
														scale: [1, 1.1, 1],
														opacity: [0.5, 0.8, 0.5],
													}}
													transition={{
														duration: 3,
														repeat: Number.POSITIVE_INFINITY,
														ease: "easeInOut",
													}}
												/>
												<div
													className={`p-3 rounded-full bg-card border border-border transition duration-300 transform group-hover:scale-110 group-hover:border-[#7046c0] shadow-lg ${
														theme === "dark"
															? "shadow-[#7046c0]/20"
															: "shadow-[#7046c0]/10"
													} relative z-10`}
												>
													<TbBrandGraphql
														className={`text-2xl ${
															theme === "dark"
																? "text-[#7046c0]"
																: "text-[#7046c0]"
														}`}
													/>
												</div>
											</div>
											<span className="text-lg font-montserrat">
												Integração com APIs e Dados
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent className="font-montserrat">
										<p>
											Conecte seus agentes a fontes de dados externas e
											serviços.
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</motion.div>
					</div>
				</div>
			</div>

			{/* Formulário de Login/Registro - Posicionado à direita */}
			{/* Ajustei a posição e largura para não sobrepor o conteúdo central */}
			<div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-0 md:-translate-x-[10%] z-30 w-full md:w-[45%] max-w-md px-6 md:px-0">
				<motion.div
					className="relative mx-auto p-8 rounded-xl shadow-2xl border border-border bg-card text-foreground w-full"
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6, delay: 0.3 }}
				>
					{/* Logo */}
					<div className="flex justify-center mb-8">
						<Image
							src={logoEvolution}
							alt="Evolution Flow AI"
							width={150}
							height={150}
							className="object-contain"
						/>
					</div>

					{/* Tabs de Login/Registro/Esqueci a Senha */}
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-3 h-12 mb-6 bg-muted/50 border border-border">
							<TabsTrigger
								value="login"
								className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm font-montserrat"
							>
								Login
							</TabsTrigger>
							<TabsTrigger
								value="register"
								className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm font-montserrat"
							>
								Registrar
							</TabsTrigger>
							<TabsTrigger
								value="forgot"
								className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm font-montserrat text-xs md:text-sm"
							>
								Esqueci a Senha
							</TabsTrigger>
						</TabsList>

						{/* Conteúdo da aba de Login */}
						<TabsContent value="login">
							<AnimatePresence mode="wait">
								{showRegisterSuccess ? (
									// Mensagem de sucesso de registro
									<motion.div
										key="register-success"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.3 }}
										className="text-center text-green-500 mb-6 flex flex-col items-center"
									>
										<FiCheckCircle size={40} className="mb-3" />
										<h3 className="text-xl font-bold mb-2 font-zen-dots text-foreground">
											Registro bem-sucedido!
										</h3>
										<p className="text-muted-foreground font-montserrat">
											Por favor, verifique seu email para ativar sua conta.
										</p>
										<p className="mt-3 text-sm font-montserrat">
											Redirecionando para login em {redirectSeconds}...
										</p>
									</motion.div>
								) : (
									// Formulário de Login
									<motion.div
										key="login-form"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.3 }}
									>
										<h2 className="text-2xl font-bold text-center mb-6 font-zen-dots">
											Entrar na sua conta
										</h2>
										<form onSubmit={handleLogin} className="space-y-5">
											{/* Email Input */}
											<motion.div variants={pageAnimations.item}>
												<div className="relative">
													<RiMailLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
													<Input
														id="login-email"
														type="email"
														placeholder="seu@email.com"
														required
														value={loginData.email}
														onChange={(e) =>
															setLoginData({
																...loginData,
																email: e.target.value,
															})
														}
														disabled={isButtonDisabled}
														className="pl-10 pr-4 py-2 w-full rounded-md focus:outline-none focus:ring-2 bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-[#9137c6] focus:border-[#9137c6] transition duration-200 font-montserrat"
													/>
												</div>
											</motion.div>

											{/* Password Input */}
											<motion.div variants={pageAnimations.item}>
												<div className="relative">
													<RiLockLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
													<Input
														id="login-password"
														type={showPassword ? "text" : "password"}
														placeholder="Sua senha"
														required
														value={loginData.password}
														onChange={(e) =>
															setLoginData({
																...loginData,
																password: e.target.value,
															})
														}
														disabled={isButtonDisabled}
														className="pl-10 pr-10 py-2 w-full rounded-md focus:outline-none focus:ring-2 bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-[#9137c6] focus:border-[#9137c6] transition duration-200 font-montserrat"
													/>
													<button
														type="button"
														onClick={() => setShowPassword(!showPassword)}
														className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
														aria-label={
															showPassword ? "Ocultar senha" : "Mostrar senha"
														}
													>
														{showPassword ? (
															<FiEyeOff size={20} />
														) : (
															<FiEye size={20} />
														)}
													</button>
												</div>
											</motion.div>

											{/* Login Button */}
											<motion.div variants={pageAnimations.item}>
												<Button
													type="submit"
													disabled={isButtonDisabled}
													className={`w-full py-3 px-6 rounded-lg font-medium text-white
                              transition-all transform hover:scale-[1.02] active:scale-[0.98]
                              ${isButtonDisabled ? "opacity-60 cursor-not-allowed" : ""}
                              bg-gradient-to-r from-[#9137c6] to-[#7046c0] hover:from-[#7046c0] hover:to-[#9137c6] shadow-lg shadow-[#9137c6]/30 font-montserrat
                            `}
												>
													<div className="flex items-center justify-center">
														{isFormLoading ? (
															<>
																<svg
																	className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 24 24"
																>
																	<circle
																		className="opacity-25"
																		cx="12"
																		cy="12"
																		r="10"
																		stroke="currentColor"
																		strokeWidth="4"
																	></circle>
																	<path
																		className="opacity-75"
																		fill="currentColor"
																		d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
																	></path>
																</svg>
																<span>Entrando...</span>
															</>
														) : (
															<>
																<span>Entrar</span>
																<motion.div
																	className="ml-2 inline-block"
																	animate={{ x: [0, 5, 0] }}
																	transition={{
																		repeat: Number.POSITIVE_INFINITY,
																		duration: 1.5,
																		repeatDelay: 0.5,
																	}}
																>
																	<FiArrowRight size={20} />
																</motion.div>
															</>
														)}
													</div>
												</Button>
											</motion.div>

											{/* Error Message */}
											<AnimatePresence>
												{loginError && (
													<motion.div
														initial={{ opacity: 0, y: -10 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -10 }}
														className="text-red-500 text-sm mt-3 flex items-center gap-2 font-montserrat"
													>
														<FiAlertCircle size={18} />
														<span>{loginError}</span>
													</motion.div>
												)}
												{isEmailNotVerified && (
													<motion.div
														initial={{ opacity: 0, y: -10 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -10 }}
														className="text-yellow-500 text-sm mt-3 flex flex-col items-center gap-2 font-montserrat"
													>
														<div className="flex items-center gap-2">
															<FiAlertCircle size={18} />
															<span>Seu email ainda não foi verificado.</span>
														</div>
														<Button
															variant="link"
															onClick={handleResendVerificationEmail}
															disabled={isResendingVerification}
															className="text-sm text-yellow-500 hover:underline p-0 h-auto disabled:opacity-60 disabled:cursor-not-allowed font-montserrat"
														>
															{isResendingVerification
																? "Reenviando..."
																: "Reenviar email de verificação"}
														</Button>
													</motion.div>
												)}
											</AnimatePresence>

											{/* Separator */}
											<div className="relative my-6">
												<div className="absolute inset-0 flex items-center">
													<span className="w-full border-t border-border"></span>
												</div>
												<div className="relative flex justify-center text-xs uppercase">
													<span className="bg-card px-2 text-muted-foreground font-montserrat">
														Ou continue com
													</span>
												</div>
											</div>

											{/* Google Login Button */}
											<motion.div variants={pageAnimations.item}>
												<Button
													type="button"
													onClick={handleGoogleLogin}
													disabled={isButtonDisabled}
													className={`w-full py-3 px-6 rounded-lg font-medium
                              transition-all transform hover:scale-[1.02] active:scale-[0.98]
                              ${isButtonDisabled ? "opacity-60 cursor-not-allowed" : ""}
                              bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border shadow-sm font-montserrat
                            `}
												>
													<div className="flex items-center justify-center">
														{isGoogleLoading ? (
															<>
																<svg
																	className="animate-spin -ml-1 mr-3 h-5 w-5 text-secondary-foreground"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 24 24"
																>
																	<circle
																		className="opacity-25"
																		cx="12"
																		cy="12"
																		r="10"
																		stroke="currentColor"
																		strokeWidth="4"
																	></circle>
																	<path
																		className="opacity-75"
																		fill="currentColor"
																		d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
																	></path>
																</svg>
																<span>Carregando...</span>
															</>
														) : (
															<>
																<FcGoogle size={20} className="mr-3" />
																<span>Entrar com Google</span>
															</>
														)}
													</div>
												</Button>
											</motion.div>
										</form>
									</motion.div>
								)}
							</AnimatePresence>
						</TabsContent>

						{/* Conteúdo da aba de Registro */}
						<TabsContent value="register">
							<AnimatePresence mode="wait">
								{showRegisterSuccess ? (
									// Mensagem de sucesso de registro (reutilizada)
									<motion.div
										key="register-success-tab"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.3 }}
										className="text-center text-green-500 mb-6 flex flex-col items-center"
									>
										<FiCheckCircle size={40} className="mb-3" />
										<h3 className="text-xl font-bold mb-2 font-zen-dots text-foreground">
											Registro bem-sucedido!
										</h3>
										<p className="text-muted-foreground font-montserrat">
											Por favor, verifique seu email para ativar sua conta.
										</p>
										<p className="mt-3 text-sm font-montserrat">
											Redirecionando para login em {redirectSeconds}...
										</p>
									</motion.div>
								) : (
									// Formulário de Registro
									<motion.div
										key="register-form"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.3 }}
									>
										<h2 className="text-2xl font-bold text-center mb-6 font-zen-dots">
											Criar uma nova conta
										</h2>
										<form onSubmit={handleRegister} className="space-y-5">
											{/* Name Input */}
											<motion.div variants={pageAnimations.item}>
												<div className="relative">
													<RiUserLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
													<Input
														id="register-name"
														type="text"
														placeholder="Seu nome"
														required
														value={registerData.name}
														onChange={(e) =>
															setRegisterData({
																...registerData,
																name: e.target.value,
															})
														}
														disabled={isButtonDisabled}
														className="pl-10 pr-4 py-2 w-full rounded-md focus:outline-none focus:ring-2 bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-[#9137c6] focus:border-[#9137c6] transition duration-200 font-montserrat"
													/>
												</div>
											</motion.div>

											{/* Email Input */}
											<motion.div variants={pageAnimations.item}>
												<div className="relative">
													<RiMailLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
													<Input
														id="register-email"
														type="email"
														placeholder="seu@email.com"
														required
														value={registerData.email}
														onChange={(e) =>
															setRegisterData({
																...registerData,
																email: e.target.value,
															})
														}
														disabled={isButtonDisabled}
														className="pl-10 pr-4 py-2 w-full rounded-md focus:outline-none focus:ring-2 bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-[#9137c6] focus:border-[#9137c6] transition duration-200 font-montserrat"
													/>
												</div>
											</motion.div>

											{/* Password Input */}
											<motion.div variants={pageAnimations.item}>
												<div className="relative">
													<RiLockLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
													<Input
														id="register-password"
														type={showPassword ? "text" : "password"}
														placeholder="Crie uma senha"
														required
														value={registerData.password}
														onChange={(e) =>
															setRegisterData({
																...registerData,
																password: e.target.value,
															})
														}
														disabled={isButtonDisabled}
														className="pl-10 pr-10 py-2 w-full rounded-md focus:outline-none focus:ring-2 bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-[#9137c6] focus:border-[#9137c6] transition duration-200 font-montserrat"
													/>
													<button
														type="button"
														onClick={() => setShowPassword(!showPassword)}
														className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
														aria-label={
															showPassword ? "Ocultar senha" : "Mostrar senha"
														}
													>
														{showPassword ? (
															<FiEyeOff size={20} />
														) : (
															<FiEye size={20} />
														)}
													</button>
												</div>
											</motion.div>

											{/* Confirm Password Input */}
											<motion.div variants={pageAnimations.item}>
												<div className="relative">
													<RiLockLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
													<Input
														id="register-confirm-password"
														type={showConfirmPassword ? "text" : "password"}
														placeholder="Confirme a senha"
														required
														value={registerData.confirmPassword}
														onChange={(e) =>
															setRegisterData({
																...registerData,
																confirmPassword: e.target.value,
															})
														}
														disabled={isButtonDisabled}
														className="pl-10 pr-10 py-2 w-full rounded-md focus:outline-none focus:ring-2 bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-[#9137c6] focus:border-[#9137c6] transition duration-200 font-montserrat"
													/>
													<button
														type="button"
														onClick={() =>
															setShowConfirmPassword(!showConfirmPassword)
														}
														className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
														aria-label={
															showConfirmPassword
																? "Ocultar senha"
																: "Mostrar senha"
														}
													>
														{showConfirmPassword ? (
															<FiEyeOff size={20} />
														) : (
															<FiEye size={20} />
														)}
													</button>
												</div>
											</motion.div>

											{/* Error Message */}
											<AnimatePresence>
												{registerError && (
													<motion.div
														initial={{ opacity: 0, y: -10 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -10 }}
														className="text-red-500 text-sm mt-3 flex items-center gap-2 font-montserrat"
													>
														<FiAlertCircle size={18} />
														<span>{registerError}</span>
													</motion.div>
												)}
											</AnimatePresence>

											{/* Register Button */}
											<motion.div variants={pageAnimations.item}>
												<Button
													type="submit"
													disabled={isButtonDisabled}
													className={`w-full py-3 px-6 rounded-lg font-medium text-white
                              transition-all transform hover:scale-[1.02] active:scale-[0.98]
                              ${isButtonDisabled ? "opacity-60 cursor-not-allowed" : ""}
                              bg-gradient-to-r from-[#9137c6] to-[#7046c0] hover:from-[#7046c0] hover:to-[#9137c6] shadow-lg shadow-[#9137c6]/30 font-montserrat
                            `}
												>
													<div className="flex items-center justify-center">
														{isFormLoading ? (
															<>
																<svg
																	className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 24 24"
																>
																	<circle
																		className="opacity-25"
																		cx="12"
																		cy="12"
																		r="10"
																		stroke="currentColor"
																		strokeWidth="4"
																	></circle>
																	<path
																		className="opacity-75"
																		fill="currentColor"
																		d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
																	></path>
																</svg>
																<span>Registrando...</span>
															</>
														) : (
															<>
																<span>Registrar</span>
																<motion.div
																	className="ml-2 inline-block"
																	animate={{ x: [0, 5, 0] }}
																	transition={{
																		repeat: Number.POSITIVE_INFINITY,
																		duration: 1.5,
																		repeatDelay: 0.5,
																	}}
																>
																	<FiArrowRight size={20} />
																</motion.div>
															</>
														)}
													</div>
												</Button>
											</motion.div>
										</form>
									</motion.div>
								)}
							</AnimatePresence>
						</TabsContent>

						{/* Conteúdo da aba de Esqueci a Senha */}
						<TabsContent value="forgot">
							<AnimatePresence mode="wait">
								{showForgotSuccess ? (
									// Mensagem de sucesso de forgot password
									<motion.div
										key="forgot-success"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.3 }}
										className="text-center text-green-500 mb-6 flex flex-col items-center"
									>
										<FiCheckCircle size={40} className="mb-3" />
										<h3 className="text-xl font-bold mb-2 font-zen-dots text-foreground">
											Email enviado!
										</h3>
										<p className="text-muted-foreground font-montserrat">
											Verifique sua caixa de entrada para redefinir sua senha.
										</p>
										<p className="mt-3 text-sm font-montserrat">
											Redirecionando para login em {redirectSeconds}...
										</p>
									</motion.div>
								) : (
									// Formulário de Esqueci a Senha
									<motion.div
										key="forgot-form"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.3 }}
									>
										<h2 className="text-2xl font-bold text-center mb-6 font-zen-dots">
											Esqueceu sua senha?
										</h2>
										<p className="text-center text-muted-foreground mb-6 font-montserrat">
											Digite seu email para receber um link de redefinição de
											senha.
										</p>
										<form onSubmit={handleForgotPassword} className="space-y-5">
											{/* Email Input */}
											<motion.div variants={pageAnimations.item}>
												<div className="relative">
													<RiMailLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
													<Input
														id="forgot-email"
														type="email"
														placeholder="seu@email.com"
														required
														value={forgotEmail}
														onChange={(e) => setForgotEmail(e.target.value)}
														disabled={isButtonDisabled}
														className="pl-10 pr-4 py-2 w-full rounded-md focus:outline-none focus:ring-2 bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-[#9137c6] focus:border-[#9137c6] transition duration-200 font-montserrat"
													/>
												</div>
											</motion.div>

											{/* Error Message */}
											<AnimatePresence>
												{forgotPasswordError && (
													<motion.div
														initial={{ opacity: 0, y: -10 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -10 }}
														className="text-red-500 text-sm mt-3 flex items-center gap-2 font-montserrat"
													>
														<FiAlertCircle size={18} />
														<span>{forgotPasswordError}</span>
													</motion.div>
												)}
											</AnimatePresence>

											{/* Send Link Button */}
											<motion.div variants={pageAnimations.item}>
												<Button
													type="submit"
													disabled={isButtonDisabled}
													className={`w-full py-3 px-6 rounded-lg font-medium text-white
                              transition-all transform hover:scale-[1.02] active:scale-[0.98]
                              ${isButtonDisabled ? "opacity-60 cursor-not-allowed" : ""}
                              bg-gradient-to-r from-[#9137c6] to-[#7046c0] hover:from-[#7046c0] hover:to-[#9137c6] shadow-lg shadow-[#9137c6]/30 font-montserrat
                            `}
												>
													<div className="flex items-center justify-center">
														{isFormLoading ? (
															<>
																<svg
																	className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 24 24"
																>
																	<circle
																		className="opacity-25"
																		cx="12"
																		cy="12"
																		r="10"
																		stroke="currentColor"
																		strokeWidth="4"
																	></circle>
																	<path
																		className="opacity-75"
																		fill="currentColor"
																		d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
																	></path>
																</svg>
																<span>Enviando...</span>
															</>
														) : (
															<>
																<span>Enviar link</span>
																<motion.div
																	className="ml-2 inline-block"
																	animate={{ x: [0, 5, 0] }}
																	transition={{
																		repeat: Number.POSITIVE_INFINITY,
																		duration: 1.5,
																		repeatDelay: 0.5,
																	}}
																>
																	<FiArrowRight size={20} />
																</motion.div>
															</>
														)}
													</div>
												</Button>
											</motion.div>
										</form>
									</motion.div>
								)}
							</AnimatePresence>
						</TabsContent>
					</Tabs>

					{/* Termos e Política - Footer */}
					<motion.div
						variants={pageAnimations.item}
						initial="hidden"
						animate="visible"
						transition={{ delay: 0.9 }}
						className="mt-6 text-center text-sm text-muted-foreground font-montserrat"
					>
						Ao usar este serviço, você concorda com nossos{" "}
						<Link href="#" className="text-[#9137c6] hover:underline">
							Termos de Serviço
						</Link>{" "}
						e{" "}
						<Link href="#" className="text-[#9137c6] hover:underline">
							Política de Privacidade
						</Link>
						.
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
