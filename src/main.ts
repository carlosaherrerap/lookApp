import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Permite peticiones desde el Admin Web y Móvil
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
