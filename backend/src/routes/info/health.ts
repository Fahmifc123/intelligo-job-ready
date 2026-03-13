import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";

const createRandomNumber: FastifyPluginAsyncTypebox = async (app) => {
  // Server information route
  app.route({
    method: "GET",
    url: "/server",
    schema: {
      tags: ["Info"],
      // summary: "Get Server Information",
      description: "Returns detailed information about the server",
      response: {
        200: {
          type: 'object',
          properties: {
            uptime: { type: 'number' },
            uptimeFormatted: { type: 'string' },
            memoryUsage: {
              type: 'object',
              properties: {
                rss: { type: 'number' },
                heapTotal: { type: 'number' },
                heapUsed: { type: 'number' },
                external: { type: 'number' }
              }
            },
            nodeVersion: { type: 'string' }
          }
        }
      }
    },
    handler: (_, res) => {
      const memoryUsage = process.memoryUsage();
      const uptimeInSeconds = process.uptime();

      // Convert uptime to days, hours, and minutes
      const days = Math.floor(uptimeInSeconds / (24 * 3600));
      const hours = Math.floor((uptimeInSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((uptimeInSeconds % 3600) / 60);

      const formattedUptime = `${days}d ${hours}h ${minutes}m`;
      res.send({
        uptime: uptimeInSeconds,
        uptimeFormatted: formattedUptime,
        memoryUsage: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external
        },
        nodeVersion: process.version
      });
    }
  });
};

export default createRandomNumber;
