import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { app } from './server/src/app';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`[AcadFlow] Full-stack server running on http://${HOST}:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[AcadFlow] Failed to start server:', err);
  process.exit(1);
});
