import { useState, useMemo} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/atoms/alert-dialog";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Badge } from "@/components/atoms/badge";
import { Pencil, Trash2, Search, Filter } from "lucide-react";
import type { User } from "@/services/users";
import { Pagination } from "@/components/molecules/Pagination";
import { Card, CardContent, CardFooter } from "@/components/atoms/card";

interface UsersListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

type UserRole = "all" | User["role"];

export const UsersList = ({ users, onEdit, onDelete }: UsersListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("all");
  const pageSize = 8;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [currentPage, filteredUsers]);

  const roleColors: Record<User["role"], string> = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  };

  const roleLabels: Record<User["role"], string> = {
    admin: "Administrador",
    user: "Usuário",
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por permissão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as permissões</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredUsers.length === 0 ? (
          searchTerm || selectedRole !== "all" ? (
            "Nenhum usuário encontrado com os filtros atuais."
          ) : (
            "Nenhum usuário cadastrado."
          )
        ) : (
          `Mostrando ${paginatedUsers.length} de ${filteredUsers.length} usuário(s)`
        )}
      </div>

      {paginatedUsers.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent>
            <div className="text-muted-foreground">
              {searchTerm || selectedRole !== "all" ? (
                <>
                  <p className="mb-2">Nenhum usuário encontrado</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedRole("all");
                    }}
                  >
                    Limpar filtros
                  </Button>
                </>
              ) : (
                <p>Nenhum usuário cadastrado no sistema</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedUsers.map((user) => (
              <Card key={user._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg truncate" title={user.email}>
                          {user.email}
                        </h3>
                        <Badge 
                          className={roleColors[user.role]}
                          variant="secondary"
                        >
                          {roleLabels[user.role]}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">ID:</span>
                        <code className="font-mono bg-muted px-2 py-1 rounded text-xs">
                          {user._id ? `${user._id.substring(0, 10)}...` : "N/A"}
                        </code>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t">
                  <div className="flex justify-end gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Excluir usuário?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O usuário{" "}
                            <span className="font-semibold text-foreground">
                              {user.email}
                            </span>{" "}
                            será permanentemente removido do sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => user._id && onDelete(user._id)}
                          >
                            Confirmar exclusão
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          {filteredUsers.length > pageSize && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};