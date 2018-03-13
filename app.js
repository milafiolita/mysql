var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "task1"
});

// view engine setup
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

///
/// HTTP Method	: GET
/// Endpoint 	: /person
/// 
/// To get collection of person saved in MySQL database.
///
app.get('/students', function(req, res) {
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
          'date_of_birth':dateOfBirth
        }
        // Add object into array
        studentList.push(students);
    }

    // Render index.pug page using array 
    res.render('index', {title: 'Student List', data: studentList});
    }
  });
});

function dataAdapter(obj, cols)  {
  const charData = [cols];

  for (rows in data) {
    const temp = [];
    for (prop in cols) {
      temp.push(prop)
    }
    charData.push(temp);
  }
}

function transpose(original) {
  var copy = [];
  for (var i = 0; i < original.length; ++i) {
      for (var j = 0; j < original[i].length; ++j) {
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

app.get('/statistics', function(req, res)  {
  var getBulan = []; getJml = []; jmlBulan=[]; hasilJmlBulan=[]; getGen = []; getJmlGen = []; jmlGen=[]; hasilJmlGen=[];
  con.query('SELECT month,COUNT(frek) as frek FROM student_chart GROUP BY month', function(err, rows, fields) {
    if (err) {
      console.log(err)
    } else {
      getBulan.push('month')
      getJml.push('frek')
      for (var j = 0 ; j < rows.length ; j++) {
        if (rows[j].month === 1) {
          getBulan.push('January')
        } else if (rows[j].month === 2) {
          getBulan.push('February')
        } else if (rows[j].month === 3) {
          getBulan.push('March')
        } else if (rows[j].month === 4) {
          getBulan.push('April')
        } else if (rows[j].month === 5) {
          getBulan.push('May')
        } else if (rows[j].month === 6) {
          getBulan.push('June')
        } else if (rows[j].month === 7) {
          getBulan.push('July')
        } else if (rows[j].month === 8) {
          getBulan.push('August')
        } else if (rows[j].month === 9) {
          getBulan.push('September')
        } else if (rows[j].month === 10) {
          getBulan.push('October')
        } else if (rows[j].month === 11) {
          getBulan.push('November')
        } else {
          getBulan.push('December')
        }       
        getJml.push(rows[j].frek)       
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
      res.render('statistic',{obj1: JSON.stringify(hasilJmlBulan), obj2: JSON.stringify(hasilJmlGen)});
    })  
  })  
});

app.get('/input', (req, res) =>
   res.render('input.pug')
);

app.post('/input', function(req, res) {
 //var studentList = [];

 var insertStudent = {
   student_id: req.body.student_id,
   name: req.body.name,
   address: req.body.address,
   date_of_birth: formatDateForMySQL(req.body.date_of_birth),
   admission_date: new Date(),
   gender: req.body.gender
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

app.get('/students/:id', function(req, res){
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
				sdob: studentDoB,
				sOldId: rows[0].student_id
			})
		}            
	});
});

app.get('/students/delete/:id', function (req, res) {
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

        // Create an object to save current row's data
        var students = {
          'student_id':rows[i].student_id,
          'admission_date':rows[i].admission_date,
          'name':rows[i].name,
          'address':rows[i].address,
          'gender':gender,
          'date_of_birth':dateOfBirth
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
  var student_id = req.body.oldId;
	console.log(student_id+''+name+' '+address+' '+gender+' '+date_of_birth);

	//var postData  = {student_id: student_id, name: name, address: address, gender: gender, date_of_birth: date_of_birth};

		con.query('UPDATE students SET name = ?, address = ?, gender = ?, date_of_birth = ? WHERE student_id = ?', [name, address, gender, date_of_birth, student_id], function (error, results, fields) {
			if (error) throw error;
			res.redirect('/students');
	});
});

app.get('/fstudent', function(req, res) {
  // Render index.pug page using array 
  res.render('student', {title: 'Student'});
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
