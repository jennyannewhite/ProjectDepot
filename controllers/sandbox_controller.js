// REQUIRE FUNCTIONS FROM THE MODELS FOLDER (index.js, post.js, user.js, userpost.js)
var db = require("../models");
// CHECKS IF USER IS LOGGED IN
var loginBool = require("./login_controller");
//REQUIRE PASSPORT AND NODE MAILER
var passport = require('passport');
const nodemailer = require('nodemailer');


//SETUP NODE MAILER
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sandboxteam321@gmail.com',
        pass: 'sandboxfordevs'
    }
});


// EXPORT ROUTES
module.exports = function (app) {


    // ROOT ROUTE
    app.get("/", function (req, res, next) {
        Promise.all([
            db.Post.findAll({order: [['updatedAt', 'DESC']]}),
            db.User.findAll({}),
            db.UserPost.findAll({})
        ]).then(function (result) {
            var posts = result[0];
            var users = result[1];
            var groups = result[2];
            res.render("index", {
                posts: posts,
                users: users,
                groups: groups,
                user: req.user
            });
        }).catch(function (e) {
            console.log(e);
        });
    });


    // POST ROUTE FOR NEW SUBMISSIONS
    app.post('/add/', function (req, res) {
        //STOP AND LAUNCH MODAL IF NOT LOGGED IN
        if(JSON.stringify(req.user) === undefined){
            Promise.all([
                    db.Post.findAll({})
                ]).then(function (result) {
                    res.render("pleaseLoginModal", {
                        posts: result[0] || []
                    });
                });
        //IF LOGGED IN
        } else {
            var newPost = req.body;
            //VALIDATE INPUT FIELDS HAVE DATA
            if(req.body['body'] !== "" || req.body['groupLimit'] !== ""){
                //STORE USER'S EMAIL
                var currentUser = req.user._json.email;
                //FETCH USER OBJECT FROM DB
                Promise.all([
                        db.User.find({
                            where: {
                                email: currentUser
                            }
                        })
                    ]).then(function (result) {
                            //CREATE THE POST OBJECT USING DATA FROM USER AND INPUT FIELDS
                            db.Post.create({
                                authorEmail: result[0]['email'],
                                groupLimit: newPost['groupLimit'],
                                body: newPost['body'],
                                pictureUrl: result[0]['picture_url'],
                                user: result[0]['user_name'],
                                authorId: result[0]['id']
                            }).then(function (result) {
                                //WHEN A NEW POST IS CREATED, ASSOCIATE THE AUTHOR WITH THEIR GROUP
                                db.UserPost.create({
                                    userEmail: currentUser,
                                    UserId: result['authorId'],
                                    PostId: result['id']
                                })
                                //REDIRECT/REFRESH TO SEE UPDATES
                                res.redirect('/');
                        }).catch(function (err) {
                            console.log(err);
                        });
                    });
                //STOP AND LAUNCH MODAL IF INPUTS ARE EMPTY
                } else {
                    Promise.all([
                        db.Post.findAll({})
                    ]).then(function (result) {
                        res.render("emptyInputModal", {
                            posts: result[0] || []
                        });
                    });
                }

        }
    });

    // POST ROUTE FOR JOINS
    app.post('/post/join', function (req, res) {
        //STOP AND LAUNCH MODAL IF NOT LOGGED IN
        if(JSON.stringify(req.user) === undefined){
            Promise.all([
                    db.Post.findAll({}),
                    db.User.findAll({}),
                    db.UserPost.findAll({})
                ]).then(function (result) {
                    res.render("pleaseLoginModal", {
                        posts: result[0] || [],
                        users: result[1] || [],
                        groups: result[2] || []
                    });
                });
        }
        //IF USER IS LOGGED IN...
        else {
            //GET CURRENT USER INFO AND USER SELECTED SUBMISSION
            var currentUser = req.user._json.email;
            var selectPostId = req.body.postId;
            var selectGroupLimit = req.body.groupLimit;
                //THEN FIND ALL UserPost SUBMISSIONS ASSOCIATED WITH THAT POST
                db.UserPost.findAll({
                    where: {
                        postId: selectPostId
                    }
                }).then(function (result) {
                    //THEN CHECK IF CURRENT USER ALREADY JOIN THIS GROUP
                    var userAlreadyJoinBool=false;
                    for (var i = 0; i < result.length; i++) {
                        if(result[i]['userEmail'] === currentUser){
                        userAlreadyJoinBool=true;
                        }
                    }

                    //IF USER ALREADY JOINED GROUP, STOP AND LAUNCH MODAL
                    if(userAlreadyJoinBool){
                        Promise.all([
                            db.Post.findAll({}),
                        ]).then(function (result) {
                            var posts = result[0];
                            res.render("cantJoinModal", {
                                posts: posts,
                                user: req.user
                            });
                        }).catch(function (e) {
                            console.log(e);
                        });

                    //IF USER HAS NOT JOINED GROUP, CREATE UserPost WITH USER AND POST DATA
                    } else{
                        var emailBody;
                        Promise.all([
                            db.User.find({
                                where: {
                                    email: currentUser
                                }
                            }),
                            db.Post.find({
                                where: {
                                    id: selectPostId
                                }
                            })
                        ]).then(function (result) {
                            //SAVE EMAIL BODY
                            emailBody = result[1]['body'];
                            // CHECK IF GROUP LIMIT IS MET ONCE UserPost IS CREATED
                            db.UserPost.create({
                                userEmail: currentUser,
                                UserId: result[0]['id'],
                                PostId: selectPostId
                            }).then(function (result) {
                                db.UserPost.findAll({
                                where: {
                                    postId: selectPostId
                                }
                            }).then(function (result) {
                                    // IF GROUP LIMIT IS MET, SEND TO PAST PROJECTS AND SEND EVERYONE AN EMAIL
                                   if (result.length == selectGroupLimit) {
                                    var listOfEmails="";
                                    for (var i = 0; i < result.length; i++) {
                                        var recipient = result[i]['userEmail'] + ', ';
                                        listOfEmails = listOfEmails.concat(recipient);
                                    }

                                    listOfEmails = listOfEmails.slice(0, (listOfEmails.length - 2));

                                        // SETUP EMAIL DATA WITH UNICODE SYMBOLS
                                        var mailOptions = {
                                            from: '"Dev Depot Team 🤓" <devdepotUSA@gmail.com>', // EMAIL SENDER ADDRESS
                                            to: listOfEmails, // LIST OF EMAIL RECIPIENTS
                                            subject: 'Dev Depot Collaboration Team!', // SUBJECT LINE
                                            text: 'Hey there! Let\'s work together on this project!', // PLAIN TEXT BODY
                                            html: '<b>Hey there! Let\'s work together on this project!</b><p>Your group\'s project description is written below: </p>' + '"'+emailBody+'"'
                                        };
                                        transporter.sendMail(mailOptions, (error, info) => {
                                            if (error) {
                                                return console.log(error);
                                            }
                                            console.log('Message %s sent: %s', info.messageId, info.response);
                                        });
                                        db.Post.update({
                                                capacity: true
                                            }, {
                                                where: {
                                                id: selectPostId
                                                }
                                        });
                                    Promise.all([
                                        db.Post.findAll({}),
                                    ]).then(function (result) {
                                        var posts = result[0];
                                        res.render("joinAndEmailModal", {
                                            posts: posts,
                                            user: req.user
                                        });
                                    }).catch(function (e) {
                                        console.log(e);
                                    });
                               }
                               // IF GROUP LIMIT IS NOT MET, ALERT USER THEY HAVE JOINED SUCCESSFULLY
                               else{

                                    Promise.all([
                                            db.Post.findAll({}),
                                        ]).then(function (result) {
                                            var posts = result[0];
                                            res.render("joinModal", {
                                                posts: posts,
                                                user: req.user
                                            });
                                        }).catch(function (e) {
                                            console.log(e);
                                        });
                                    }

                            });

                            });

                        });
                    }

                });
        }

    });
};