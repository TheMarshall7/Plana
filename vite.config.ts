import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-persistence',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/data' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', () => {
              try {
                fs.writeFileSync(path.resolve(__dirname, 'db.json'), body, 'utf8');
                res.statusCode = 200;
                res.end(JSON.stringify({ status: 'success' }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to write to file' }));
              }
            });
          } else if (req.url === '/api/data' && req.method === 'GET') {
            const dbPath = path.resolve(__dirname, 'db.json');
            if (fs.existsSync(dbPath)) {
              res.setHeader('Content-Type', 'application/json');
              res.end(fs.readFileSync(dbPath, 'utf8'));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'No data file found' }));
            }
          } else {
            next();
          }
        });
      }
    }
  ],
})
