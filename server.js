const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017/";
const path= require("path");
const port = 4000;
const alert= require("alert-node");

app.listen(port,()=>{
	console.log(`server is listening on ${port}`)
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("dist"));
app.use(express.static("/Users/rkq5939/Desktop/node js/restaurant assignment" + '/public'));
app.set("view engine","ejs");
app.set("views",path.join(__dirname+"/views"));

let dbo;

MongoClient.connect(
	url,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	(err, db) => {
		if (err) throw err;
		dbo = db.db("restaurant");
	}
);

app.get('/',(req ,res)=>{
	res.sendFile("/Users/rkq5939/Desktop/node js/restaurant assignment/HTML/login.html");
	// res.end();
});


app.post('/registerUser',(req,res)=>{
	if ((req.body.registerFormId) =="" || (req.body.registerFormUsername) == "" || (req.body.registerFormPassword) =="")
		{
			alert("All Fields are important. Please fill all fields");
		}
	else {
		dbo.collection("Users").insertOne({
			id:Number(req.body.registerFormId),
			username:req.body.registerFormUsername,
			password:req.body.registerFormPassword
		})
		alert("New User Registered ")
		res.redirect('/');
	}
});

app.get("/getAllMenuItems", (_req, res) => {
	dbo.collection("Menu")
		.find().sort({"id":-1})
		.toArray((err, result) => {
			if (err) throw err;
			res.send(result);
			res.end(); 
		});
});


app.post("/Validate",(req,res)=>{
    var dbusername;
	var dbpassword;
	var dbrole;
	dbo.collection("Users").find({username:req.body.username}).toArray((err,result)=>{
		if(err) throw err;
		for(i=0; i<result.length; i++){
			dbusername = result[i].username;
			dbpassword = result[i].password;
			dbrole = result[i].role;
		}
	if(dbusername === (req.body.username) && dbpassword ===(req.body.password) && dbrole === "admin")
	{
		res.redirect("/displaytable");
	}
	else
	{
		alert("Enter valid Username and Password")
		res.redirect("/");
	}
	})
})


app.get("/displaytable",(_req,res)=>{
	res.sendFile("/Users/rkq5939/Desktop/node js/restaurant assignment/HTML/table.html");
});

app.get('/addMenu',(_req,res)=>{
	res.sendFile("/Users/rkq5939/Desktop/node js/restaurant assignment/HTML/addMenu.html");
});

app.post('/addDish',(req,res)=>{
	if(req.body.id =="" || req.body.Dish ==""  || req.body.imageUrl ==""  || req.body.Price== "" ){
		alert("All details of the dish are important. Please fill all details.")
	}
	else{
	dbo.collection("Menu").insertOne({id:Number(req.body.id),name:req.body.Dish,image:req.body.imageUrl,price:Number(req.body.Price)});
	alert("New dish added ! Menu updated");
	res.redirect("/displaytable");
}
});

app.get('/updateDish/:pid',(req,res)=>{
    dbo.collection("Menu")
        .find({"id":Number(req.params.pid)})
        .toArray((err, result) => {
            if (err) throw err;
			res.render("updateMenu",{data:result[0]});
		});
	});


app.post('/update-dish-details',(req,res)=>{
	if(req.body.id =="" || req.body.Dish ==""  || req.body.imageUrl ==""  || req.body.Price== "" ){
		alert("All details of the dish are important. Please fill all details.")
	}
	else{
		dbo.collection("Menu")
			.updateOne(
			{id:Number(req.body.id)},
			{$set : {"id":Number(req.body.id),"name":req.body.Dish,
			"image":req.body.imageUrl,"price":Number(req.body.Price)}}
		);
		res.redirect("/displaytable");
	}
})

app.get('/deleteDish/:id',(req,res)=>{
	var id = Number(req.params.id);
	dbo.collection("Menu").deleteOne({"id":id});
	alert("Dish deleted from the Menu");
	res.redirect('/displaytable');
});


app.get('/addToCart/:id',(req,res)=>{
	console.log("inside add to cart with id "+req.params.id);
	var data;
	dbo.collection("Menu").find({"id":Number(req.params.id)}).toArray((err,result)=>{
		console.log((result));
		dbo.collection("cart").insertOne({
			"id":result[0].id,
			"name":result[0].name,
			// "image":result[0].image,
			"price":result[0].price
		})
		console.log("value added in cart ");
		
	});
	res.redirect('/displaytable')
	// res.end();
});

app.get('/cart',(_req,res)=>{
	res.sendFile("/Users/rkq5939/Desktop/node js/restaurant assignment/HTML/cart.html");
});

app.get('/viewCart',(req,res)=>{
	dbo.collection("cart")
		.find().sort({"id":1})
		.toArray((err,result)=>{
			// console.log(result);
			res.send(result);
			res.end();
		})
});

app.get('/logout',(req,res)=>{
	res.redirect('/');
})

