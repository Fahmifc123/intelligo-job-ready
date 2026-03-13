import React, { useEffect } from "react";
import { ControlForm } from "@/components/custom/forms";
import { USER_ROLE } from "@/constants/app-enum";

type Props = {
  values: any; // or better: Record<string, any>
  form: any;   // ideally typed from useForm<...>
  showPassword?: boolean;
  readOnly?: boolean;
  vesselOptionsMap?: { [key: string]: any[] }; // Map of vessels by contractorId
};

const FormUserAdd = ({ values, form, showPassword = true, vesselOptionsMap = {}, ...props }: any) => {
  const user_role = form.watch("role");

  return (
    <div className={"flex flex-col gap-4 w-full"}>
      {/* name */}
      <ControlForm form={form} item={values?.name} disabled={props.readOnly ?? false} />

      {/* email */}
      <ControlForm form={form} item={values?.email} />

      {/* password */}
      {showPassword && <ControlForm form={form} item={values?.password} />}

      {/* role */}
      <ControlForm form={form} item={values?.role} />
    </div>
  );
}
export default FormUserAdd