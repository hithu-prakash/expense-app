//npm init -y

const express = require('express')  // npm install express
const mongoose = require('mongoose') // npm install mongoose
const app = express()
const port = 3077

app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/exp-app-dec23')
      .then(() => {
        console.log('connected to the db')
      })
      .catch((err) => {
        console.log('error connecting to server' , err)
      })

      const {Schema ,model} =mongoose
      const categorieSchema = new Schema({
        name: {
          type: String,
          required: true   //validation for empty array
        
        }}, { timestamps : true })

      const Category = model('Category' ,categorieSchema)
      //request handler
      //Get '/all-categories
      
app.get('/all-categories' , (req,res)=> {
  Category.find()
    .then((data) => {
       res.json(data)
    })
    .catch((err) => {
       res.json(err)
    })
})

app.post('/create-category', (req, res) => {
  const body = req.body //{name : food}
  const categoryObj = new Category(body)
  //categoryObj.name = body.name
  categoryObj.save()
      .then((data) => {
        res.json(data)
      })

      .catch((err) => {
        res.json(err)
      })
})

//create a expressSchema - expressDate, amount:number, description

const expenseSchema = new Schema({
  expenseDate :Date,
  amount: Number,
  description: String
}, {timestamps : true})

// create a express model
const Expense = model('Expense',expenseSchema)

//define req handler to return all-expenses

app.get('/all-expenses',(req ,res) => {
  Expense.find()
    .then((expenses) => {
      res.json(expenses)
    })

    .catch((err)=> {
      res.json(err)
    })
})

//define req handler to create a new expenses

app.post('/create-expenses',(req,res)=>{
  const body = req.body
  const expenseObj = new Expense(body)
  expenseObj.save()
    .then((exp)=> {
      res.json(exp)
    })
    .catch((err) => {
      res.json(err)
    })

})

//app.post('/post-expenses',(req,res) => {

//})


app.listen(port ,() => {
    console.log('server running on port', port)
})