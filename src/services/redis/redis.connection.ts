import Logger from "bunyan";
import { config } from "@root/config";
import { BaseCache } from '@services/redis/base.cache';

// Assuming `config.createLogger` returns a Logger instance correctly configured.
const log: Logger = config.createLogger('redisConnection');

class RedisConnection extends BaseCache {
    constructor() {
        super('redisConnection');
    }

    async connect(): Promise<void> {
        try {
            console.log('Connecting to Redis...');
            await this.client.connect(); // Ensures the Redis client connects.
            const res = await this.client.ping(); // Pings the Redis server.
            console.log(res); // Expected to log "PONG" if the connection is successful.
        } catch (error) {
            // Logs the error with additional context
            log.error({ err: error }, 'Failed to connect to Redis');
        }
    }
}

export const redisConnection = new RedisConnection();