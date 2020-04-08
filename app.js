//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ehis:f1i9r9s8t9@cluster0-5p0bt.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const Item1 = new Item({
  name: "Take a walk"
});

const Item2 = new Item({
  name: "Go shopping"
});

const Item3 = new Item({
  name: "Have your bath"
});

const defaultItems = [Item1, Item2, Item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, items){
    if (items.length === 0){
      Item.insertMany(defaultItems, function(error){
        if (error){
          console.log(error);
        }else{
          console.log("Added Successfully");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today!", newListItems: items });
    }
    })
});

app.post("/", function(req, res){
  const pageName = req.body.list;
  const newItem = req.body.newItem;
  let newEntry = new Item ({
    name: newItem
  });
  if (pageName === "Today!"){
    if (newItem !== ""){
      newEntry.save();
      res.redirect("/");
    }else {
      res.redirect("/");
    }
  }else {
    List.findOne({name: pageName}, function(err, foundList){
      if (newItem !== ""){
        if (!err){
          const newFoundList = foundList.items;
          newFoundList.push(newEntry);
          foundList.save();
          res.redirect("/" + pageName);
        }else{
          console.log(err);
          res.redirect("/" + pageName);
        }
      }else{
        res.redirect("/" + pageName);
      }
    })
  }
});

app.post("/delete", function(req, res){
  let checkedItemId = Object.keys(req.body);
  let itemID = req.body[checkedItemId];
  if (checkedItemId == "Today!"){
    Item.findByIdAndRemove(itemID, function(err){
      if (!err){
        console.log("Successfully deleted");
      }else {
        console.log(err);
      }
    })
    res.redirect("/");
  }else{
    List.findOne({name: checkedItemId}, function(err, foundList){
      if (!err){
        let newFoundList = foundList.items;
        let newDBArray = newFoundList.filter(function(item){
          return(item.id !== itemID)
        })
        foundList.items = newDBArray;
        foundList.save();
        res.redirect("/" + checkedItemId);
      }else{
        res.redirect("/" + checkedItemId);
      }
    })
  }
})

app.get("/:customListName", function(req,res){
  // const customURL = req.params.customListName;
  const customURL = _.capitalize(req.params.customListName);
  List.findOne({name: customURL}, function(err, foundList){
    if (!err){
      if (!foundList){
        const list = new List({
        name: customURL,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customURL);
    }

    else if (foundList.items.length === 0) {
      foundList.items = defaultItems;
      foundList.save();
    res.redirect("/" + customURL);
    }
    else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items });
    }
  }
})
  });

app.get("/about", function(req, res){
  res.render("about");
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started Successfully");
});
