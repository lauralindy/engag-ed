const http = require('http');
const express = require('express');
const fs = require('fs');
const csvWriter = require('csv-write-stream');
const cors = require('cors');
const bodyParser = require('body-parser');

const path = require('path')
const multer  = require('multer')
const crypto = require('crypto')

const Faces = require('./faces')

const Emotions = require('./db')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './img/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, Date.now() + '.jpg');
    });
  }
});

var engagement = 0;
var sessionNumber = 0;
var upload = multer({ storage: storage })

let app = express();
app.server = http.createServer(app);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Faces.calc_attention("imgs/confused-students/img-02.jpg")

app.get("/t1", function(req, res){
  console.log("test");
  sessionNumber = new Date().getTime();
  var s = new Emotions({
    session: sessionNumber,
    confusion: [],
    distraction: []
  });
  s.save(function(){
    res.sendFile('public/teacher1.html', {root: __dirname })
  });
})

app.get("/teacher2", function(req, res){
	res.sendFile('public/teacher2.html', {root: __dirname })
})

app.get("/ajax/engagement", function(req,res){
	res.send(200, engagement)
})

app.post('/img', upload.single('pic'), function (req, res, next) {
   //Faces.calc_attention("img/1505574244769.jpg")// + req.file.filename)
   Faces.calc_attention("img/" + req.file.filename, updateEngagement)
   var s = Emotions.findOne({session: sessionNumber}, function(err, emotion){
     console.log(emotion)
     emotion.confusion.push({date: Date.now(), level: 1})
     emotion.distraction.push({date: Date.now(), level: 2})
     emotion.save()
   })
   res.send("done");
});

function updateEngagement(v){
	engagement = v;
}

app.post('/help', function(req,res){
	//console.log(req.body)
	res.send("")
});

app.get("/student", function(req, res){
	res.sendFile('public/student.html', {root: __dirname })
})

app.get("/", function(req, res){
	res.sendFile('public/index.html', {root: __dirname })
})

app.use(express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT || 3000)
