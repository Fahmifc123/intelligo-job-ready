import fastifyPlugin from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';

export default fastifyPlugin(async (fastify) => {
  await fastify.register(fastifyCookie);
});
