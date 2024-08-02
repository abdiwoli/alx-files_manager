import { createClient } from 'redis';

const client = createClient();

await client.connect()
    .then(() => {
        console.log('Redis client connected to the server');
    })
    .catch(err => {
        console.log(`Redis client not connected to the server: ${err}`);
    });

const setNewSchool = async (key, field, value) => {
    try {
        const reply = await client.hSet(key, field, value);
        console.log(`Reply: ${reply}`);
    } catch (err) {
        console.error(`Error setting value: ${err}`);
    }
}

const displaySchoolValue = async (key) => {
    try {
        const data = await client.hGetAll(key);
        console.log(data);
    } catch (err) {
        console.error(`Error getting value: ${err}`);
    }
}

const HolbertonSchools = {
    'Portland': 50,
    'Seattle': 80,
    'New York': 20,
    'Bogota': 20,
    'Cali': 40,
    'Paris': 2
};


await Promise.all(
    Object.entries(HolbertonSchools).map(([city, value]) => {
        return setNewSchool('HolbertonSchools', city, value);
    })
);

await displaySchoolValue('HolbertonSchools');

