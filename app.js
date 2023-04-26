const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');

const PORT = 3000;

app.use(cors({
  origin: ['https://eliasmurcray.com', 'http://localhost:4200']
}));

app.use(bodyParser.json());

app.get('/', (_req, res) => {
  res.send('Server is running');
});

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/api.eliasmurcray.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/api.eliasmurcray.com/fullchain.pem')
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});