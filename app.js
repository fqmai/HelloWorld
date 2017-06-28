var express                 = require("express"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    bodyParser              = require("body-parser"),
    User                    = require("./models/user"),
    LocalStrategy           = require("passport-local"),
    passportLocalMongoose   = require("passport-local-mongoose");
    
    
mongoose.connect("mongodb://localhost/auth_demo_app");




var app = express();
app.set('view engine', 'ejs');

// The following line is necessary whenever we use a form
app.use(bodyParser.urlencoded({extended: true})); 

app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,
    saveUnitialized: false
}));

// need the following two lines whenever we use passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//===========
// ROUTES
//===========


app.get("/", function(req, res){
    res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res){
    res.render("secret");    
});


// Auth Routes

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    // never save the password to db, but save the hashed version
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){ // could use twitter, facebook, etc here
            res.redirect("/secret");
        });
    });
});

// Login Routes
//rener login form
app.get("/login", function(req, res){
    res.render("login"); 
});

//login logic
//middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function(req, res){
    res.render("login"); 
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started............");
});