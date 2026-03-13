import { createFileRoute } from '@tanstack/react-router'
import { showNotifError, showNotifSuccess } from "@/lib/show-notif";
import { SkeTable } from "@/components/custom/skeleton";
import { DialogModal, DialogModalForm, ModalFormProps, ModalProps } from "@/components/custom/components";
import { FormUserAdd, TableUser, FormUserEdit, FormPasswordUpdate, onUserCreated, onUserUpdated, onUserPasswordChanged } from '@/components/pages/admin/user';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAdminChangePassword,
  useAdminUserCreate,
  useAdminUserDelete,
  useAdminUserList,
  useAdminUserPut
} from "@/service/admin-users-api";
import { useEffect, useState } from "react";
import { LuUserPlus, LuUsers, LuShield } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute('/_private/admin/__users/users')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const queryClient = useQueryClient();

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    view: 10,
  });

  const userListQuery = useAdminUserList(pagination);
  const userCreateMutation = useAdminUserCreate();
  const userPutMutation = useAdminUserPut();
  const userDeleteMutation = useAdminUserDelete();
  const userUpdatePasswordMutation = useAdminChangePassword();

  const [confirmationCreate, setConfirmationCreate] = useState<ModalFormProps | null>(null);
  const [confirmationPut, setConfirmationPut] = useState<ModalFormProps | null>(null);
  const [confirmationDelete, setConfirmationDelete] = useState<ModalProps | null>(null);
  const [confirmationUpdatePassword, setConfirmationUpdatePassword] = useState<ModalFormProps | null>(null);

  const isLoading = () => {
    return (
      // || contractorListQuery.isPending
      (userDeleteMutation.isPending || userCreateMutation.isPending || userPutMutation.isPending || userListQuery.isPending)
    )
  }

  const onDeleteData = (item: any) => {
    setConfirmationDelete({
      title: t("admin.users.deleteUser.title"),
      desc: t("admin.users.deleteUser.description"),
      content: <div>{t("admin.users.deleteUser.confirmationPrefix")}<span
        className={"font-bold text-primary"}>{item?.email ?? ""}</span>{t("admin.users.deleteUser.confirmationSuffix")}</div>,
      textConfirm: t("admin.users.deleteUser.confirmText"),
      textCancel: t("admin.users.deleteUser.cancelText"),
      onConfirmClick: () => {
        userDeleteMutation.mutate(
          { body: { userId: item?.id } },
          {
            onSuccess: (data) => {
              queryClient.invalidateQueries({ queryKey: ['admin-user-list'] });
              showNotifSuccess({ message: data?.message || t("admin.users.deleteUser.successMessage") });
            },
            onError: (error: any) => showNotifError({ message: (error?.response?.data?.message || error?.response?.data?.error) ?? error?.message }),
          }
        );
        setConfirmationDelete(null);
      },
      onCancelClick: () => setConfirmationDelete(null),
    })
  }

  const onDataCreated = () => {
    onUserCreated(
      setConfirmationCreate,
      (body: { name: string; email: string; password: string; role: string }) => {
        userCreateMutation.mutate({ body }, {
          onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-user-list'] });
            showNotifSuccess({ message: data?.message || t("admin.users.createUser.successMessage") });
            setConfirmationCreate(null);
          },
          onError: (error: any) => {
            showNotifError({ message: (error?.response?.data?.message || error?.response?.data?.error) ?? error?.message })
          },
        });
      },
      FormUserAdd,
      t
    );
  };

  const onDataPut = (item: any) => {
    onUserUpdated(
      item,
      setConfirmationPut,
      (id: string, body: { name: string; role: string }) => {
        userPutMutation.mutate({ id, body }, {
          onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-user-list'] });
            showNotifSuccess({ message: data?.message || t("admin.users.updateUser.successMessage") });
            setConfirmationPut(null);
          },
          onError: (error: any) => {
            showNotifError({ message: (error?.response?.data?.message || error?.response?.data?.error) ?? error?.message })
          },
        });
      },
      FormUserEdit,
      t
    );
  };

  const onPasswordChange = (item: any) => {
    onUserPasswordChanged(
      item,
      setConfirmationUpdatePassword,
      (body: { userId: string; newPassword: string }) => {
        userUpdatePasswordMutation.mutate({ body }, {
          onSuccess: (data) => {
            showNotifSuccess({ message: data?.message || t("admin.users.updatePassword.successMessage") });
            setConfirmationUpdatePassword(null);
          },
          onError: (error: any) => {
            showNotifError({ message: (error?.response?.data?.message || error?.response?.data?.error) ?? error?.message })
          },
        });
      },
      FormPasswordUpdate,
      t
    );
  }

  const ViewAddUser = () => {
    const isDataLoading = false;
    
    return (
      <Button
        variant={"default"}
        onClick={onDataCreated}
        disabled={isLoading() || isDataLoading}
        className="bg-primary hover:bg-primary/90 shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
      >
        {isLoading() || isDataLoading ? (
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
        ) : (
          <LuUserPlus className="mr-2 h-4 w-4" />
        )}
        {t("shared.userAdd")}
      </Button>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LuUsers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("admin.users.pageTitle")}</h1>
              <p className="text-muted-foreground mt-1">{t("admin.users.pageSubtitle")}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {userListQuery.isSuccess && (
              <Badge variant="secondary" className="px-3 py-1">
                <LuShield className="h-3 w-3 mr-1" />
                {userListQuery.data?.pagination?.total || userListQuery.data?.data?.length || 0} {t("admin.users.userCount")}
              </Badge>
            )}
            <ViewAddUser />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <Card className="shadow-lg border-border">
        <CardContent className="p-0">
          {(userListQuery.isPending) && (
            <div className="p-8">
              <SkeTable />
            </div>
          )}

          {userListQuery.isError && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
                <LuUsers className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t("admin.users.errorLoading")}</h3>
              <p className="text-destructive">{userListQuery?.error?.message}</p>
            </div>
          )}

          {(userListQuery.isSuccess) && (
            <div className="rounded-lg overflow-hidden p-2">
              <TableUser
                data={userListQuery?.data?.data || []}
                onCreateClicked={onDataCreated}
                onEditClicked={onDataPut}
                onDeleteClicked={(item: any) => onDeleteData(item)}
                onPasswordChange={(item: any) => onPasswordChange(item)}
                loading={isLoading()}
                dataLoading={false}
                pagination={userListQuery.data.pagination}
                onPageChange={(newPage: number) => setPagination(prev => ({ ...prev, page: newPage }))}
                onViewChange={(newView: number) => setPagination(prev => ({ ...prev, view: newView, page: 1 }))}
              // toolbarNew={<ViewAddUser/>}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {confirmationCreate && <DialogModalForm modal={confirmationCreate} />}
      {confirmationPut && <DialogModalForm modal={confirmationPut} />}
      {confirmationUpdatePassword && <DialogModalForm modal={confirmationUpdatePassword} />}
      {confirmationDelete && <DialogModal modal={confirmationDelete} variantSubmit={"destructive"} />}
    </div>
  )
}