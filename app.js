const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const alert = require("alert");

mongoose.connect("mongodb+srv://DyOudom:Deedeezin6@cluster0.nlwkwyc.mongodb.net/ToDoListDB");

const itemSchema = {
  name: String
};

const item = mongoose.model("item", itemSchema);

const item1 = new item({
  name: "item1"
});

const item2 = new item({
  name: "item2"
});

const item3 = new item({
  name: "item3"
});

let defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("list", listSchema);
// item.insertMany([item1, item2, item3], (err)=>{
//   if(err) console.log(err);
//   else console.log("success");
// })

//variables
// let items = [];
// let workItems = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


//Home
// app.get("/", function(req, res) {
//   let today = new Date();
//   let currentDay = today.getDate();
//   let day = "";
//   const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//
//   if (currentDay == 6 || currentDay == 0) {
//     day = weekday[today.getDay()];
//   } else day = weekday[today.getDay()];
//
//   res.render("list", {
//     LISTTITLE: day,
//     ITEMS: items
//   });
// });


app.get("/work", function(req, res) {
  item.find({}, function(err, foundItems) {
    if (foundItems.length == 0) {
      item.insertMany([item1, item2, item3], (err) => {
        if (err) console.log(err);
        else console.log("successfully inserted to db");
      });
      res.redirect("/work");
    } else {
      res.render("list", {
        LISTTITLE: "Work",
        ITEMS: foundItems
      });
    }
  })
})

app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName;
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err)
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName);
      }
    else {
      res.render("list", {
        LISTTITLE: customListName,
        ITEMS: foundList.items
      });
    }
  })
})

app.post("/", function(req, res) {
  let itemHTML = req.body.txt;
  let listName = req.body.list;
  if (itemHTML == "") {
    alert("Please input");
  } else {
    const postItem = new item({
      name: itemHTML
    });
    if (listName == "Work" || listName == "work") {
      postItem.save();
      res.redirect("/work");
    } else {
      List.findOne({
        name: listName
      }, function(err, foundList) {
        foundList.items.push(postItem);
        foundList.save();
        res.redirect("/" + listName);
      })
    }


  }
})

app.post("/delete", function(req, res) {
  const id = req.body.checkedDelete;
  const DeleteWithTitle = req.body.checkedDeleteWithTitle;
  if (DeleteWithTitle == "Work" || DeleteWithTitle == "work") {
    item.findByIdAndRemove(id, (err) => {
      if (!err) res.redirect("/work");
    })
  } else {
    List.findOneAndUpdate({
      name: DeleteWithTitle
    }, {
      $pull: {
        items: {
          _id: id
        }
      }
    }, (err, foundlist) => {
      if (!err) {
        res.redirect("/" + DeleteWithTitle);
      } else console.log(err);
    })
  }


});

app.listen(process.env.PORT || 3000);
