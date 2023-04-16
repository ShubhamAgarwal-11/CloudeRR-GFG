const express = require('express');
const port = 8000;
const cookieParser = require('cookie-parser');
const app = express();
const server = require('http').Server(app);
const io= require('socket.io')(server);
// const {v4:uuidV4} = require('uuid');
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
// used for session cookie
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const MongoStore = require('connect-mongo')(session);
const sassMiddleware = require('node-sass-middleware');
const flash = require('connect-flash');
const customMware = require('./config/middleware');

app.use(sassMiddleware({
    src : './assets/scss',
    dest : './assets/css',
    debug : true,
    outputStyle : 'extended',
    prefix : '/css'
}))
app.use(express.static('public'))
app.use(express.urlencoded());
app.use(cookieParser());

app.use(express.static('./assets'));

app.use(expressLayouts);

// extract style and scripts from sub pages into layout
app.set('layout extractStyles',true);
app.set('layout extractScripts',true);

// setup view engine
app.set('view engine','ejs');
app.set('views','./views');
app.use(express.static('public'))
// mongo store is used to store the session cookie in the db
app.use(session({
    name : 'KYC',
    // TODO change the secret before deployment in production mode
    secret : 'something',
    saveUninitialized : false,
    resave : false,
    cookie:{
        maxAge : (1000 * 60 * 100)
    },
    store : new MongoStore(
        {
            mongooseConnection : db,
            autoRemove : 'disabled'
        },
        function(err){
            console.log(err || 'connect-mongodb setup ok');
        }
    )
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customMware.setFlash);

// use express router
app.use('/',require('./routes'));

// app.get('/', (req, res) => {
//     res.redirect(`/${uuidV4()}`)
//   });

//  app.get('/:room', (req, res) => {
//     res.render('room', { roomId: req.params.room })
//   });

  // io.on('connection', socket => {
  //   socket.on('join-room', (roomId, userId) => {
  //     socket.join(roomId)
  //     socket.to(roomId).broadcast.emit('user-connected', userId)
  
  //     socket.on('disconnect', () => {
  //       socket.to(roomId).broadcast.emit('user-disconnected', userId)
  //     })
  //   })
  // })

app.listen(port,function(err){
    if(err){
        console.log(`Error in running a server ${err}`);
        return err;
    }
    console.log(`Yup! My server is running on port ${port}`);
})