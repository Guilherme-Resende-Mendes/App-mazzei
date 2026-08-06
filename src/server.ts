import 'reflect-metadata';
import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  console.info(`Mazzei API rodando em http://localhost:${env.PORT}`);
  console.info(`Documentacao Swagger em http://localhost:${env.PORT}/docs`);
});
