import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.setGlobalPrefix('/api')
  await app.listen(process.env.PORT)
  console.log('Server started on : ', process.env.PORT)
}

bootstrap()
