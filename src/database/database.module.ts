// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Register } from '../register/entities/register.entity';
import { Payment } from '../modules/payments/entities/payment.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { Location } from '../locations/entities/location.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbPort = configService.get<number>('DB_PORT');
        if (!dbPort) {
          throw new Error('DB_PORT is not defined in the configuration');
        }

        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: Number(configService.get('DB_PORT')),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),

          entities: [Register, Payment, Assignment, Location],

          // IMPORTANT: Render can only run JS migrations
          migrations: [path.join(__dirname, '../../migrations/*.js')],
          migrationsRun: true,
          synchronize: false,

          logging: ['error', 'warn', 'schema'],

          namingStrategy: new SnakeNamingStrategy(),

          // REQUIRED FOR NEON + Render
          ssl: {
            rejectUnauthorized: false,
          },

          extra: {
            ssl: {
              rejectUnauthorized: false,
            },
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
