import React, { type ReactNode } from "react";
import { Cloud } from "lucide-react";

interface AuthTemplateProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  showRegisterLink?: boolean;
}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({ 
    title, 
    subtitle, 
    children, 
    showRegisterLink = true 
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-start items-center">
          <div className="flex items-center space-x-2">
            <Cloud className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">GDASH</span>
          </div>
        </div>
      </header>

      <main className="grow flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-500 transition-all duration-300">
            
            <div className="space-y-2 text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            </div>
            {children}
            {showRegisterLink && (
              <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-100 dark:border-gray-700">
                Não tem uma conta?
                <a href="#" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 ml-1 transition-colors">
                  Crie uma aqui
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} GDASH.
        </div>
      </footer>
    </div>
  );
};