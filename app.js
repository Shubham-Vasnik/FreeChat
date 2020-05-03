const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const http = require('http');
const socketio = require('socket.io');
const moment = require('moment');
const User = require('./models/users');
const Group = require('./models/groups');
const Message = require('./models/messages');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
mongoose.connect('mongodb://localhost:27017/freechat', {useUnifiedTopology: true,useNewUrlParser: true});
const io = socketio(server);
app.use(require("express-session")({
    secret:"Hi There Whats Up",
    resave:false,
    saveUninitialized:false,
}));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.group = req.group
    next();
 });


const isLoggedIn = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.get("/", function (req,res) {
    res.render('home');
});

app.get("/register",(req,res) => {
    res.render('register');
});

app.post("/register",(req,res) => {
    User.register(new User({username:req.body.username}),req.body.password,(err,user)=>{
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req,res,()=>{
            res.redirect("/login");
        });
    });
});

app.get("/login",(req,res)=>{
    res.render('login');
});

app.post("/login",passport.authenticate("local",{
    failureRedirect:"/login"
}),(req,res)=>{
    User.findById(req.user._id,(err,user)=>{
        if(err){
            console.log(err);
            res.redirect("/login");
        }
        else{
            user.online=true;
            user.save();
            res.redirect("/groups");
        }
    });
    
});

app.get("/logout", (req,res)=>{
    User.findById(req.user._id,(err,user)=>{
        if(err){
            console.log(err);
        }
        else{
            user.online = false;
            user.save(); 
        }
    });
    req.logout();
    res.redirect("/");
});

app.get("/guest",(req,res)=>{
    const id = "5eaad12fedea6e3b74724420";
    User.findById(id,(err,user)=>{
        if(err){
            console.log(err);
        }
        else{
            req.login(user, function(err) {
                if (err) { return next(err); }
                return res.redirect("/groups");
              });
        }
    })
})

app.get("/offline",(req,res)=>{
    res.render('offline');
});

app.get("/groups",isLoggedIn,(req,res)=>{
    User.findById(req.user._id).populate("groups").exec((err,foundUser)=>{
        if(err){
            console.log(err);
        } else {
            // console.log(foundUser);
            let groups = foundUser.groups;
            res.render('groups',{groups});
        }
    });
    
    
});

app.get("/groups/create",isLoggedIn,(req,res)=>{
    res.render('createGroup');
});

app.post("/groups/create", isLoggedIn, function(req, res){
    let name = req.body.groupname;
    let image = req.body.groupicon;
    let desc = req.body.description;
    let admin = {
        id: req.user._id,
        username: req.user.username
    }
    let newGroup = {name: name, groupIcon: image, description: desc, admin:admin}
    Group.create(newGroup, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            newlyCreated.members.push(admin.id);
            newlyCreated.save();
            console.log(newlyCreated);
            User.findById(req.user._id,(err,user)=>{
                if(err){
                    console.log(err);
                    res.redirect("/groups/create");
                }
                else{
                    let id = newlyCreated._id;
                    user.groups.push(id);
                    user.save();
                }
            });
            res.redirect("/groups");
        }
    });
});


app.get("/groups/join",isLoggedIn,(req,res)=>{
    res.render('joinGroup');
});

app.post("/groups/join",isLoggedIn,(req,res)=>{
    let name = req.body.groupname;
    Group.find({name},(err,group)=>{
        if(err){
            console.log(err);
            res.redirect("/groups/join");
        }
        else{
            // console.log(group);
            group[0].members.push(req.user._id);
            group[0].save();
            User.findById(req.user._id,(err,user)=>{
                if(err){
                    console.log(err);
                    res.redirect("/groups/join");
                }
                else{
                    let id = group[0]._id;
                    user.groups.push(id);
                    user.save();
                }
            });
            res.redirect("/groups");
        }
    });
});

app.get("/group/:id",isLoggedIn,(req,res)=>{
    Group.findById(req.params.id).populate("messages").populate('members').exec((err,foundGroup)=>{
        if(err){
            console.log(err);
        }
        else{
            // console.log(foundGroup);
            res.group = foundGroup.name;
            res.render("chat",{group:foundGroup});
        }
    });
});

app.post("/group/:id",isLoggedIn,(req,res)=>{
    Group.findById(req.params.id,(err, group)=>{
        if(err){
            console.log(err);
            res.redirect("/groups");
        } else {
            // console.log(req.body);
            let msg={text:req.body.message};
            // console.log(msg);
            Message.create(msg,(err, message)=>{
                if(err){
                    console.log(err);
                } else {
                    message.author.id = req.user._id;
                    message.author.username = req.user.username;
                    message.time = moment().format('llll');
                    message.save();
                    group.messages.push(message);
                    group.save();
                    io.to(group.name).emit('message',message);
                    // console.log(message);
                }
            })
    }
});
});

app.get("/group/:id/leave",isLoggedIn,(req,res)=>{
    User.findById(req.user._id,(err,user)=>{
        if(err){
            console.log(err);
            res.redirect("/groups");
        }
        else{
                    const index = user.groups.indexOf(req.params.id);
                    console.log(user.groups);
                    console.log(req.params.id);
                    console.log(index);
                    if (index > -1) {
                    user.groups.splice(index, 1);
                    }
                    user.save();
                    Group.findById(req.params.id,(err,group)=>{
                        if(err){
                            console.log(err);
                        }
                        else{
                            const ind = group.members.indexOf(req.user._id);
                            if(ind > -1){
                                group.members.splice(ind, 1);
                            }
                            group.save();
                        }
                    });
                    res.redirect("/groups");
                    
                }
            });
    });

io.on('connection',socket => {
    console.log("New WS Connection....");
    socket.on('online',(detail)=>{
        socket.join(detail.currGroup);
        io.to(detail.currGroup).emit("userOnline",detail.user);
    });
    socket.on('leaveGroup',(detail)=>{
        socket.join(detail.currGroup);
        io.to(detail.currGroup).emit("userOffline",detail.user);
    });
    socket.on('disconnect',() => {
    })
    }
);



server.listen(PORT,'0.0.0.0',() => {console.log(`Server running on port ${PORT}`)});