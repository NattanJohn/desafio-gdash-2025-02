import { Badge } from "@/components/atoms/badge";

export function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";

  return (
    <Badge 
      variant={isAdmin ? "default" : "secondary"}
      className={isAdmin 
        ? "bg-purple-600 hover:bg-purple-700" 
        : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
      }
    >
      {isAdmin ? "Administrador" : "Usuário"}
    </Badge>
  );
}