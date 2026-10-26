import { Kafka } from 'kafkajs'

export const kafka = new Kafka({
    clientId: "kafka-crash-course",
    brokers: ["localhost:9092"]
})