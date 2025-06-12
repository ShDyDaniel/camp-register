const express = require('express');
const venom = require('venom-bot');
const app = express();
app.use(express.json());
let clientReady = false;

let client;

venom
  .create({
    session: 'camp-session',
    multidevice: true
  })
  .then((_client) => {
    client = _client;
    clientReady = true;
    console.log('WhatsApp connected');
  });

app.post('/send', async (req, res) => {
  if (!clientReady) return res.status(400).send({ error: 'WhatsApp not connected yet' });

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
    await client.sendText(`${phoneFather}@c.us`, message);
    await client.sendText(`${phoneMother}@c.us`, message);
    res.send({ status: 'ok' });
  } catch (err) {
    res.status(500).send({ error: 'Sending failed', details: err });
  }
});

module.exports = () => {
  app.listen(3000, () => console.log('Server listening on port 3000'));
};