export interface IQueueService {
  addJob(name: string, data: any): Promise<void>;
}
