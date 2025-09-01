import Logger from 'bunyan';
import { config } from '../../../config';
import { BaseCache } from './base.cache';

const log: Logger = config.createLogger('redisConnection');

class RedisConnection extends BaseCache {
  private connecting = false; // prevent concurrent connects

  constructor() {
    super('redisConnection');
  }

  async connect(): Promise<void> {
    try {
      // Already open? Do nothing.
      if (this.client?.isOpen) {
        log.info('Redis already connected');
        return;
      }

      // If another call is currently opening the socket, wait until it finishes.
      if (this.connecting) {
        log.info('Redis connect already in progress; waiting…');
        // Poll until open or the flag is cleared (simple and safe for dev)
        while (this.connecting && !this.client.isOpen) {
          await new Promise((r) => setTimeout(r, 50));
        }
        if (this.client.isOpen) {
          log.info('Redis connected (after wait)');
          return;
        }
      }

      this.connecting = true;
      await this.client.connect();
      log.info(`Redis connection: ${await this.client.ping()}`);
    } catch (error: any) {
      // Swallow the noisy "Socket already opened" during dev reloads
      if (typeof error?.message === 'string' && error.message.includes('Socket already opened')) {
        log.warn('Redis socket already open; skipping duplicate connect');
        return;
      }
      log.error({ err: error }, 'Redis connect failed');
      throw error;
    } finally {
      this.connecting = false;
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
