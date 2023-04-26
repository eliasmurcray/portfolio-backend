const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');

const PORT = 3000;

app.use(cors({
  origin: ['https://sanbernardinocountyteachersassociation.com', 'https://sbcta-hosting.web.app', 'http://127.0.0.1:5500', 'http://localhost:5500']
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Retrieve API Key
const { MC_APIKEY, MC_INSTANCE, MC_LISTID, RECAPTCHA_SECRET_KEY } = require('./secret.json');
const request = require('superagent');

app.post('/signup', (req, res) => {
  if(!req.body)
    return res.status(400).send('No request body provided');
  if(!req.body.token)
    return res.status(400).send('Key \'token\' is required');
  if(!req.body.email)
    return res.status(400).send('Key \'email\' is required');
  if(!req.body.firstName)
    return res.status(400).send('Key \'firstName\' is required');
  if(!req.body.lastName)
    return res.status(400).send('Key \'lastName\' is required');
  
  console.log('Attempting to subscribe with', JSON.stringify(req.body, null, 4));

  request
    .post(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${req.body.token}`)
    .then((response) => {
      const json = JSON.parse(response.text);
      if(json.success === true) {
        request
        .post('https://' + MC_INSTANCE + '.api.mailchimp.com/3.0/lists/' + MC_LISTID + '/members/')
        .set('Content-Type', 'application/json;charset=utf-8')
        .set('Authorization', 'Basic ' + Buffer.from('any:' + MC_APIKEY ).toString('base64'))
        .send({
          'email_address': req.body.email,
          'status': 'subscribed',
          'merge_fields': {
            'FNAME': req.body.firstName,
            'LNAME': req.body.lastName
          }
        })
        .end(function(err, response) {
          if (response.status < 300 || (response.status === 400 && response.body.title === 'Member Exists')) {
            res.send('Signed Up!');
          } else {
            res.send('Sign Up Failed: ' + JSON.stringify(response, null, 4));
          }
        });
      } else {
        return res.status(401).send('Invalid ReCAPTCHA token');
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(400).send('Error in ReCAPTCHA validation');
    });
});

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/api.sanbernardinocountyteachersassociation.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/api.sanbernardinocountyteachersassociation.com/fullchain.pem')
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});