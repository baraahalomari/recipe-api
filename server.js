'use strict';

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

const recipeSchema = new mongoose.Schema({
    image: String,
    label:String,
    ingredientLines:Array,
});

const recipeModel = mongoose.model('test', recipeSchema);

app.get('/recipes',getRecipesHandler);
app.post('/addToFav',addToFavHandler);
app.get('/getFavData',getFavHandler);
app.delete('/deleteRecipes/:id',deleteRecipesHandler);
app.put('/updateRecipes/:id',updateDataHandler);

class Recipes{
    constructor(data){
        this.image=data.recipe.image;
        this.label=data.recipe.label;
        this.ingredientLines=data.recipe.ingredientLines;
    }
}

function getRecipesHandler(req,res){
    const q = req.query.q;
    const url = (`https://api.edamam.com/search?q=${q}&app_id=${process.env.REACT_APP_ID}&app_key=${process.env.REACT_APP_KEY}`);
    axios.get(url).then(result=>{
        const newArr = result.data.hits.map(recipe=>{
            return new Recipes(recipe);
        })
        res.send(newArr);
    })
}

function addToFavHandler(req,res){
   const {image,label,ingredientLines}=req.body;
   const newModel = new recipeModel({
       image:image,
       label:label,
       ingredientLines:ingredientLines,
   })
   newModel.save();
}

function getFavHandler(req,res){
    recipeModel.find({},(error,data)=>{
        res.send(data)
    })
}

function deleteRecipesHandler(req,res){
    const id = req.params.id;
    recipeModel.remove({_id:id},(error,data)=>{
        recipeModel.find({},(error,data2)=>{
            res.send(data2)
        })
    })
}

function updateDataHandler(req,res){
    const id = req.params.id;
    const{image,label,ingredientLines}=req.body;
    recipeModel.findOne({_id:id},(error,data)=>{
        data.image=image,
        data.label=label,
        data.ingredientLines=ingredientLines,
        data.save().then(()=>{
            recipeModel.find({},(error,data2)=>{
                res.send(data2)
            })
        })
    })
}

app.listen(PORT,(req,res)=>{
    console.log(`listtening to PORT ${PORT}`);
})