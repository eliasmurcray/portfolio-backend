const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const { MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE } = require('./secret.json');
console.log(MJ_APIKEY_PRIVATE, MJ_APIKEY_PUBLIC);

const mailjet = require('node-mailjet')
	.connect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE);

const request = mailjet
	.post("send", {'version': 'v3'})
	.request({
      "FromEmail":"pilot@mailjet.com",
      "FromName":"Your Mailjet Pilot",
      "Recipients":[
        {
          "Email":"passenger@mailjet.com",
          "Name":"Passenger 1"
        }
      ],
      "Subject":"Your email flight plan!",
      "Text-part":"Dear passenger, welcome to Mailjet! May the delivery force be with you!",
      "Html-part":"<h3>Dear passenger, welcome to Mailjet!</h3><br />May the delivery force be with you!"
    })
request
	.then((result) => {
		console.log(result.body)
	})
	.catch((err) => {
		console.log(err.statusCode)
	});

app.use(cors({
  origin: ['https://sbcta-hosting.web.app', 'http://127.0.0.1:5500', 'http://localhost:5500']
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('hello world!');
});

app.post('/contact', (req, res) => {
  
});

app.post('/addOne', (req, res) => {
  const { num } = req.body;
  const result = num + 1;
  res.send(result.toString());
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});