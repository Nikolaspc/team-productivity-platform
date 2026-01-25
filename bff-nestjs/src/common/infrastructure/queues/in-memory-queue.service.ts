import { Injectable, Logger } from '@nestjs/common';
import { IQueueService } from './queue.interface';

@Injectable()
export class InMemoryQueueService implements IQueueService {
  private readonly logger = new Logger('Queue:Memory');

  async addJob(name: string, data: any): Promise<void> {
    this.logger.log(`📥 Job added to Memory Queue: ${name}`);
    this.logger.debug(`Payload: ${JSON.stringify(data)}`);

    setImmediate(() => {
      this.logger.log(`✅ Job ${name} processed successfully (Simulation)`);
    });
  }
}
