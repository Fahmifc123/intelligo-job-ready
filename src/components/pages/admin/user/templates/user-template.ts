import { ModalFormProps } from "@/components/custom/components";
import { z } from "zod"
import React from "react";
import { USER_ROLE } from "@/constants/app-enum";

// Define a function to create form data with dynamic options
const createUserData = ([], [], [], t: any) => {
    return {
        form: {
            name: {
                type: "text",
                name: "name",
                label: t("admin.users.form.name.label"),
                placeholder: t("admin.users.form.name.placeholder"),
            },
            email: {
                type: "email",
                name: "email",
                label: t("admin.users.form.email.label"),
                placeholder: t("admin.users.form.email.placeholder"),
            },
            password: {
                type: "password",
                name: "password",
                label: t("admin.users.form.password.label"),
                placeholder: t("admin.users.form.password.placeholder"),
            },
            role: {
                type: "select",
                name: "role",
                label: t("admin.users.form.role.label"),
                placeholder: t("admin.users.form.role.placeholder"),
                options: Object.values(USER_ROLE)
            }
        },
        schema: {
            name: z.string().min(1, t("admin.users.form.name.required")),
            email: z.string().email(t("admin.users.form.email.invalid")).min(1, t("admin.users.form.email.required")),
            password: z.string({ required_error: t("admin.users.form.password.required") }).min(8, t("admin.users.form.password.minLength")),
            role: z.string().min(1, t("admin.users.form.role.required"))
        },
        defaultValue: {
            name: "",
            email: "",
            password: "",
            role: "",
        }
    }
};

const editUserData = ([], t: any) => {
    return ({
        form: {
            name: {
                type: "text",
                name: "name",
                label: t("admin.users.form.name.label"),
                placeholder: t("admin.users.form.name.placeholder"),
            },
            email: {
                type: "email",
                name: "email",
                label: t("admin.users.form.email.label"),
                placeholder: t("admin.users.form.email.placeholder"),
            },
            role: {
                type: "select",
                name: "role",
                label: t("admin.users.form.role.label"),
                placeholder: t("admin.users.form.role.placeholder"),
                options: Object.values(USER_ROLE)
            },
        },
        schema: {
            name: z.string().min(1, t("admin.users.form.name.required")),
            email: z.optional(z.string()),
            role: z.optional(z.string())
        },
        defaultValue: {
            name: "",
            email: "",
            role: ""
        }
    });
}

const createChangePasswordData = (t: any) => {
    return {
        form: {
            password: {
                type: "password",
                name: "password",
                label: t("admin.users.form.password.label"),
                placeholder: t("admin.users.form.password.placeholder"),
            },
            confirmPassword: {
                type: "password",
                name: "confirmPassword",
                label: t("admin.users.form.confirmPassword.label"),
                placeholder: t("admin.users.form.confirmPassword.placeholder"),
            },
        },
        schema: {
            password: z.string({ required_error: t("admin.users.form.password.required") }).min(8, t("admin.users.form.password.minLength")),
            confirmPassword: z.string({ required_error: t("admin.users.form.confirmPassword.required") }).min(8, t("admin.users.form.confirmPassword.minLength")),
        },
        defaultValue: {
            password: "",
            confirmPassword: "",
        }
    }
};

export const onUserCreated = (
    setConfirmationCreate: (modal: ModalFormProps | null) => void,
    onCreateClicked: (body: any) => void,
    FormGuideline: React.ComponentType<any>,
    t: any
) => {
    const formData = createUserData([], [], [], t);

    setConfirmationCreate({
        title: t("admin.users.modal.addUser.title"),
        desc: t("admin.users.modal.addUser.description"),
        defaultValue: formData.defaultValue,
        child: formData.form,
        schema: formData.schema,
        content: React.createElement(FormGuideline), // Pass vesselOptionsMap as prop
        onCancelClick: () => setConfirmationCreate(null),
        onConfirmClick: (body: Record<string, any>) => {
            if (onCreateClicked) {
                onCreateClicked(body);
            }
            setConfirmationCreate(null);
        },
    });
};

export const onUserUpdated = (
    obj: any,
    setConfirmationPut: (modal: ModalFormProps | null) => void,
    onDataUpdated: (id: string, body: any) => void,
    FormGuideline: React.ComponentType<any>,
    t: any
) => {
    const formData = editUserData([], t);

    let newItem = { ...obj };
    if (newItem.subContractors) {
        newItem.sub_contractor = newItem.subContractors.map((item: any) => item.id)
    }

    setConfirmationPut({
        title: t("admin.users.modal.updateUser.title"),
        desc: t("admin.users.modal.updateUser.description"),
        defaultValue: newItem,
        child: formData.form,
        schema: formData.schema,
        content: React.createElement(FormGuideline),
        onCancelClick: () => setConfirmationPut(null),
        onConfirmClick: (body: Record<string, any>) => {
            let { email, ...newBody } = body;

            if (onDataUpdated) {
                onDataUpdated(obj.id, { name: body?.name });
            }
            setConfirmationPut(null);
        },
    });
};

export const onUserPasswordChanged = (
    obj: any,
    setConfirmationUpdatePassword: (modal: ModalFormProps | null) => void,
    onDataUpdated: (body: any) => void,
    FormGuideline: React.ComponentType<any>,
    t: any
) => {
    const formData = createChangePasswordData(t);

    setConfirmationUpdatePassword({
        title: t("admin.users.modal.changePassword.title"),
        desc: t("admin.users.modal.changePassword.description"),
        child: formData.form,
        schema: formData.schema,
        defaultValue: formData.defaultValue,
        content: React.createElement(FormGuideline),
        textConfirm: t("admin.users.modal.changePassword.buttonText"),
        onCancelClick: () => setConfirmationUpdatePassword(null),
        onConfirmClick: (body: Record<string, string>) => {
            if (body.password !== body.confirmPassword) {
                // Error handling should be done in the parent component
                return { error: t("admin.users.modal.changePassword.mismatchError") };
            }

            const newBody = {
                userId: obj?.id,
                newPassword: body.password
            }

            if (onDataUpdated) {
                onDataUpdated(newBody);
            }
            setConfirmationUpdatePassword(null);
        },
    });
};