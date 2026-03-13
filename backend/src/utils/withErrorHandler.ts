import type {FastifyRequest, FastifyReply} from 'fastify';

export function withErrorHandler<
  Req extends FastifyRequest = FastifyRequest,
  Res extends FastifyReply = FastifyReply
>(
  handler: (req: Req, reply: Res) => Promise<any>,
  defaultErrorStatusCode = 400 //
) {
  return async (req: Req, reply: Res) => {
    try {
      return await handler(req, reply);
    } catch (err: any) {
      req.log.error(err);

      const statusCode = err?.statusCode ?? err?.code ?? defaultErrorStatusCode;

      return reply.status(statusCode).send({
        success: false,
        error: err?.message || 'Unexpected error',
      });
    }
  };
}
