const express = require('express');
const amqp = require('amqplib');

const app = express();
const queueName = 'task_queue';

// Middleware to parse JSON requests
app.use(express.json());

// Route to handle the HTTP request
app.get('/process', async (req, res) => {
  try {
    console.log('/process request recived');
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://127.0.0.1:5672');
    const channel = await connection.createChannel();
    console.log('RabbitMQ connected');

    // Declare the queue
    await channel.assertQueue(queueName, { durable: true });

    // Convert the request to a task and send it to the queue
    const task = JSON.stringify(req.body);
    channel.sendToQueue(queueName, Buffer.from(task), { persistent: true });
    console.log('Task processed successfully');

    // Close the RabbitMQ connection
    await channel.close();
    await connection.close();
    console.log('RabbitMQ connection close');

    // Return a success response
    res.status(200).json({ message: 'Task submitted successfully.' });
  } catch (error) {
    // Return an error response
    res.status(500).json({ error });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
