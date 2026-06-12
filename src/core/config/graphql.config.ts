import type { ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { isDev } from '@/src/shared/utils/is-dev.util';

export function getGraphQLConfig(configService: ConfigService): ApolloDriverConfig {
   return {
      // Включен ли playground, чтобы писать запросы
      playground: isDev(configService),
      // Путь для playground
      path: configService.getOrThrow<string>('GRAPHQL_PREFIX'),
      // Где хранится схема GraphQL
      autoSchemaFile: join(process.cwd(), 'src/core/graphql/schema.gql'),
      // Сортировать ли схему для улучшения читаемости
      sortSchema: true,
      // Контекст для работы с req и res
      context: ({ req, res }) => ({ req, res }),
   };
}
