/**
 * Prisma Client Configuration and Connection Management
 * Enterprise-grade database service with connection pooling, monitoring, and error handling
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { logger, logQuery } from '@/shared/utils/logger';
import { config } from '@/config/environment';

interface DatabaseServiceOptions {
  maxRetries?: number;
  retryDelay?: number;
  connectionTimeout?: number;
  queryTimeout?: number;
}

class DatabaseService {
  private static instance: DatabaseService;
  private _client: PrismaClient | null = null;
  private isConnected = false;
  private retryCount = 0;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  private constructor(options: DatabaseServiceOptions = {}) {
    this.options = options;
    this.initialize();
    this.setupHealthCheck();
  }

  private readonly options: DatabaseServiceOptions;

  public static getInstance(options?: DatabaseServiceOptions): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService(options);
    }
    return DatabaseService.instance;
  }

  private initialize(): void {
    try {
      const logLevel = config.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['query', 'error', 'warn', 'info'];

      this._client = new PrismaClient({
        datasources: {
          db: {
            url: config.DATABASE_URL,
          },
        },
        log: logLevel.map(level => ({
          emit: 'event',
          level: level as Prisma.LogLevel,
        })),
        errorFormat: config.NODE_ENV === 'production' ? 'minimal' : 'pretty',
      });

      this.setupEventListeners();
      this.setupMiddleware();

      logger.info('Prisma client initialized', {
        environment: config.NODE_ENV,
        logLevel,
      });
    } catch (error) {
      logger.error('Failed to initialize Prisma client:', error);
      this.handleInitializationError(error);
    }
  }

  private setupEventListeners(): void {
    if (!this._client) return;

    // Type-safe event handling with Prisma 5.x
    (this._client.$on as any)('query', (e: any) => {
      if (config.NODE_ENV === 'development') {
        logQuery(e.query, e.duration, e.params ? JSON.parse(e.params) : undefined);
      }
    });

    (this._client.$on as any)('error', (e: any) => {
      logger.error('Database error:', {
        message: e.message,
        target: e.target,
      });
    });

    (this._client.$on as any)('warn', (e: any) => {
      logger.warn('Database warning:', {
        message: e.message,
      });
    });
  }

  private setupMiddleware(): void {
    if (!this._client) return;

    // Add query performance monitoring middleware
    this._client.$use(async (params: any, next: any) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();

      if (after - before > 1000) {
        logger.warn('Slow query detected', {
          model: params.model,
          action: params.action,
          duration: after - before,
        });
      }

      return result;
    });

    // Add soft delete middleware for all models
    this._client.$use(async (params: any, next: any) => {
      // Only apply soft delete to models that have deletedAt field
      const softDeleteModels = ['Company', 'Division', 'User', 'Contact', 'Property', 'WorkingCategory', 'PipelineStage', 'Opportunity', 'Project', 'LineItem', 'CostCategory', 'WebFormSubmission'];

      if (softDeleteModels.includes(params.model as string)) {
        if (params.action === 'delete') {
          params.action = 'update';
          params.args['data'] = { deletedAt: new Date() };
        }

        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          if (params.args.data !== undefined) {
            params.args.data['deletedAt'] = new Date();
          } else {
            params.args['data'] = { deletedAt: new Date() };
          }
        }
      }

      return next(params);
    });
  }

  private setupHealthCheck(): void {
    if (config.NODE_ENV === 'production') {
      this.connectionCheckInterval = setInterval(async () => {
        const isHealthy = await this.health();
        if (!isHealthy && this.isConnected) {
          logger.error('Database connection lost, attempting reconnection');
          await this.reconnect();
        }
      }, 30000);
    }
  }

  private handleInitializationError(error: unknown): void {
    if (error instanceof Error) {
      if (error.message.includes('P1001')) {
        throw new Error('Database connection failed: Unable to reach database server');
      }
      if (error.message.includes('P1002')) {
        throw new Error('Database connection timeout: Server took too long to respond');
      }
      if (error.message.includes('P1003')) {
        throw new Error('Database not found: Check if database exists');
      }
    }
    throw new Error('Database initialization failed');
  }

  public get client(): PrismaClient {
    if (!this._client) {
      throw new Error('Database client not initialized');
    }
    return this._client;
  }

  public async connect(): Promise<void> {
    try {
      if (!this._client) {
        throw new Error('Database client not initialized');
      }

      await this._client.$connect();
      this.isConnected = true;
      this.retryCount = 0;

      const stats = await this.getConnectionInfo();
      logger.info('Database connected successfully', stats);
    } catch (error) {
      logger.error('Failed to connect to database:', error);

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        logger.info(`Retrying connection (${this.retryCount}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * this.retryCount));
        return this.connect();
      }

      throw error;
    }
  }

  private async reconnect(): Promise<void> {
    try {
      await this.disconnect();
      await this.connect();
    } catch (error) {
      logger.error('Reconnection failed:', error);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.connectionCheckInterval) {
        clearInterval(this.connectionCheckInterval as NodeJS.Timeout);
        this.connectionCheckInterval = null;
      }

      if (this._client) {
        await this._client.$disconnect();
        this.isConnected = false;
        logger.info('Database disconnected successfully');
      }
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  public async health(): Promise<boolean> {
    try {
      if (!this._client) {
        return false;
      }

      const startTime = Date.now();
      await this._client.$queryRaw`SELECT 1 as health_check`;
      const responseTime = Date.now() - startTime;

      if (responseTime > 1000) {
        logger.warn('Database health check slow', { responseTime });
      }

      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  public getConnectionStatus(): {
    isConnected: boolean;
    retryCount: number;
    uptime: number;
  } {
    return {
      isConnected: this.isConnected,
      retryCount: this.retryCount,
      uptime: this.isConnected ? process.uptime() : 0,
    };
  }

  private async getConnectionInfo(): Promise<{
    version: string;
    connections: number;
    maxConnections: number;
  }> {
    if (!this._client) {
      throw new Error('Database client not initialized');
    }

    const result = await this._client.$queryRaw<
      Array<{
        version: string;
        connections: number;
        max_connections: number;
      }>
    >`
      SELECT
        version() as version,
        (SELECT count(*) FROM pg_stat_activity)::int as connections,
        (SELECT setting FROM pg_settings WHERE name = 'max_connections')::int as max_connections
    `;

    return {
      version: result[0]?.version || 'Unknown',
      connections: result[0]?.connections || 0,
      maxConnections: result[0]?.max_connections || 100,
    };
  }

  public async transaction<T>(
    fn: (client: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$use'>) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    }
  ): Promise<T> {
    if (!this._client) {
      throw new Error('Database client not initialized');
    }

    const transactionId = this.generateTransactionId();
    const startTime = Date.now();

    try {
      logger.debug('Transaction started', { transactionId, options });

      const transactionOptions = {
        maxWait: options?.maxWait || 5000,
        timeout: options?.timeout || 10000,
        ...(options?.isolationLevel && { isolationLevel: options.isolationLevel }),
      };

      const result = await this._client.$transaction(
        async (prisma) => {
          return await fn(prisma as any);
        },
        transactionOptions
      ) as T;

      const duration = Date.now() - startTime;
      logger.debug('Transaction completed', { transactionId, duration });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Transaction failed', {
        transactionId,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      this.handleTransactionError(error);
      throw error;
    }
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private handleTransactionError(error: unknown): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error(`Unique constraint violation: ${error.meta?.target}`);
      }
      if (error.code === 'P2025') {
        throw new Error('Record not found');
      }
      if (error.code === 'P2003') {
        throw new Error(`Foreign key constraint violation: ${error.meta?.field_name}`);
      }
    }
  }

  public async batchWrite<T>(
    operations: Array<() => Promise<T>>,
    options: {
      batchSize?: number;
      concurrency?: number;
      stopOnError?: boolean;
    } = {}
  ): Promise<{
    successful: T[];
    failed: Array<{ index: number; error: Error }>
  }> {
    if (!this._client) {
      throw new Error('Database client not initialized');
    }

    const {
      batchSize = 100,
      concurrency = 10,
      stopOnError = false
    } = options;

    const successful: T[] = [];
    const failed: Array<{ index: number; error: Error }> = [];

    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      try {
        const chunks = [];
        for (let j = 0; j < batch.length; j += concurrency) {
          chunks.push(batch.slice(j, j + concurrency));
        }

        for (const chunk of chunks) {
          const results = await Promise.allSettled(
            chunk.map((operation, idx) =>
              operation().catch(error => {
                const chunkItem = chunk[idx];
                if (chunkItem) {
                  const operationIndex = batch.indexOf(chunkItem);
                  if (operationIndex !== -1) {
                    failed.push({
                      index: i + operationIndex,
                      error
                    });
                  }
                }
                if (stopOnError) throw error;
                return null;
              })
            )
          );

          results.forEach(result => {
            if (result.status === 'fulfilled' && result.value !== null) {
              successful.push(result.value);
            }
          });
        }

        logger.debug(`Batch ${batchNumber} completed`, {
          batchSize: batch.length,
          successful: successful.length,
          failed: failed.length,
          totalProcessed: i + batch.length,
          totalOperations: operations.length,
        });
      } catch (error) {
        if (stopOnError) {
          logger.error(`Batch ${batchNumber} failed, stopping execution:`, error);
          throw error;
        }
        logger.warn(`Batch ${batchNumber} had errors, continuing...`);
      }
    }

    return { successful, failed };
  }

  public async executeRaw<T = unknown>(
    query: string,
    params?: unknown[],
    options?: {
      timeout?: number;
      logQuery?: boolean;
    }
  ): Promise<T> {
    if (!this._client) {
      throw new Error('Database client not initialized');
    }

    const queryId = `query_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const startTime = Date.now();
    const { timeout = 30000, logQuery: shouldLog = true } = options || {};

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), timeout);
      });

      const queryPromise = this._client.$queryRawUnsafe<T>(query, ...(params || []));

      const result = await Promise.race([queryPromise, timeoutPromise]) as T;

      const duration = Date.now() - startTime;

      if (shouldLog) {
        logQuery(query, duration, params);
      }

      if (duration > 1000) {
        logger.warn('Slow raw query detected', { queryId, duration });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Raw query execution failed', {
        queryId,
        duration,
        query: query.substring(0, 200),
        paramCount: params?.length || 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  public async getStats(): Promise<{
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    databaseSize: string;
    cacheHitRatio: number;
    slowQueries: number;
    tableStats: Array<{
      tableName: string;
      rowCount: number;
      tableSize: string;
      indexSize: string;
      totalSize: string;
    }>;
  }> {
    if (!this._client) {
      throw new Error('Database client not initialized');
    }

    try {
      const [connectionInfo, dbSize, cacheStats, slowQueryCount, tableStats] = await Promise.all([
        this._client.$queryRaw<
          Array<{
            total_connections: number;
            active_connections: number;
            idle_connections: number;
          }>
        >`
          SELECT
            count(*) as total_connections,
            count(*) FILTER (WHERE state = 'active') as active_connections,
            count(*) FILTER (WHERE state = 'idle') as idle_connections
          FROM pg_stat_activity
        `,

        this._client.$queryRaw<
          Array<{ database_size: string }>
        >`
          SELECT pg_size_pretty(pg_database_size(current_database())) as database_size
        `,

        this._client.$queryRaw<
          Array<{ cache_hit_ratio: number }>
        >`
          SELECT
            CASE
              WHEN sum(blks_hit + blks_read) > 0
              THEN round(sum(blks_hit)::numeric / sum(blks_hit + blks_read) * 100, 2)
              ELSE 0
            END as cache_hit_ratio
          FROM pg_stat_database
          WHERE datname = current_database()
        `,

        this._client.$queryRaw<
          Array<{ slow_query_count: number }>
        >`
          SELECT count(*) as slow_query_count
          FROM pg_stat_activity
          WHERE state = 'active'
            AND now() - query_start > interval '1 second'
        `,

        this._client.$queryRaw<
          Array<{
            table_name: string;
            row_count: number;
            table_size: string;
            index_size: string;
            total_size: string;
          }>
        >`
          SELECT
            schemaname||'.'||tablename as table_name,
            n_live_tup as row_count,
            pg_size_pretty(pg_table_size(schemaname||'.'||tablename)) as table_size,
            pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
          FROM pg_stat_user_tables
          WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
          ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
          LIMIT 20
        `
      ]);

      return {
        totalConnections: connectionInfo[0]?.total_connections || 0,
        activeConnections: connectionInfo[0]?.active_connections || 0,
        idleConnections: connectionInfo[0]?.idle_connections || 0,
        databaseSize: dbSize[0]?.database_size || '0 bytes',
        cacheHitRatio: cacheStats[0]?.cache_hit_ratio || 0,
        slowQueries: slowQueryCount[0]?.slow_query_count || 0,
        tableStats: tableStats.map(stat => ({
          tableName: stat.table_name,
          rowCount: stat.row_count,
          tableSize: stat.table_size,
          indexSize: stat.index_size,
          totalSize: stat.total_size,
        })),
      };
    } catch (error) {
      logger.error('Failed to get database statistics:', error);
      throw error;
    }
  }

  public async cleanup(): Promise<void> {
    if (!this._client) return;

    try {
      await this._client.$queryRaw`DISCARD ALL`;

      const vacuumResult = await this._client.$queryRaw`
        SELECT
          schemaname,
          tablename,
          last_vacuum,
          last_autovacuum
        FROM pg_stat_user_tables
        WHERE last_vacuum IS NULL
          AND last_autovacuum IS NULL
        LIMIT 5
      `;

      if (Array.isArray(vacuumResult) && vacuumResult.length > 0) {
        logger.warn('Tables requiring vacuum:', vacuumResult);
      }

      logger.info('Database cleanup completed');
    } catch (error) {
      logger.error('Database cleanup failed:', error);
      throw error;
    }
  }

  public async optimize(): Promise<void> {
    if (!this._client) return;

    try {
      logger.info('Starting database optimization');

      await this._client.$queryRaw`ANALYZE`;

      const indexUsage = await this._client.$queryRaw<
        Array<{
          tablename: string;
          indexname: string;
          index_scans: number;
          index_size: string;
        }>
      >`
        SELECT
          tablename,
          indexname,
          idx_scan as index_scans,
          pg_size_pretty(pg_relation_size(indexrelid)) as index_size
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
          AND pg_relation_size(indexrelid) > 1000000
        ORDER BY pg_relation_size(indexrelid) DESC
        LIMIT 10
      `;

      if (indexUsage.length > 0) {
        logger.warn('Unused indexes found:', indexUsage);
      }

      logger.info('Database optimization completed');
    } catch (error) {
      logger.error('Database optimization failed:', error);
      throw error;
    }
  }
}

// Graceful shutdown handler
process.on('beforeExit', async () => {
  logger.info('Gracefully shutting down database connections');
  await databaseService.disconnect();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing database connections');
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing database connections');
  await databaseService.disconnect();
  process.exit(0);
});

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
export const prisma = databaseService.client as PrismaClient;

// Export types
export type { DatabaseServiceOptions };
export { Prisma } from '@prisma/client';

// Export for dependency injection
export default databaseService;
