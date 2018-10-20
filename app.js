const express = require('express');

// Init app
const app = express();
const PORT = process.env.PORT || 3000;

// Routing
app.get('/', (req, res) => {
  res.send('!')
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`)
});