// BASE SETUP
// ===========================================

// CALL THE PACKAGES -------------------------
var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    morgan        = require('morgan'),
    mongoose      = require('mongoose'),
    User          = require('./models/user'),
    port          = process.env.PORT || 8080;

// connect to our database (local one for now)
mongoose.connect('localhost:27017/tilt_test');

//SITE CONFIGURATION -------------------------
//use bodyParser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

//configure our app to handle CORS requests
app.use(function(req, res, next){
    res.setHeader('Acccess-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-REquested-With, content-type, \ Authorization');
    next();
});

//log all requests to the console
app.use(morgan('dev'));

// ROUTES FOR OUR API
// ===========================================

// basic route for the home page
app.get('/', function(req, res){
    res.send('Welcome to the homepage!');
});

// get an instance of the express router
var apiRouter = express.Router();

// MIDDLE WARE
// -----------------------
apiRouter.use(function(req, res, next){
    //do logging
    console.log('Somebody just came to our site!');
    //More middle ware to come
    //This is where we will authenticate users
    next(); //This makes sure we go to the next routes, and don't stop here
});

// test route to make sure everything is working
// accessed at GET http://localhost:8080/api
apiRouter.get('/', function(req, res){
    res.json({ message: 'hooray! weclome to our API'});
});

// on routes that end in /users
// -------------------------------------------
apiRouter.route('/users')

        //create a user (accessed at POST http://localhost: 8080/api/users)
        .post(function(req, res) {
            //create a new instance of the User model
            var user = new User();

            //set the user's information (comes from the request)
            user.name = req.body.name;
            user.username = req.body.username;
            user.password = req.body.password;

            //save the user and check for errors
            user.save(function(err){
                if (err){

                    switch(err.code){
                        case 11000:
                            return res.json({ success: false, message: 'A user \
with that username already exists'});
                            break;
                        default:
                            return res.send(err);
                    }

                }

                res.json({ message: 'User created!' });
            });

        })

        //get all the users (accessed at GET http://localhost:8080/api/users)
        .get(function(req, res){
            User.find(function(err, users){
                if(err){
                    res.send(err);
                }

                // return the users
                res.json(users);
            });
        });

// on routes that end in /users/:user_id
// -------------------------------------------
apiRouter.route('/users/:user_id')
        // get the user with that id
        // accessed at GET http://localhost:8080/api/users/:user_id
        .get(function(req, res){
            User.findById(req.params.user_id, function(err, user){
                if (err){
                    res.send(err);
                }
                res.json(user);
            });
        })

        // update the user with this id
        // accessed at GET http://localhost:8080/api/users/:user_id
        .put(function(req, res){
            //use our user model to find the user we want
            User.findById(req.params.user_id, function(err, user){
                if(err){
                    res.send(err);
                }
                if(req.body.name){
                    user.name = req.body.name;
                }
                if(req.body.username){
                    user.username = req.body.username;
                }
                if(req.body.password){
                    user.password = req.body.password;
                }

                user.save(function(err){
                    if(err){
                        res.send(err);
                    }

                    res.json({ message: 'User updated!'});
                });
            });
        })

        .delete(function(req, res){
            User.remove({
                _id: req.params.user_id
            }, function(err, user){
                if(err){
                    res.send(err);

                    res.json({ message: 'Successfully deleted' });
                }
            });
        });

// REGISTER OUR ROUTES -----------------------
// all of these routes will be prefixed with /api
app.use('/api', apiRouter);

// START THE SERVER
// ===========================================

app.listen(port);
console.log('Head to localhost:' + port);
