//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

//mongodb://localhost:27017/todolistDB
mongoose.connect("mongodb+srv://admin-jordan:test123@cluster0-ckto6.mongodb.net/test?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "Item",
  itemsSchema
);
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({},
    'name',
    function (err, items) {

      if (items.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("success!");
          }
        });
        res.redirect("/");
      } else { 
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }
    });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({name: itemName});
  if (listName === "Today"){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
  Item.findByIdAndRemove(itemId, function(err){
    if(err){
      console.log(err);
    } else {
      console.log("Deletion success!");
    }
  });
  res.redirect("/");
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName}, function(err, foundList) {
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems    
        });
        list.save();
        res.redirect("/" + customListName );
      } else {
        res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port ==null || port == ""){
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started successfully.");
});