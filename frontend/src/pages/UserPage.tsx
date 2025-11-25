import { useEffect, useState } from "react";
import { Sidebar } from "../components/organisms/Sidebar";
import { UsersTable } from "../components/organisms/UsersTable";
import { UserDialog } from "../components/organisms/UserDialog";
import { UsersTemplate } from "../components/templates/UsersTemplate";
import { UsersService, type User, type UserFormData } from "../services/users";
import { useAuth } from "../contexts/useAuth";
import { useSidebar } from "../contexts/SidebarContext";
import { toast } from "sonner";

const UsersPage = () => {
  const { token, logout } = useAuth();
  const { collapsed } = useSidebar();
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadUsers = async (): Promise<void> => {
    if (!token) return;
    try {
      const data = await UsersService.list(token);
      setUsers(data);
    } catch {
      toast.error("Erro ao carregar usuários");
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      await loadUsers();
    };

    fetchData();
  }, [token]);



  const handleSave = async (data: UserFormData): Promise<void> => {
    if (!token) return;

    try {
      if (editingUser) {
        await UsersService.update(editingUser._id, data, token);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await UsersService.create(data, token);
        toast.success("Usuário criado com sucesso!");
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar o usuário";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!token) return;

    try {
      await UsersService.delete(id, token);
      toast.success("Usuário removido.");
      await loadUsers();
    } catch {
      toast.error("Erro ao excluir usuário");
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans">
      <Sidebar logout={logout} />

      <div
        className={`
          flex-1 transition-all duration-300
          ${collapsed ? "md:ml-20" : "md:ml-72"}
        `}
      >
        <UsersTemplate onCreate={handleOpenCreate}>
          <UsersTable
            users={users}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        </UsersTemplate>

        <UserDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          initialData={editingUser}
          onSubmit={handleSave}
        />
      </div>
    </div>
  );
};

export default UsersPage;
