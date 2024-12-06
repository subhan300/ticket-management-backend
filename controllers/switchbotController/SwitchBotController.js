const crypto = require('crypto');
const https = require('https'); // Add the 'https' module
 // Add your token and secret
 const token = "133f0e99891fb41bbe9153edc6ed83839779a38e9e81c56cae64f10892bfe0b07d10b7ab3e27b64cfe2eaf9680a4e3a0";   // Replace with your actual token
 const secret = "f9f24bc1bd3b3a8e5178358875132023"; // Replace with your actual secret
const getSignature = async (req, res) => {
    const { command, parameter, commandType, deviceId } = req.body;

   
    const t = Date.now();
    const nonce = "requestID";   // A random ID for this request

    // Create data for HMAC
    const data = token + t + nonce;
    const signTerm = crypto.createHmac('sha256', secret)
        .update(Buffer.from(data, 'utf-8'))
        .digest();
    const sign = signTerm.toString("base64");

    // Body for the POST request to SwitchBot
    const body = JSON.stringify({
        command: command || "turnOn",
        parameter: parameter || "default",
        commandType: commandType || "command"
    });

    // URL-encode deviceId to prevent unescaped characters issue
    const encodedDeviceId = encodeURI(deviceId)

    const options = {
        hostname: 'api.switch-bot.com',
        port: 443,
        path: `/v1.1/devices/${encodedDeviceId}/commands`,  // Use the encoded deviceId here
        method: 'POST',
        headers: {
            "Authorization": token,
            "sign": sign,
            "nonce": nonce,
            "t": t,
            'Content-Type': 'application/json',
            'Content-Length': body.length,
        },
    };

    // Make the HTTPS request
    const switchBotReq = https.request(options, switchBotRes => {
        let data = '';
     

        // Collect data chunks
        switchBotRes.on('data', chunk => {
            data += chunk;
        });
        // When response is complete, send it back to the client
        switchBotRes.on('end', () => {
            res.status(switchBotRes.statusCode).json({

                status: switchBotRes.statusCode,
                response: JSON.parse(data),
            });
        });
    });

    switchBotReq.on('error', error => {
        console.error("error___________",error);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    // Write body to request
    switchBotReq.write(body);
    switchBotReq.end();
}
const generateSign=(nonce,t)=>{
   
  
   
    const data = token + t + nonce;
    const signTerm = crypto.createHmac('sha256', secret)
        .update(Buffer.from(data, 'utf-8'))
        .digest();
    const sign = signTerm.toString("base64");
    return sign
}
const getDevices = async (req, res) => {
   
    const nonce="123"
    const t = Date.now();
    const options = {
        hostname: 'api.switch-bot.com',
        port: 443,
        path: '/v1.1/devices', // Endpoint to retrieve devices
        method: 'GET',
        headers: {
            "Authorization": token,
            "sign": generateSign(nonce,t),
            "nonce": nonce,
            "t": t,
            'Content-Type': 'application/json',
            // 'Content-Length': body.length,
        },
    };

    const switchBotReq = https.request(options, switchBotRes => {
        let data = '';

        // Collect data chunks
        switchBotRes.on('data', chunk => {
            data += chunk;
        });

        // When response is complete, send it back to the client
        switchBotRes.on('end', () => {
            try {
                const devices = JSON.parse(data);
                 const filterDevices=devices.body.deviceList.filter(val=>val.enableCloudService)
                res.status(switchBotRes.statusCode).json(filterDevices); // Return device data
            } catch (error) {
                console.error("Error parsing response: ", error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    });

    switchBotReq.on('error', error => {
        console.error("Error: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    switchBotReq.end(); // End the request
};

const getDevicesStatus = async (req,res ) => {
    const {deviceId}=req.body
    const nonce="123"
    const t = Date.now();
    const options = {
        hostname: 'api.switch-bot.com',
        port: 443,
        path: `/v1.1/devices/${deviceId}/status`, // Endpoint to retrieve devices
        method: 'GET',
        headers: {
            "Authorization": token,
            "sign": generateSign(nonce,t),
            "nonce": nonce,
            "t": t,
            'Content-Type': 'application/json',
            // 'Content-Length': body.length,
        },
    };

    const switchBotReq = https.request(options, switchBotRes => {
        let data = '';

        // Collect data chunks
        switchBotRes.on('data', chunk => {
            data += chunk;
        });

        // When response is complete, send it back to the client
        switchBotRes.on('end', () => {
            try {
                const devices = JSON.parse(data);
                res.status(switchBotRes.statusCode).json(devices); // Return device data
            } catch (error) {
                console.error("Error parsing response: ", error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    });

    switchBotReq.on('error', error => {
        console.error("Error: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    switchBotReq.end(); // End the request
};

const getTemepratureFromSensor = (deviceId) => {
    return new Promise((resolve, reject) => {
      const nonce = "123";
      const t = Date.now();
      const options = {
        hostname: 'api.switch-bot.com',
        port: 443,
        path: `/v1.1/devices/${deviceId}/status`,
        method: 'GET',
        headers: {
          "Authorization": token,
          "sign": generateSign(nonce, t),
          "nonce": nonce,
          "t": t,
          'Content-Type': 'application/json',
        },
      };
  
      const switchBotReq = https.request(options, (switchBotRes) => {
        let data = '';
  
        switchBotRes.on('data', (chunk) => {
          data += chunk;
        });
  
        switchBotRes.on('end', () => {
          try {
            const devices = JSON.parse(data);
            resolve(devices.body); // Assuming the status is in the body
          } catch (error) {
            reject("Error parsing response: " + error);
          }
        });
      });
  
      switchBotReq.on('error', (error) => {
        reject("Error: " + error);
      });
  
      switchBotReq.end();
    });
  };


module.exports = { getSignature,getDevices , getDevicesStatus,getTemepratureFromSensor};
