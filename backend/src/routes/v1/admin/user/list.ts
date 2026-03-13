import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { db } from '../../../../db/index.ts';
import { users } from '../../../../db/schema/auth.schema.ts';
import { UserListResponse } from '../../../../types/admin-users.types.ts';
import { like, and, eq, asc, desc, sql } from 'drizzle-orm';

const userAdminListRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/list',
    method: 'GET',
    schema: {
      tags: ['Admin'],
      summary: 'Get user list',
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
        view: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
        sort: Type.Optional(Type.String()),
        order: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')])),
        search: Type.Optional(Type.String()),
        role: Type.Optional(Type.String()),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: UserListResponse,
          message: Type.String(),
          pagination: Type.Optional(Type.Object({
            page: Type.Number(),
            view: Type.Number(),
            total: Type.Number(),
            totalPages: Type.Number(),
          })),
        }), 
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      // Type the query parameters
      const query = req.query as {
        page?: number;
        view?: number;
        sort?: string;
        order?: 'asc' | 'desc';
        search?: string;
        role?: string;
      };
      
      const { page = 1, view: limit = 10, sort, order, search, role } = query;
      
      // Build the query conditions
      const conditions = [];
      if (search) {
        conditions.push(like(users.name, `%${search}%`));
      }
      if (role) {
        // Validate role is one of the allowed values
        if (role === 'admin' || role === 'user') {
          conditions.push(eq(users.role, role));
        }
      }
      
      // Build sorting column map
      const sortByColumns = {
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      };
      
      // Apply sorting
      const sortColumn = sort && sortByColumns[sort as keyof typeof sortByColumns] 
        ? sortByColumns[sort as keyof typeof sortByColumns] 
        : users.createdAt;
      
      const orderBy = order === 'desc' ? desc(sortColumn) : asc(sortColumn);
      
      // Apply pagination
      const offset = (page - 1) * limit;
      
      // Execute the main query with filters, sorting, and pagination
      let userList;
      let total;
      
      if (conditions.length > 0) {
        // Get total count
        const countResult = await db.select({ count: sql<number>`count(*)` }).from(users).where(and(...conditions));
        total = countResult[0].count;
        
        // Get paginated results
        userList = await db
          .select()
          .from(users)
          .where(and(...conditions))
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset);
      } else {
        // Get total count
        const countResult = await db.select({ count: sql<number>`count(*)` }).from(users);
        total = countResult[0].count;
        
        // Get paginated results
        userList = await db
          .select()
          .from(users)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset);
      }
      
      return reply.send({
        success: true,
        data: userList,
        message: req.i18n.t('admin.user.userList'),
        pagination: {
          page,
          view: limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }),
  });
};

export default userAdminListRoute;