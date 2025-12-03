import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { UsersService } from "@/services/users";
import type { UserFormData } from "@/services/users";

export const RegisterForm = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.warning("As senhas não coincidem.");
            return;
        }

        if (formData.password.length < 6) {
            toast.warning("A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        setIsLoading(true);

        try {
            const payload: UserFormData = {
                email: formData.email,
                password: formData.password,
                role: "user",
            };
            
            await UsersService.create(payload, "");

            toast.success("Conta criada com sucesso!", {
                description: "Faça login para acessar o sistema.",
            });

            navigate("/login");

        } catch (error: unknown) {
            console.error(error);

            let errorMessage = "Não foi possível conectar ao servidor.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error("Erro no Registro", {
                description: errorMessage,
            });

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    required
                    disabled={isLoading}
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="******"
                    required
                    disabled={isLoading}
                    value={formData.password}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="******"
                    required
                    disabled={isLoading}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
            </div>

            <Button type="submit" className="w-full gap-2 mt-4" disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <UserPlus className="h-5 w-5" />
                )}
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
        </form>
    );
};
