import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.${ENV}.env`,
    }),
  ],
})
export class ConfigModule {}
