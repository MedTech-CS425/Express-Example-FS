const express = require('express');
const app = express();
const fs = require('fs');
const bluebird = require('bluebird');
app.use(express.json());
bluebird.promisifyAll(fs);


app.post('/students', (req, res) => {
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

app.get('/students', (req, res) => {
  fs.readFileAsync('./students.json').then((data) => {
    data = JSON.parse(data);
    res.json(data);
  }).catch((err) => res.send(err));
});

app.get('/students/:index', (req, res) =>{
  fs.readFileAsync('./students.json').then(data => {
    data = JSON.parse(data);
    res.json(data[req.params.index]);
  }).catch((err)=>res.send(err))
});

app.listen(3001, () => {
  console.log('Listening on port 3001');
});