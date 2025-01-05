import { NestFactory } from '@nestjs/core';
import { SeedModule } from '@entities/seed/seed.module';
import { Logger } from '@nestjs/common';
import { SeedService } from '@entities/seed/seed.service';

async function bootstrap() {
  NestFactory.createApplicationContext(SeedModule)
    .then((appContext) => {
      const logger = appContext.get(Logger);
      const seeder = appContext.get(SeedService);
      seeder
        .run()
        .then(() => {
          logger.debug('Seeding complete!');
        })
        .catch((error) => {
          logger.error('Seeding failed!');
          throw error;
        })
        .finally(() => appContext.close());
    })
    .catch((error) => {
      throw error;
    });
}
bootstrap();
