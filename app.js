const express = require('express');
const app = express();
const fs = require('fs');
const bluebird = require('bluebird');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()
// Connecting to mongodb
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {
  console.log('Connected to MongoDB');
});

app.use(express.json());

// Auhtorization Middleware
const auth = (req, res, next) => {
  try {
    jwt.verify(req.get('Authorization'), 'anysecret');
    next();
  } catch (error) {
    res.send('You are not authorized');
  }
}

// Defining the students Schema
const StudentSchema = new mongoose.Schema({
  fistName: String,
  lastName: String,
  email: String,
  password: String,
  age: Number,
  skills: [String]
});
const StudentsModel = mongoose.model('Student', StudentSchema);


app.post('/students', async (req, res) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 12);
    const student = await StudentsModel.create(req.body);
    res.json({
      message: 'Student Added Successfully',
      student
    })
  } catch (error) {
    res.send('You have Validation Error')
  }
});

app.get('/students', async (req, res) => {
  try {
    const students = await StudentsModel.find();
    res.json(students);
  } catch (error) {
    res.send(error)
  }
});

app.get('/students/:id', async (req, res) =>{
  try {
    const student = await StudentsModel.findById(req.params.id);
    res.json(student);
  } catch (error) {
    res.send(error);
  }
});

app.delete('/students/:id', async (req, res) =>{
  try {
    await StudentsModel.findByIdAndRemove(req.params.id);
    res.send('Student Deleted');
  } catch (error) {
    res.send(error);
  }
});

app.delete('/students', async (req, res) =>{
  try {
    await StudentsModel.deleteMany();
    res.send('Students Deleted');
  } catch (error) {
    res.send(error);
  }
});




app.post('/login', async (req, res) => {
  try {
    const student = await StudentsModel.findOne({email: req.body.email});
    if(!student){
      res.send('Email Does Not Exist')
    }
    const match = await bcrypt.compare(req.body.password, student.password);
    if(!match){
      res.send('Incorrect Password')
    }
    res.json({token: jwt.sign({id: student._id}, 'anysecret')})
  } catch (error) {
    res.send(error)
  }
});

app.listen(3001, () => {
  console.log('Listening on port 3001');
});