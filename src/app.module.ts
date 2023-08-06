/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line prettier/prettier
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlertModule } from './modules/alerts/alert.module';

// eslint-disable-next-line prettier/prettier
// load .env
require('dotenv').config({ path: require('find-config')('.env') });

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URI),
    AlertModule,
  ],
  // eslint-disable-next-line prettier/prettier
  controllers: [],
  providers: [],
})

export class AppModule {}
