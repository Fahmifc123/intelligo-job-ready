import { DataTable, DataTableColumnHeader, DataTableFilter, DataTablePagination, DataTableViewOptions, DataTableViewUnique, useDataTable } from "@/components/custom/table";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoMenu } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CiTrash, CiEdit, CiLock } from "react-icons/ci";
import { LuShield, LuUser } from "react-icons/lu";
import { createRowNumberColumn } from "@/components/custom/table/data-table";

type Props = {
  data: any[];
  loading: boolean;
  dataLoading?: boolean;
  onCreateClicked: () => void;
  onDeleteClicked: (row: any) => void;
  onEditClicked: (row: any) => void;
  onPasswordChange: (row: any) => void;
  toolbarNew?: React.ReactNode;
  pagination?: {
    page: number;
    view: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onViewChange?: (view: number) => void;
}

const TableUser = ({ 
  data, 
  loading, 
  dataLoading = false, 
  onDeleteClicked, 
  onEditClicked, 
  onPasswordChange, 
  toolbarNew,
  pagination,
  onPageChange,
  onViewChange
}: Props) => {
  const { t } = useTranslation();
  const headerClassNames = "";

  const columns = useMemo(() => [
    createRowNumberColumn({ accessorKey: "rowNum", id: "rowNum" }),
    {
      accessorKey: "name",
      enableSorting: true,
      size: 150,
      meta: {
        label: t("admin.users.form.name.label"),
      },
      header: ({ column }: any) => {
        return (<DataTableColumnHeader column={column} title={t("admin.users.form.name.label")} className={`${headerClassNames}`} />)
      },
      cell: ({ cell, row }: any) => (
        <div>
          <div className={"break-all"}>
            {cell.getValue()}
          </div>
        </div>
      )
    },
    {
      accessorKey: "email",
      enableSorting: true,
      size: 200,
      meta: {
        label: t("admin.users.form.email.label"),
      },
      header: ({ column }: any) => {
        return (<DataTableColumnHeader column={column} title={t("admin.users.form.email.label")} className={`${headerClassNames}`} />)
      },
      cell: ({ cell }: any) => (
        <div className={"break-all"}>
          {cell.getValue()}
        </div>
      )
    },
    {
      accessorKey: "role",
      size: 100,
      enableSorting: true,
      header: ({ column }: any) => {
        return (<DataTableColumnHeader column={column} title={t("admin.users.form.role.label")} className={`${headerClassNames}`} />)
      },
      meta: {
        label: t("admin.users.form.role.label"),
      },
      cell: ({ cell }: any) => {
        const role_ = cell.getValue();
        let badgeConfig = {
          className: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-colors duration-200",
          icon: <LuUser className="h-3 w-3 mr-1" />
        };

        if (role_ === "admin") {
          badgeConfig = {
            className: "bg-destructive text-white border-0 shadow-sm hover:bg-destructive/90 transition-all duration-200",
            icon: <LuShield className="h-3 w-3 mr-1" />
          };
        }
        else if (role_ === "user") {
          badgeConfig = {
            className: "bg-green-600 dark:bg-green-700 text-white border-0 shadow-sm hover:bg-green-700 dark:hover:bg-green-800 transition-all duration-200",
            icon: <LuUser className="h-3 w-3 mr-1" />
          };
        }

        return (
          <Badge className={`px-3 py-1 font-medium text-xs rounded-full flex items-center w-fit ${badgeConfig.className}`}>
            {badgeConfig.icon}
            {role_?.charAt(0).toUpperCase() + role_?.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: "action",
      size: 80,
      enableSorting: false,
      header: ({ column }: any) => {
        return (<div className="flex items-center justify-center"><DataTableColumnHeader column={column} title={t("shared.actions")} className={`${headerClassNames}`} /></div>)
      },
      cell: ({ row }: any) => {
        const isDisabled = loading || dataLoading;
        
        return (
          <div
            className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size={"icon"} disabled={isDisabled}><IoMenu /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" side="bottom" align="start">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => onEditClicked(row.original)} disabled={isDisabled}>
                    <CiEdit /> {t("shared.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPasswordChange(row.original)} disabled={isDisabled}>
                    <CiLock /> {t("labels.changePassword")}
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem onClick={() => onDeleteClicked(row.original)} className={"text-destructive"} disabled={isDisabled}>
                    <CiTrash className={"text-destructive"} /> {t("shared.delete")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      meta: {
        label: t("shared.actions"),
      }
    },

  ], [])

  const { table } = useDataTable({
    data: data || [],
    columns,
    pageCount: pagination?.totalPages || -1,
    initialState: {
      columnPinning: { left: ["rowNum"], right: ["action"] },
      pagination: { 
        pageIndex: (pagination?.page || 1) - 1, // Convert to 0-based index
        pageSize: pagination?.view || 10 
      },
    },
    manualSorting: false,
    manualPagination: true,
    manualFiltering: false,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex: (pagination?.page || 1) - 1,
          pageSize: pagination?.view || 10
        });
        
        if (onPageChange) {
          onPageChange(newState.pageIndex + 1); // Convert back to 1-based index
        }
        
        if (onViewChange && newState.pageSize !== (pagination?.view || 10)) {
          onViewChange(newState.pageSize);
        }
      } else {
        if (onPageChange) {
          onPageChange(updater.pageIndex + 1); // Convert back to 1-based index
        }
        
        if (onViewChange && updater.pageSize !== (pagination?.view || 10)) {
          onViewChange(updater.pageSize);
        }
      }
    },
  });

  return (
    <div className={"px-4"}>
      {data && <DataTable
        table={table}
        styles={{container: {default: "border"}}}
      >
        <div className={"flex flex-row gap-2 justify-between"}>
          <div className={"flex flex-row gap-2"}>
            <DataTableFilter table={table} searchColumnIds={[]} searchPlaceholder={t("shared.searchPlaceholder") || "Search ..."} />
            <DataTableViewUnique
              table={table}
              columnId="role"
              title={t("admin.users.form.role.label")}
            />
            <DataTableViewOptions table={table} />
          </div>
          {toolbarNew}
        </div>
        
        <DataTablePagination
          pageIndex={table.getState().pagination.pageIndex}
          setPageIndex={table.setPageIndex}
          pageSize={table.getState().pagination.pageSize}
          setPageSize={table.setPageSize}
          rowsCount={data.length}
          paginationData={pagination ? {
            page: pagination.page,
            limit: pagination.view,
            total: pagination.total,
            totalPages: pagination.totalPages,
          } : undefined}
          onPaginationChange={(paginationData) => {
            if (onPageChange) {
              onPageChange(paginationData.page);
            }
            if (onViewChange) {
              onViewChange(paginationData.limit);
            }
          }}
          className="mt-4"
        />
      </DataTable>
      }
    </div>
  );
}

export default TableUser