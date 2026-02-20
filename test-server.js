const express = require('express');
const app = express();

app.get('/test', (req, res) => {
    res.json({ success: true, message: 'Server working' });
});

app.listen(3001, () => {
    console.log('Test server on port 3001');
});
