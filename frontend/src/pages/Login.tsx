import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthTemplate } from "../components/templates/AuthTemplate.tsx";
import { LoginForm } from "../components/molecules/LoginForm.tsx";
import { useAuth } from '@/contexts/useAuth.ts';

const Login = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);
    if (isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                <p className="text-lg text-gray-700 dark:text-gray-300">A redirecionar para a Dashboard...</p>
            </div>
        );
    }
    return (
        <AuthTemplate
            title="Bem-vindo(a) de volta"
            subtitle="Insira suas credenciais para continuar."
        >
            <LoginForm />
        </AuthTemplate>
    );
};

export default Login;