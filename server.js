require('dotenv').config();
const express = require('express');
const path = require('path');
const config = require('./config');
const apiRouter = require('./routes/api');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRouter);

app.listen(config.port, () => {
  console.log(`🚀 CRM-рассылка запущена на http://localhost:${config.port}`);
});