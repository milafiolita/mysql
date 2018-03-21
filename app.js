var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var flash = require('connect-flash');
var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var sess = require('express-session');
var flash  = require('connect-flash');
var Store = require('express-session').Store;
var BetterMemoryStore = require('session-memory-store')(sess);
var index = require('./routes/index');
var users = require('./routes/users');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var moment = require('moment');
var app = express();
var nodemailer = require('nodemailer');
/*const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);*/

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'oksawahyu123@gmail.com',
    pass: 'oksaEdukreasi'
  }
});
var app = express();

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "task1"
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
var store = new BetterMemoryStore({ expires: 60 * 60 * 1000, debug: true });

app.use(sess({
  name: 'JSESSION',
  secret: 'MYSECRETISVERYSECRET',
  store:  store,
  resave: true,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use("local", new LocalStrategy({
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true //passback entire req to call back
    },
    function(req, username, password, done) {
      if (!username || !password) { 
        return done(null,false,req.flash("message", "All fields are required."));
      }

      var salt = "7fa73b47df808d36c5fe328546ddef8b9011b2c6";
      
      con.query("select * from user where username = ?", [username], function(err, rows) {
         // console.log(err);
          console.log(rows);

          if (err) return done(req.flash("message", err));

          if (!rows.length) { return done(null, false, req.flash("message", "Invalid username or password."));
          }

          salt = salt + "" + password;

          var encPassword = crypto.createHash("sha1").update(salt).digest("hex");

          var dbPassword = rows[0].password;
          
          if (!(dbPassword == encPassword)) {
            return done(null,false,req.flash("message", "Invalid username or password."));
          }

          return done(null, rows[0]);
      });
    })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  con.query("select * from user where id = ? ", [id], function(err,user) {
    if (err) return done(err);
    done(null, user);
  });
});

app.post('/login', passport.authenticate('local', { successRedirect: '/students', failureRedirect: '/login', failureFlash: true }), function(req, res, info){
  res.render('index', {'message' :req.flash('message')});
});

app.get('/login',function(req,res){
  res.render('login', {'message' :req.flash('message')});
});
app.get('/forgot', function(req, res){
  if (req.isAuthenticated()) {
    res.redirect('/home');
  } else {
  res.render('forgot',{'message' :req.flash('message')});
  };
});

app.post('/forgot', function(req, res, next) {
  var email = req.body.emailForgot;
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },

    function(token, done) {
      con.query("SELECT * FROM user WHERE user_email = ?", email, function(err, rows) {
        if (rows.length <= 0) {
          req.flash('error', 'No account with that email address exists.');
          return res.render('forgot',{'error' :req.flash('error')});
        }
        var spw_token = token;
        var reset = {user_forgot: spw_token}
        con.query("UPDATE user SET ? WHERE user_email = '"+email+"' ", [reset], function(err,rows) {
          done(err, token, rows);
          console.log('rows',rows);
        });
      });
    },
    
    function(token, rows, done) {
      console.log('token = ',token);
      console.log('email = ',email);
      var msge = {
        to: email,
        from: 'milafiolita01@gmail.com',
        subject: 'Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://localhost:3000/reset/'+ token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n',
      };
      transporter.sendMail(msge, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.render('login',{'info' :req.flash('info'),'error' :req.flash('error')});
  });
});

app.get('/reset/:token', function(req, res){
  con.query('SELECT * FROM user WHERE user_forgot = ?', [req.params.token], function(err, rows, fields) {
    if(err) throw err
    
    // if user not found
    if (rows.length <= 0) {
        res.redirect('/login')
    } else { 
      // if user found
      // render to views/index.pug template file
      res.render('reset', {
        title: 'Edit User', 
        uid: rows[0].id
      })
    }            
  });
});

app.post('/reset_password', function(req, res) {
  var password = req.body.password;
  var konfirm = req.body.konfirm;
  var id = req.body.id;
  
  if (password == konfirm) {
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    salt = salt + "" + password;
    var newPassword = crypto.createHash("sha1").update(salt).digest("hex");
    con.query('UPDATE user SET user_forgot = null, password = ? WHERE id = ?', [newPassword, id], function (error, results, fields) {
      if (error) throw error;
      res.redirect('/login');
    });
  }
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

function formatDateForPug(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [month, day, year].join('/');
}

function formatDateForMySQL(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [day, month, year].join('-');
}

function getStudentGender(rows, studentGender){
  if(studentGender === 'M'){
    gender = 'Male';
  } else {
    gender = 'Female';
  }
  return gender;
}

app.get('/logout',function(req,res){    
  req.session.destroy(function(err){  
      if(err){  
        console.log(err);  
      }  
      else  
      {  
        res.redirect('/login');  
      }  
  });  
});
///
/// HTTP Method	: GET
/// Endpoint 	: /person
/// 
/// To get collection of person saved in MySQL database.
///
app.get('/students', isAuthenticated, function(req, res) {
  var studentList = [];

  // Do the query to get data.
  con.query('SELECT * FROM students', function(err, rows, fields) {
    if (err) {
      res.status(500).json({"status_code": 500,"status_message": "internal server error"});
    } else {
      console.log(rows);

      // Loop check on each row
      for (var i = 0; i < rows.length; i++) {
        var gender = getStudentGender(rows, rows[i].gender);
        var dateOfBirth = formatDate(rows[i].date_of_birth);
        var admission_date = formatDate(rows[i].admission_date);

        // Create an object to save current row's data
        var students = {
          'student_id':rows[i].student_id,
          'name':rows[i].name,
          'admission_date':admission_date,
          'address':rows[i].address,
          'gender':gender,
          'date_of_birth':dateOfBirth,
          'student_email':rows[i].student_email
        }
        // Add object into array
        studentList.push(students);
    }

    // Render index.pug page using array 
    res.render('index', {title: 'Student List', data: studentList});
    }
  });
});

function transpose(original) {
  var copy = [];
  for (var i = 0; i < original.length; i++) {
      for (var j = 0; j < original[i].length; j++) {
          // skip undefined values to preserve sparse array
          if (original[i][j] === undefined) continue;
          // create row if it doesn't exist yet
          if (copy[j] === undefined) copy[j] = [];
          // swap the x and y coords for the copy
          copy[j][i] = original[i][j];
      }
  }
  return copy;
  }

  app.get('/statistics/:years', isAuthenticated, function(req, res)  {
    var getBulan = []; getJml = []; jmlBulan=[]; hasilJmlBulan=[]; getGen = []; getJmlGen = []; jmlGen=[]; hasilJmlGen=[];
    con.query('SELECT month(admission_date) as month, count(*) as frek FROM students WHERE year(admission_date)='+[req.params.years]+' group by month(admission_date)', function(err, rows, fields) {
      if (err) {
        console.log(err)
      } else {
        getBulan.push('month','January', 'February', 'March', 'April', 'Mei', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
        getJml.push('freks',0,0,0,0,0,0,0,0,0,0,0,0)
        for (var j = 0 ; j < rows.length ; j++) {
          var bulan = rows[j].month;
          getJml.fill(rows[j].frek, bulan, (bulan+1));       
        }
        jmlBulan.push(getBulan,getJml)
      }
      var hasilJmlBulan = transpose(jmlBulan);  
      console.log(hasilJmlBulan);
  
      con.query('SELECT gender, count(gender) as jml FROM students GROUP BY gender', function(err, rows, fields) {
        if (err) {
          console.log(err)
        } else {
          getGen.push('gender')
          getJmlGen.push('frek gend')
          for (var j = 0 ; j < rows.length ; j++) {
            if (rows[j].gender === 'F') {
              getGen.push('FEMALE')
            } else {
              getGen.push('MALE')
            }
            getJmlGen.push(rows[j].jml)       
          }
          jmlGen.push(getGen,getJmlGen)
        }
        var hasilJmlGen = transpose(jmlGen);  
        console.log(hasilJmlGen);
        res.render('statistic',{obj1: JSON.stringify(hasilJmlGen), obj2: JSON.stringify(hasilJmlBulan)});
      })  
    })  
  });

app.get('/input', isAuthenticated, (req, res) =>
   res.render('input.pug')
);

app.post('/input', isAuthenticated, function(req, res) {
 //var studentList = [];

 var insertStudent = {
   student_id: req.body.student_id,
   name: req.body.name,
   address: req.body.address,
   date_of_birth: formatDateForMySQL(req.body.date_of_birth),
   admission_date: new Date(),
   gender: req.body.gender,
   student_email: req.body.student_email,
 };

 //console.log(insertStudent);
 // Do the query to insert data.
 con.query('INSERT INTO students set ? ', insertStudent, function(err, rows, fields) {
   if (err) {
     //res.status(500).json({"status_code": 500,"status_message": "internal server error"});
     console.log(err);
   } else {
     //console.log(rows);
     res.redirect('/students');
   }
 });
});

app.get('/students/:id', isAuthenticated, function(req, res){
	con.query('SELECT * FROM students WHERE student_id = ?', [req.params.id], function(err, rows, fields) {
		if(err) throw err
		
		// if user not found
		if (rows.length <= 0) {
				res.redirect('/students')
		} else { 
      var studentDoB = formatDate(rows[0].date_of_birth, 'mysql');
      console.log(studentDoB);

			// if user found
			// render to views/index.pug template file
			res.render('edit', {
				title: 'Edit Student', 
				sid: rows[0].student_id,
				sname: rows[0].name,
				saddress: rows[0].address,
        sgender: rows[0].gender,
        student_email: rows[0].student_email,
        sadmiss: formatDate(rows[0].admission_date),
				sdob: studentDoB
			})
		}            
	});
});

app.get('/students/delete/:id', isAuthenticated, function (req, res) {
  con.query('DELETE FROM students WHERE student_id = ?', [req.params.id], function(err, result) {
    if(err) throw err
    res.redirect('/students');
  });
});

app.post('/search', function(req, res) {
  var studentList = [];
  var keyword = req.body.keyword;
  var kolom = req.body.kolom;
  var sortBy = req.body.sortBy;

  // Do the query to get data.
  con.query('SELECT * FROM students WHERE '+kolom+' LIKE \'%'+ keyword +'%\' ORDER BY '+kolom+' '+sortBy+'', function(err, rows, fields) {
    if (err) {
      res.status(500).json({"status_code": 500,"status_message": "internal server error"});
    } else {
      console.log(rows);

    // Loop check on each row
    for (var i = 0; i < rows.length; i++) {
      var gender = getStudentGender(rows, rows[i].gender);
      var dateOfBirth = formatDate(rows[i].date_of_birth);
      var admission_date = formatDate(rows[i].admission_date);

      // Create an object to save current row's data
      var students = {
        'student_id':rows[i].student_id,
        'admission_date':admission_date,
        'name':rows[i].name,
        'address':rows[i].address,
        'gender':gender,
        'date_of_birth':dateOfBirth,
        'student_emai':rows[i].student_email,        
      }
      // Add object into array
      studentList.push(students);
    }

    // Render index.pug page using array 
    res.render('index', {title: 'Student List', data: studentList});
    }
  });
});

///
/// HTTP Method	: POST
/// Endpoint 	: /insert_update_student
/// 
/// To insert or update student data in MySQL database.
///
app.post('/edit', function(req, res) {

	var name = req.body.name;
	var address = req.body.address;
	var gender = req.body.gender;
  var date_of_birth = formatDateForMySQL(req.body.date_of_birth);
  var student_email = req.body.student_email;
  var student_id = req.body.oldId;
	console.log(student_id+''+name+' '+address+' '+gender+' '+date_of_birth+''+student_email);

	//var postData  = {student_id: student_id, name: name, address: address, gender: gender, date_of_birth: date_of_birth};

		con.query('UPDATE students SET name = ?, address = ?, student_email =?, gender = ?, date_of_birth = ? WHERE student_id = ?', [name, address,student_email, gender, date_of_birth, student_id], function (error, results, fields) {
			if (error) throw error;
			res.redirect('/students');
	});
});

app.get('/fstudent', function(req, res) {
  // Render index.pug page using array 
  res.render('student', {title: 'Student'});
});

app.get('/addUser', (req, res) =>
   res.render('addUser.pug')
);

app.post('/addUser', function(req, res) {
 var username = req.body.username;
 var password = req.body.password;
 var user_email = req.body.user_email;

 var insertUser = {
   username: req.body.username,
   password: crypto.createHash('sha1').update(password).digest('hex'),
   user_email: req.body.user_email,
   user_forgot: undefined,
 };

 con.query('select * from user where username = ? OR user_email = ?', [username, user_email], function(err, rows, fields) {
  if (err) {
  console.log(err);
  } else if (rows.length > 0) {
    alertNode('You entered duplicate username or email!');
  } else {
    con.query('INSERT INTO user set ? ', insertUser, function(err, rows, fields) {
      if (err) {
        console.log(err);
      } else {
        console.log(rows);
      }
      res.redirect('/');
    });
  }
 });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
