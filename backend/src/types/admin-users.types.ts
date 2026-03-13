import { Type } from '@sinclair/typebox';

// User response schema
export const UserResponse = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
  role: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

// User list response schema
export const UserListResponse = Type.Array(UserResponse);

// User create request schema
export const UserCreateRequest = Type.Object({
  name: Type.String({ minLength: 1 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }),
  role: Type.String(),
});

// User update request schema
export const UserUpdateRequest = Type.Object({
  name: Type.Optional(Type.String({ minLength: 1 })),
  role: Type.Optional(Type.String()),
});

// User delete request schema
export const UserDeleteRequest = Type.Object({
  userId: Type.String({ format: 'uuid' }),
});

// Change password request schema
export const ChangePasswordRequest = Type.Object({
  userId: Type.String({ format: 'uuid' }),
  newPassword: Type.String({ minLength: 8 }),
});