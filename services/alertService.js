const { sendMessage } = require('./utils/rabbitMQUtils');

exports.sendPerformanceAlert = async (message) => {
    console.log(`ALERT: ${message}`);
    try {
        await sendMessage('alert-queue', message);
        console.log('Message sent to RabbitMQ');
    } catch (error) {
        console.error('Failed to send message to RabbitMQ', error);
    }
};