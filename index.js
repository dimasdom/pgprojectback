let {Client} = require("pg");
let express = require("express");
let app = express();
const https = require('https');
let bodyParser = require('body-parser');
let cors = require('cors');
const fs = require('fs');
const key = fs.readFileSync('./users.key');
const cert = fs.readFileSync('./users.cert');
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 8980;
const server = https.createServer({key: key, cert: cert }, app);
//CONNECT TO YOUR DATABASE
let client = new Client({
    host:"localhost",
    database:"",
    port:"",
    user:"postgres",
    password:""
});
let connectToDB = () =>{
    try {
        client.connect()
            .then(()=>console.log('connected successfully'))
    }
    catch (e) {
        console.log(e)
    }
};
connectToDB();

const getUsers = async () =>{
    return client.query("SELECT * FROM users")
};
const getUsersByName = async (first , last)=>{
    return client.query("SELECT * FROM users WHERE first_name = $1 AND last_name = $2",[first,last])
};
const deleteUserById = async (id)=>{return client.query("DELETE FROM users WHERE id = $1",[id])}

app.get("/getusers", async (req,res)=> {
    try {
        let Users = await getUsers();
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(Users.rows));
        res.end();
        console.log("successfully")
    }
    catch (e) {
        res.send(e.toString())
    }
})

app.get("/getusers/:first_name/:last_name",async (req,res)=> {
    try {
        let Users = await getUsersByName(req.params.first_name, req.params.last_name)
        res.send(JSON.stringify(Users.rows))
        console.log(req.params.first_name, req.params.last_name)
    }
    catch (e) {
        res.send(e.toString())
        console.log(e.toString())
    }
});
app.put("/putUser",async (req,res)=> {
    let {first_name, last_name, card_type, card_number} = req.body
    if (req.body) {
        client.query("INSERT INTO users (first_name, last_name, card_number, card_type) VALUES ($1,$2,$3,$4)", [first_name, last_name, card_number, card_type])
        let Users = await getUsers();
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(Users.rows));
        res.end();
        console.log("successfully")
    }else{
        res.sendStatus(200)
    }
});
app.del("/delete/:id",async (req,res)=>{
    deleteUserById(req.params.id)
    let Users = await getUsers();
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(Users.rows));
    res.end();
    console.log("successfully")
})

server.listen(port,()=>{console.log(`Successfully launched on port:${port}`)});