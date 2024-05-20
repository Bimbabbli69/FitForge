if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user'); // Import the User model

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    async email => await User.findOne({ email: email }),
    async id => await User.findById(id)
);

app.set('view-engine', 'ejs');
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.static('public'));

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to Mongoose'))
    .catch(error => console.error('Error connecting to Mongoose:', error));

// Routes
const indexRouter = require('./Controllers/index');
const exerciseRouter = require('./Controllers/exercises');
const muscleGroupRouter = require('./Controllers/musclegroups');

app.use('/', indexRouter);
app.use('/exercises', checkAuthenticated, exerciseRouter);
app.use('/musclegroups', checkAuthenticated, muscleGroupRouter);

// Authentication routes and logic
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs', { error: null });
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err);
        res.render('register.ejs', { error: 'Failed to register user. Please try again.' });
    }
});


app.delete('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});

// Middleware functions
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
