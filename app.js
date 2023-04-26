const fs = require('node:fs');
const https = require('node:https');
const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const request = require('superagent');

// Secrets
const { gmailPass, recaptchaKey } = require('./secret.json');

// Set up reusable email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'eliasmurcray@gmail.com',
    pass: gmailPass
  }
});

const PORT = 3000;

// Only allow requests from certain domains
app.use(cors({
  origin: ['https://eliasmurcray.com', 'http://localhost:4200']
}));

// Allow parsing of POST requests
app.use(bodyParser.json());

// GET (/): Fast way to see if server is running
app.get('/', (_req, res) => {
  res.send('Server is running');
});

// POST (/contact): Send email to me
app.post('/contact', async (req, res) => {
  if(!req.body)
    return res.status(400).send('No request body provided');
  if(!req.body.token)
    return res.status(400).send('Key \'token\' is required');
  if(!req.body.email)
    return res.status(400).send('Key \'email\' is required');
  if(!req.body.name)
    return res.status(400).send('Key \'name\' is required');
  if(!req.body.subject)
    return res.status(400).send('Key \'subject\' is required');
  if(!req.body.message)
    return res.status(400).send('Key \'message\' is required');

  const { token, email, name, subject, message } = req.body;

  console.log('Attempting to send email with', req.body);

  request
  .post(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaKey}&response=${token}`)
  .then((response) => {
    const json = JSON.parse(response.text);

    if(json.success === false) {
      return res.status(401).send('Invalid ReCAPTCHA token');
    }

    let mailOptions = {
      from: `${name} <${email}>`,
      to: 'eliasmurcray@gmail.com',
      subject: `Email from eliasmurcray.com: ${subject}`,
      text: message
    };
  
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(400).send(error);
        return console.log(error);
      }
      console.log('Message sent: ', info.messageId);
      res.sendStatus(200);
    });
  })
  .catch((error) => {
    console.error(error);
    return res.status(400).send('Error in ReCAPTCHA validation');
  });
});

// SSL certificate locations
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/api.eliasmurcray.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/api.eliasmurcray.com/fullchain.pem')
};

// Initialize HTTPS server with SSL certificates
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});