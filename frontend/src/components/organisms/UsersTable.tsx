import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
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
import { Pencil, Trash2 } from "lucide-react";
import { RoleBadge } from "@/components/molecules/RoleBadge";
import type { User } from "@/services/users";
import { Pagination } from "@/components/molecules/Pagination";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export const UsersTable = ({ users, onEdit, onDelete }: UsersTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(users.length / pageSize);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [currentPage, users]);

  return (
    <div className="rounded-md border overflow-x-auto w-full dark:black dark:border-gray-700">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">E-mail</TableHead>
            <TableHead className="min-w-[120px]">Permissão</TableHead>
            <TableHead className="w-[100px] min-w-[100px]">ID</TableHead>
            <TableHead className="text-right w-[120px] min-w-[120px]">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedUsers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            paginatedUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {user.email}
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <RoleBadge role={user.role} />
                </TableCell>

                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {user._id ? `${user._id.substring(0, 8)}...` : "N/A"}
                </TableCell>

                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4 text-primary" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          title="Excluir"
                          disabled={!user._id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Tem certeza absoluta?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá
                            permanentemente o usuário
                            <span className="font-bold text-foreground">
                              {" "}
                              {user.email}
                            </span>
                            .
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => user._id && onDelete(user._id)}
                          >
                            Sim, excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {users.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
