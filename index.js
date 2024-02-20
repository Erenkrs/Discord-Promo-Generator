const fetch = require('node-fetch');
const fs = require('fs');

function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
}

function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} | ${hour}:${minute}:${second}`;
}

async function sendRequest(url, headers, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const responseData = await response.json();
            const token = responseData.token;
            const timestamp = getCurrentDateTime();
            fs.appendFileSync('Promo.txt', `https://discord.com/billing/partner-promotions/1180231712274387115/${token}\n`);
            console.log(`${timestamp} - Nitro Promo Saved To Promo.txt`);
        } else {
            const error = new Error(response.statusText);
            error.response = response;
            throw error;
        }

        return true;
    } catch (error) {
        console.error(`An error occurred: ${error}`);
        if (error.response && error.response.status === 429) {
            const resetTime = error.response.headers.get('retry-after') || 60;
            console.log(`Hey Slow You Were Over the Speed ​​Limit, Waiting for ${resetTime} Seconds to Allow Waiting Time to Expire ⌚`);
            await new Promise(resolve => setTimeout(resolve, resetTime * 1000));
        } else {
            console.log(`Will Try Again in 5 Seconds ⌚`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        return false;
    }
}

async function sendRequests() {
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

    try {
        while (true) {
            const data = {
                'partnerUserId': generateRandomString(64)
            };

            await sendRequest(url, headers, data);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.log('Received SIGINT. Exiting gracefully.');
        process.exit(0);
    }
}

process.on('SIGINT', () => {
    console.log('Received SIGINT. Exiting gracefully.');
    process.exit(0);
});

sendRequests();
