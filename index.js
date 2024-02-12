const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(express.json());

const generateRandomString = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
};

const sendRequest = async () => {
    const url = 'https://api.discord.gx.games/v1/direct-fulfillment';
    const headers = {
        'authority': 'api.discord.gx.games',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        'origin': 'https://www.opera.com',
        'referer': 'https://www.opera.com/',
        'sec-ch-ua': '"Opera GX";v="105", "Chromium";v="119", "Not?A_Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0'
    };

    const data = {
        'partnerUserId': generateRandomString(64)
    };

    try {
        const response = await axios.post(url, data, { headers });

        if (response.status === 200) {
            const token = response.data.token;
            fs.appendFileSync('codes.txt', `https://discord.com/billing/partner-promotions/1180231712274387115/${token}\n`);
            console.log('Token saved to codes.txt file.');
            console.log(`Generated token: https://discord.com/billing/partner-promotions/1180231712274387115/${token}`);
        } else if (response.status === 429) {
            console.log('Rate limit exceeded! Waiting one minute to allow for cooldown.');
        } else if (response.status === 504) {
            console.log('Server timed out! Trying again in 5 seconds.');
        } else {
            console.log(`Request failed with status code ${response.status}.`);
            console.log(`Error message: ${response.data}`);
        }
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
};

setInterval(sendRequest, 1); // Send a request every second

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
