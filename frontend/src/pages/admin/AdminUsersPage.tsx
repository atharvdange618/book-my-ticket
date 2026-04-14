import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Trash } from "@phosphor-icons/react";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Facehash } from "facehash";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminApi } from "@/api/admin.api";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types";
import { formatDate, getErrorMessage } from "@/lib/utils";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminApi.getUsers,
  });

  const { mutate: deleteUserMutation, isPending } = useMutation({
    mutationFn: (userId: number) => adminApi.deleteUser(userId),
    onSuccess: (data) => {
      gooeyToast.success(data.message, {
        description: `${data.deletedUser.name} (${data.deletedUser.email}) has been permanently removed`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteDialog({ open: false, user: null });
    },
    onError: (err: unknown) => {
      gooeyToast.error(getErrorMessage(err, "Failed to delete user"));
    },
  });

  const handleDeleteClick = (user: User) => {
    setDeleteDialog({ open: true, user });
  };

  const confirmDelete = () => {
    if (deleteDialog.user) {
      deleteUserMutation(deleteDialog.user.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold flex items-center gap-2">
          <Users size={20} />
          Users
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {users ? `${users.length} registered users` : "Loading…"}
        </p>
      </div>

      <div className="border border-border/60 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (users ?? []).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-10"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              (users ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Facehash
                        name={u.name}
                        size={32}
                        enableBlink
                        colorClasses={["bg-primary"]}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {u.name}
                          {u.id === currentUser?.id && (
                            <span className="ml-1.5 text-xs text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                      className="text-xs capitalize"
                    >
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.created_at ? formatDate(u.created_at) : "-"}
                  </TableCell>
                  <TableCell>
                    {u.id !== currentUser?.id && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={isPending}
                        onClick={() => handleDeleteClick(u)}
                      >
                        <Trash size={14} className="mr-1" />
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteDialog.user?.name}</strong> (
              {deleteDialog.user?.email})?
              <br />
              <span className="text-destructive font-medium mt-2 block">
                This will permanently delete the user and all their bookings.
                This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, user: null })}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
