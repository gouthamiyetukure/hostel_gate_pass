const express = require('express');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const fs = require('fs');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// QR Code Generation and Data Storage Endpoint
app.post('/generate', (req, res) => {
  const { name, time, reason, permissionBy } = req.body;
  if (!name || !time || !reason || !permissionBy) {
    return res.status(400).send('All fields are required');
  }

  // Prepare the data to store
  const entry = { name, time, reason, permissionBy, timestamp: new Date().toISOString() };

  // Write the data to `data.json`
  const filePath = './data.json';
  fs.readFile(filePath, 'utf8', (err, data) => {
    let fileData = [];
    if (!err && data) {
      fileData = JSON.parse(data);
    }
    fileData.push(entry);

    fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        return res.status(500).send('Error saving data');
      }

      // Generate QR Code
      const qrData = JSON.stringify(entry);
      QRCode.toDataURL(qrData, (err, url) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error generating QR code');
        }
        res.send(url);
      });
    });
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
