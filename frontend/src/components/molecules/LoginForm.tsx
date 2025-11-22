import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../atoms/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "../atoms/input";
import { useAuth } from "@/contexts/useAuth";

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);

    setIsLoading(false);

    if (success) {
      toast.success("Login bem-sucedido!", {
        description: "Redirecionando para o Dashboard...",
      });
      navigate("/", { replace: true });
    } else {
      toast.error("Erro de Login", {
        description:
          "Credenciais inválidas ou falha de conexão com o servidor (verifique http://localhost:3000).",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu.email@exemplo.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="mt-2"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Palavra-passe</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="mt-2"
        />
      </div>
      <Button type="submit" className="w-full h-12" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-4 h-4 w-4 animate-spin" />A iniciar sessão...
          </>
        ) : (
          "Entrar no Sistema"
        )}
      </Button>
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-2">
        Assegure-se de que o backend está rodando em http://localhost:3000.
      </p>
    </form>
  );
};
