// Quick test to verify routes are registered
import app from './app.js';

console.log('\n🔍 Testing Route Registration...\n');

// Get all registered routes
const routes = [];
app._router?.stack?.forEach((middleware) => {
  if (middleware.route) {
    // Direct route
    routes.push({
      path: middleware.route.path,
      methods: Object.keys(middleware.route.methods)
    });
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack?.forEach((handler) => {
      if (handler.route) {
        routes.push({
          path: handler.route.path,
          methods: Object.keys(handler.route.methods),
          basePath: middleware.regexp.source
        });
      }
    });
  }
});

console.log('Registered Routes:');
routes.forEach(route => {
  console.log(`  ${route.methods.join(', ').toUpperCase().padEnd(10)} ${route.path || route.basePath}`);
});

console.log('\n✅ Route check complete!\n');



