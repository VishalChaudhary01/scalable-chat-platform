import { Admin, Consumer, EachMessagePayload, Kafka, Producer } from 'kafkajs';
import { totalCUPs } from '..';
import { prisma } from '../configs/prisma.config';

export class KafkaService {
  private static instance: KafkaService;
  private kafka: Kafka;
  private producer!: Producer;
  private consumer!: Consumer;

  private constructor() {
    this.kafka = new Kafka({
      clientId: 'chat-service',
      brokers: ['localhost:9092'],
    });
  }

  public static getInstance(): KafkaService {
    if (!KafkaService.instance) {
      KafkaService.instance = new KafkaService();
    }
    return KafkaService.instance;
  }

  async initAdmin(): Promise<void> {
    const admin: Admin = this.kafka.admin();
    await admin.connect();
    await admin.createTopics({
      topics: [
        {
          topic: 'chat-message',
          numPartitions: totalCUPs,
          replicationFactor: 3,
        },
      ],
    });
    console.log('Kafka topic created');
    await admin.disconnect();
  }

  async getProducer(): Promise<Producer> {
    if (!this.producer) {
      this.producer = this.kafka.producer();
      await this.producer.connect();
    }
    return this.producer;
  }

  async getConsumer(): Promise<Consumer> {
    if (!this.consumer) {
      this.consumer = this.kafka.consumer({ groupId: 'chat-group' });
      await this.consumer.subscribe({
        topic: 'chat-message',
        fromBeginning: true,
      });
    }
    return this.consumer;
  }

  async produceMessage(message: string): Promise<void> {
    const producer = await this.getProducer();
    await producer.send({
      topic: 'chat-message',
      messages: [{ value: message }],
    });
  }

  async startConsumer(): Promise<void> {
    const consumer = await this.getConsumer();

    await consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
        pause,
      }: EachMessagePayload) => {
        if (!message.value) return;

        try {
          console.log('Message recieved');
          console.log(`Topic: ${topic}, Partition: ${partition}`, {
            value: message.value.toString(),
          });
          await prisma.message.create({
            data: {
              text: message.value.toString(),
            },
          });
        } catch (error) {
          console.error('Filed to consume message: ', error);
          pause();
          setTimeout(() => {
            this.consumer.resume([{ topic: 'chat-message' }]);
          }, 60 * 1000);
        }
      },
    });
  }
}

export const kafkaService = KafkaService.getInstance();
