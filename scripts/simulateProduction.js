const axios = require('axios');

// Function to generate a random car ID
const generateCarId = () => `car_${Math.floor(Math.random() * 100000)}`;

// Function to generate random machine ID
const getRandomMachine = () => {
  const machines = ['welding_robot_001', 'painting_robot_002', 'assembly_robot_003'];
  return machines[Math.floor(Math.random() * machines.length)];
};

const getCurrentTimestamp = () => new Date().toISOString();

// Function to send production data (car arrival, departure, or defect)
const sendProductionData = async (car_id, machine_id, event_type) => {
  try {
    const response = await axios.post('http://localhost:3000/api/production-datapoint', {
      car_id,
      machine_id,
      event: event_type,
      timestamp: getCurrentTimestamp()
    });
    console.log(`Sent ${event_type} event for ${car_id} at ${machine_id}`);
  } catch (error) {
    console.error('Error sending production data:', error);
  }
};

// Function to simulate car arrival and departure
const simulateProductionCycle = async () => {
  const car_id = generateCarId();
  const machine_id = getRandomMachine();

  // Simulate car arrival
  await sendProductionData(car_id, machine_id, 'car_arrival');

  // Simulate time taken for a production step (between 5 to 10 seconds)
  const productionTime = Math.floor(Math.random() * 5) + 5;
  
  setTimeout(async () => {
    // Simulate car departure
    await sendProductionData(car_id, machine_id, 'car_departure');

    // Randomly simulate defects (10% chance of a defect)
    if (Math.random() < 0.1) {
      await sendProductionData(car_id, machine_id, 'defective_product');
      console.log(`Car ${car_id} marked as defective`);
    }
  }, productionTime * 1000);
};

// Function to run the simulation in intervals
const startSimulation = () => {
  console.log('Starting production simulation...');
  
  setInterval(() => {
    simulateProductionCycle();
  }, Math.floor(Math.random() * 10000) + 10000);
};

startSimulation();
