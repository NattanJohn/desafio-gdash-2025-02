import { Link } from 'react-router-dom'; // Importante para navegação SPA
import { AuthTemplate } from "@/components/templates/AuthTemplate.tsx";
import { RegisterForm } from "@/components/organisms/RegisterForm.tsx";

const Register = () => {
    return (
        <AuthTemplate
            title="Crie sua conta"
            subtitle="Preencha os dados abaixo para começar a usar o GDASH."
            showRegisterLink={false} // Esconde o link padrão do template
        >
            <RegisterForm />
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-100 dark:border-gray-700">
                Já tem uma conta?
                <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 ml-1 transition-colors">
                    Faça login
                </Link>
            </div>
        </AuthTemplate>
    );
};

export default Register;