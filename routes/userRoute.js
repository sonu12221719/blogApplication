const express = require("express");
const user_route = express();

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

const cookieParser = require('cookie-parser');
user_route.use(cookieParser());

const session = require('express-session');
const config = require('../config/config');
user_route.use(session({
    secret:config.sessionSecret,
    resave:true,
    saveUninitialized:true
}));

user_route.set('view engine','ejs');
user_route.set('views','./views');

user_route.use(express.static('public'));

const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const adminLoginAuth = require('../middlewares/adminLoginAuth');
const userAuth = require('../middlewares/userAuth');

user_route.get('/login',adminLoginAuth.isLogout,userController.loadLogin);
user_route.post('/login',userController.verifyLogin);
user_route.get('/register',userAuth.isLogout,userController.loadRegister);
user_route.post('/register',userAuth.isLogout,userController.register);


const multer = require('multer');
const path = require('path');

user_route.use(express.static('public'));

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null,path.join(__dirname,'../public/images'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});

const upload = multer({storage:storage});
user_route.get('/blog-setup', adminController.blogSetup);
user_route.post('/blog-setup',upload.single('blog_image'), adminController.blogSetupSave);

user_route.get('/logout',adminLoginAuth.isLogin,userController.logout);
user_route.get('/user-logout',userAuth.isLogin,userController.logout);

user_route.get('/forget-password',adminLoginAuth.isLogout, userController.forgetLoad);

user_route.post('/forget-password',userController.forgetPasswordVerify);

user_route.get('/reset-password',adminLoginAuth.isLogout, userController.resetPasswordLoad);
user_route.post('/reset-password', userController.resetPassword);

module.exports = user_route;