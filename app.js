const express = require('express');
const app = express();
const fs = require('fs');
const bluebird = require('bluebird');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
app.use(express.json());
bluebird.promisifyAll(fs);
const auth = (req, res, next) => {
  try {
    jwt.verify(req.get('Authorization'), 'anysecret');
    next();
  } catch (error) {
    res.send('You are not authorized');
  }
}

app.post('/students', auth, (req, res) => {
  fs.readFileAsync('./students.json')
  .then((data) =>{
    const students = JSON.parse(data);
    students.push(req.body);
    return students;
  }).then(data =>{
    data = JSON.stringify(data);
    return fs.writeFileAsync('./students.json', data);
  }).then(() =>{
    res.send('Student Created');
  }).catch((err) =>{
    res.send(err);
  });  
});

app.get('/students', auth, (req, res) => {
  fs.readFileAsync('./students.json').then((data) => {
    data = JSON.parse(data);
    res.json(data);
  }).catch((err) => res.send(err));
});

app.get('/students/:index', auth, (req, res) =>{
  fs.readFileAsync('./students.json').then(data => {
    data = JSON.parse(data);
    res.json(data[req.params.index]);
  }).catch((err)=>res.send(err));
});

app.post('/signup', async (req, res) =>{
  let data = await fs.readFileAsync('./students.json');
  data = JSON.parse(data);
  req.body.password = await bcrypt.hash(req.body.password, 12);
  data.push(req.body);
  await fs.writeFileAsync('./students.json', JSON.stringify(data));
  res.send('Account Created');
});

app.post('/login', async (req, res) => {
  let data = await fs.readFileAsync('./students.json');
  data = JSON.parse(data);
  for (const element of data) {
    console.log(element);
    if(element.email === req.body.email ) {
      if(await bcrypt.compare(req.body.password, element.password)){
        res.json(jwt.sign(element.email, 'anysecret'));
      }else{
        res.send('password is incorrect');
      }
    }
  }
});

app.listen(3001, () => {
  console.log('Listening on port 3001');
});