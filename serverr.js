//create new project folder "expense-app"
//npm init -y

const express = require('express')      // npm install express
const mongoose = require('mongoose')    // npm install mongoose
const app = express()
const {checkSchema, validationResult} = require('express-validator') //npm install express-validator
const port = 3068

app.use(express.json())                 //enable express to parse incoming json data

// setting mongodb database
const idValidationSchema = {
    id : {
        in : ['params'],
        isMongoId: {
            errorMessage : 'Should be valid mongodb Id'
        }
    }
}

mongoose.connect('mongodb://127.0.0.1:27017/exp-app-dec23')
    .then(() => {
        console.log('Connected to the database successfully');
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });

const { Schema, model } = mongoose;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const categoryValidationSchema ={
    name : {
        in : ['body'],
        notEmpty : {
            errorMessage : 'Name cannot be empty'
        },
        trim : true,
        custom: {
            options: function(value){
                return Category.findOne({name : value})
                    .then((obj) =>{
                        if(!obj){
                            return true
                        }
                        throw new Error('Category name already Exists')
                    })
            }
        }
    }
}

const Category = model('Category', categorySchema);

app.get('/all-categories', (req, res) => {
    Category.find()
        .then((data) => res.json(data))
        .catch((err) => res.json(err));
});

app.post('/create-category', checkSchema(categoryValidationSchema) , (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }
    const { name } = req.body;
    const category = new Category({ name });

    category.save()
        .then((data) => res.json(data))
        .catch((err) => res.json(err));
});

app.get('/single-category/:id',checkSchema(idValidationSchema), (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }
    const id = req.params.id;
    Category.findById(id)
        .then((category) => {
            if (!category) {
                return res.status(404).json({});
            }
            res.json(category);
        })
        .catch((err) => res.json(err));
});

app.put('/update-category/:id',checkSchema(categoryValidationSchema), (req,res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }
    const id = req.params.id
    const body = req.body
    Category.findByIdAndUpdate(id,body,{new : true})
        .then((category) =>{
            if(!category){
                return res.status(404).json({})
            }
            res.json(category)
        })
        .catch((err) =>{
            res.json(err)
        })

})


app.delete('/remove-category/:id',checkSchema(idValidationSchema), (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }
    const id = req.params.id;
    Category.findByIdAndDelete(id)
        .then((category) => {
            if (category) {
                res.json({ success: true, category });
            } else {
                res.status(404).json({ notice: 'Category not found' });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Error removing Category' });
        });
});

const expenseSchema = new Schema({
    expenseDate: {
        type: Date,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Expense = model('Expense', expenseSchema);

const expenseValidationSchema = {
    expenseDate: {
        in: ['body'],
        exists: {
            errorMessage: 'expense Date is required'
        },
        notEmpty: {
            errorMessage: 'expense cannot be empty'
        },
        isDate: {
            errorMessage: 'expense date is not valid'
        },
        custom: {
            options: function(value){
                if(new Date(value) > new Date()){
                    throw new Error('expense date cannot be greater than today')
                }
                return true
            }
        }
    },
    amount: {
        in: ['body'],
        exists: {
            errorMessage: 'amount is required'
        },
        notEmpty: {
            errorMessage: 'amount entered cannot be empty'
        },
        isNumeric: {
            errorMessage: 'amount entered is not valid'
        },
        custom: {
            options: function(value){
                if(value <= 0) {
                    throw new Error("amount should be greater than 1")
                }
                return true
            }
        }
    }
}

app.get('/all-expenses', (req, res) => {
    Expense.find()
        .then((expenses) => res.json(expenses))
        .catch((err) => res.json(err));
});

app.post('/new-expense',checkSchema(expenseValidationSchema), (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }
    const expense = new Expense(req.body);
    expense.save()
        .then((exp) => res.json(exp))
        .catch((err) => res.json(err));
});

app.get('/single-expense/:id',checkSchema(idValidationSchema), (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    } 
    const id = req.params.id;
    Expense.findById(id)
        .then((expense) => {
            if (!expense) {
                return res.status(404).json({});
            }
            res.json(expense);
        })
        .catch((err) => res.json(err));
});

app.put('/update-expense/:id',checkSchema(expenseValidationSchema), (req,res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }
    const id = req.params.id
    const body = req.body
    Expense.findByIdAndUpdate(id,body,{new : true})
        .then((expense) =>{
            if(!expense){
                return res.status(404).json({})
            }
            res.json(expense)
        })
        .catch((err) =>{
            res.json(err)
        })
})


app.delete('/remove-expense/:id',checkSchema(idValidationSchema), (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }
    const id = req.params.id;
    Expense.findByIdAndDelete(id)
        .then((expense) => {
            if (expense) {
                res.json({ success: true, expense });
            } else {
                res.status(404).json({ notice: 'Expense not found' });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Error removing Expense' });
        });
});

app.listen(port, () => {
    console.log('Server running on port', port);
});