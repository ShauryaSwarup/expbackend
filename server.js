const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const {logger} = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const PORT = process.env.PORT || 3500;

//custom middleware logger
app.use(logger);

//Handles options credentials check - before CORS
//fetch cookies credentials requirement
app.use(credentials);

//cors
app.use(cors(corsOptions));

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/',express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

//routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

app.use(verifyJWT)
app.use('/api/employees', require('./routes/api/employees'));

// Nothing found
app.all('*', (req, res) => {
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if(req.accepts('json')) {
        res.json({error: 'Not found'});
    } else {
        res.type('txt').send('Not found');
    }
})

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));