const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors({
  origin: ['https://sbcta-hosting.web.app', 'http://127.0.0.1:5500', 'http://localhost:5500']
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Retrieve API Key
const { MC_APIKEY, MC_INSTANCE, MC_LISTID, RECAPTCHA_SECRET_KEY } = require('./secret.json');

const request = require('superagent');
app.post('/signup', (req, res) => {
  if(!req.body.token)
    return res.status(401).send(new Error('Authorization header is required'));
  if(!req.body.email)
    return res.status(400).send(new Error('Key \'body\' is required'));
  if(!req.body.firstName)
    return res.status(400).send(new Error('Key \'firstName\' is required'));
  if(!req.body.lastName)
    return res.status(400).send(new Error('Key \'lastName\' is required'));
  
  console.log('Attempting to send email with', JSON.stringify(req.body, null, 4));
  
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
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});