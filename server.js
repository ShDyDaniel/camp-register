const os = require('os');

const isWindows = process.platform === 'win32';
const browserPath = isWindows
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const express = require('express');
const venom = require('venom-bot');
const app = express();
app.use(express.json());

let clientReady = false;
let qrCodeBase64 = '';
let client;

venom
  .create(
    {
      session: 'camp-session',
      multidevice: true,
      headless: 'new',
      useChrome: true,
      browserPath,
      autoClose: false,
      disableWelcome: true,
      mkdirFolderToken: 'tokens',
      folderNameToken: 'camp-session'
    },
    (base64Qrimg) => {
      qrCodeBase64 = base64Qrimg;
      console.log('📸 QR code is ready');
    },
    (statusSession) => {
      console.log('Session status:', statusSession);
    }
  )
  .then((_client) => {
    client = _client;
    clientReady = true;
    console.log('✅ WhatsApp connected');
  })
  .catch((err) => {
    console.error('❌ WhatsApp connection error:', err);
  });

// נקודת בדיקה האם מחובר
app.get('/status', (req, res) => {
  res.send({ connected: clientReady });
});

// QR image
app.get('/qr', (req, res) => {
  if (!clientReady && qrCodeBase64) {
    res.send(`<img src="${qrCodeBase64}" style="width:300px;" />`);
  } else {
    res.send('');
  }
});

function normalizePhone(number) {
  let clean = number.replace(/\D/g, '');
  if (clean.startsWith('0') && clean.length === 10) {
    return '972' + clean.slice(1);
  }
  if (clean.startsWith('972') || clean.startsWith('1') || clean.startsWith('44')) {
    return clean;
  }
  if (clean.startsWith('+')) {
    return clean.replace('+', '');
  }
  return clean; // fallback
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.post('/send', async (req, res) => {
  if (!clientReady) {
    return res.status(400).send({ error: 'WhatsApp not connected' });
  }

  const { phoneFather, phoneMother, lastName, childrenNames, total, paymentMethod } = req.body;

  const message = `
_עדכון מס' 0.1_

שלום רב משפחת ${lastName}!

*הרישום של ${childrenNames} בוצע בהצלחה ונקלט במערכת התשלום על סך כולל של ${total} באמצעות ${paymentMethod}.*

_בע"ה, לאחר סגירת הרישום ועם התקרבות מועד הקעמפ, נשלח פרטים על שיבוץ החדרים ועדכונים נוספים כהכנה לקראת הקעמפ._

לצורך קבלת עדכונים מהמערכת -
יש לוודא שמספר מזכירות הקעמפ שמור אצלכם ברשימת אנשי הקשר.
אם אינו שמור - יש לשמור אותו כעת.
`;

  try {
    if (phoneFather) {
      const phoneFatherFormatted = normalizePhone(phoneFather);
      await client.sendText(`${phoneFatherFormatted}@c.us`, message);
    }
    if (phoneMother) {
      const phoneMotherFormatted = normalizePhone(phoneMother);
      await client.sendText(`${phoneMotherFormatted}@c.us`, message);
    }
    res.send({ status: 'ok' });
  } catch (err) {
    console.error('❌ Error sending:', err);
    res.status(500).send({ error: 'Send failed' });
  }
});

module.exports = () => {
  app.listen(3000, () => console.log('🚀 Server ready on http://localhost:3000'));
};