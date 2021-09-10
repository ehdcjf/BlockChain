const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.listen(port,()=>{
  console.log(`Server Start Port ${port}`);
})