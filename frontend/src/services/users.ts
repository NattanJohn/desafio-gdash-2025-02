import { apiRequest } from "@/services/api";

export interface User {
  _id: string;
  email: string;
  role: "user" | "admin";
  createdAt?: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  role: "user" | "admin";
}

export const UsersService = {
  list(token: string) {
    return apiRequest<User[]>("/users", "GET", token);
  },

  getById(id: string, token: string) {
    return apiRequest<User>(`/users/${id}`, "GET", token);
  },

  create(data: UserFormData, token: string) {
    return apiRequest<User>("/users", "POST", token ?? undefined, data);
  },

  update(id: string, data: UserFormData, token: string) {
    return apiRequest<User>(`/users/${id}`, "PATCH", token, data);
  },

  delete(id: string, token: string) {
    return apiRequest(`/users/${id}`, "DELETE", token);
  },
};
