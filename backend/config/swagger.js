import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Grocery API',
      version: '1.0.0',
      description: 'API documentation for the Grocery application with Open Food Facts integration. Use the API key authentication to access protected endpoints.',
      contact: {
        name: 'API Support',
        url: 'http://localhost:5000',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for user authentication'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API Key for accessing the API. Use: 55619ef3-35cb-4971-8c94-caea08d6bb93'
        },
      },
    },
    security: [
      {
        apiKeyAuth: [],
      },
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    join(__dirname, '../routes/*.js'),
    join(__dirname, '../models/*.js'),
    join(__dirname, '../app.js'),
  ],
};

const specs = swaggerJsdoc(options);

export default specs;

