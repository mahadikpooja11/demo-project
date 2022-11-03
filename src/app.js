const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const multer = require('multer')
const path = require('path');
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: "",
  database: "nodelogin",

})

conn.connect((err) => {
  if (err) {
    console.log(err)
  }
  else {
    console.log("successful")
  }
})
const app = express();
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'static')));
const hbs = require('hbs')
const publicDirectoryPath = path.join(__dirname, "../public")
app.use(express.static(publicDirectoryPath))
app.set("view engine", 'hbs')

hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("filename", file)
    cb(null, './upload')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === "image/jpg") {
    cb(null, true)
  }
  else {
    cb(new Error("please upload an image"))
  }

}




const upload = multer({
  storage: storage
  , limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

// app.post('/auth',function(req,res){
//     console.log("hiii")
//   let username=req.body.username;
//   console.log("username",username)
//   let password= req.body.password;
//   console.log("password",password)
//  // if(username&password){
//     conn.query("SELECT * FROM persons where username=? AND password=?", [username,password],function(err,result){

//         if(err){
//             console.log(err)
//         }
//         else{
//         console.log("result",result)
//         }
//     })

// //  }


// })

app.get('/user_add', function (req, res) {
  // res.sendFile(path.join(__dirname, '/login.html');
  res.render("user_add.hbs")
});
app.get('/', function (req, res) {
  // res.sendFile(path.join(__dirname, '/login.html');
  res.render("user_list.hbs")
});



app.get('/user_list', function (req, res, next) {
  var sql = 'SELECT * FROM users WHERE IsDeleted=0';
  conn.query(sql, function (err, data, fields) {

    if (err) throw err;
    res.render('user_list.hbs', { title: 'User List', userData: data, name: "hhh" });
  });
});



app.post('/insert', upload.single("file"), function (req, res) {


  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const gender = req.body.optradio;
  const file = req.body.file;
  console.log("gender", gender)
  var sql = `INSERT INTO users
            (
                firstname, lastname,gender,city,address,file
            )
            VALUES
            (
                ?, ?,?,?,?,?
            )`;
  // var sql = `INSERT INTO persons(username,password)VALUES(username,password);`;


  conn.query(sql, [firstname, lastname, gender, city, address, file], function (err, result) {
    
    if (err) {
      console.log(err)

    }
    else {
      console.log("result", result)
    }

  })
})
app.get('/edit-form/:id', function (req, res, next) {
  var id = req.params.id;
  // console.log("id",id)
  var sql = `SELECT * FROM users WHERE PersonID=${id}`;
  conn.query(sql, function (err, rows, fields) {
    console.log("id",rows[0])
    res.render('editform.hbs', { title: 'Edit User', user: rows[0] });
  });
});
app.post('/edit/:id',upload.single("file"), function (req, res, next) {
  
  var id = req.params.id;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const gender = req.body.optradio;
  const file=req.body.file;
  const city = req.body.city;
  const address = req.body.address;
  var sql = `UPDATE users SET firstname="${firstname}", lastname="${lastname}",gender="${gender}",city="${city}",address="${address}",file="${file}" WHERE PersonID=${id}`;

  conn.query(sql, function (err, result) {
    if (err) throw err;
    console.log('record updated!');
    // res.redirect('/user_list');
  });

});
app.get('/delete/:id', function (req, res) {
  var id = req.params.id;
  console.log("----", id);
  console.log("hiiii")
  var sql = `UPDATE users SET IsDeleted = 1 WHERE PersonID=${id}`;
  // var sql = `DELETE FROM users WHERE PersonID=${id}`;
  conn.query(sql, function (err, result) {
    if (err) throw err;
    console.log('record deleted!');
    res.redirect('/user_list');
  });
});


app.listen(4000);
module.export = app