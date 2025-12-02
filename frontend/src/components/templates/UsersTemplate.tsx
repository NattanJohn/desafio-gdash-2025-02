import { Button } from "@/components/atoms/button";

type UsersTemplateProps = {
  children: React.ReactNode;
  onCreate: () => void;
};

export const UsersTemplate = ({ children, onCreate }: UsersTemplateProps ) => {
  return (
    <main className="grow p-4 md:p-8 w-full dark:bg-neutral-900">
      <div
        className="
          mb-8 flex flex-col gap-4 
          md:flex-row md:justify-between md:items-center
          border-b pb-4 dark:border-gray-700
        "
      >
        <div className="md:ml-0 ml-16">
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            Gestão de Usuários
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie quem pode acessar o sistema.
          </p>
        </div>

        <div className="w-full md:w-auto">
          <Button onClick={onCreate} className="w-full md:w-auto">
            Novo Usuário
          </Button>
        </div>
      </div>

      {children}
    </main>
  );
};

