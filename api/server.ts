import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";

const jsonServer = require("json-server");
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

const firebaseConfig = {
    apiKey: "AIzaSyBgFXMKHuJRm4BYo0y0tI6_a9BBqfwefSU",
    authDomain: "ccserver-ba63a.firebaseapp.com",
    databaseURL: "https://ccserver-ba63a-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ccserver-ba63a",
    storageBucket: "ccserver-ba63a.appspot.com",
    messagingSenderId: "400521229816",
    appId: "1:400521229816:web:ba9cfea79e8027b4b6120d",
    measurementId: "G-MLE4QRS91V"
};

const app = initializeApp(firebaseConfig);
const dataBase = getDatabase(app);
const dbRef = ref(getDatabase());

server.get("/users", (req:any, res:any) => {
    get(child(dbRef, "users"))
        .then((snapshot) => {
            let users = Object.keys(snapshot.val()).map((user:any) => snapshot.val()[user]);
            res.jsonp(users);
        });
})

server.get("/roles", (req:any, res:any) => {
    get(child(dbRef, "roles"))
        .then((snapshot) => {
            let roles = Object.keys(snapshot.val()).map((role:any) => snapshot.val()[role]);
            res.jsonp(roles);
        });
})

server.post("/getUserInfo", (req:any, res:any) => {
    get(child(dbRef, "users"))
        .then((snapshot) => {
            let users = Object.keys(snapshot.val()).map((user:any) => snapshot.val()[user]);
            let user = users.filter((user:any) => user.id === req.body.code)[0];
            res.jsonp(user);
        });
})

server.use("/*",(req:any, res:any) => {

    if(req.method === "POST" && req.originalUrl === "/login") {
        Login(req, res).then();
        return;
    }

    if(req.method === "POST" && req.originalUrl === "/registration") {
        Registration(req, res).then();
        return;
    }

    if(req.method === "POST" && req.originalUrl === "/update") {
        Update(req, res).then();
        return;
    }

    if(req.method === "DELETE") {
        Delete(req, res).then();
        return;
    }

    let message = "No Access!";
    res.status(401).send({message});
});

async function Login(req:any, res:any) {
    let user = await GetUser(req.body.username);
    if(user.username === req.body.username && user.password === req.body.password){
        if(user.isActive === true){
            res.status(200)
            res.send({username: user.username, role: user.role})
        }
        else {
            res.status(401)
            res.send("Oops, your account is not active now!");
        }
    }
    else {
        res.status(401)
        res.send("Oops, wrong input!");
    }
}

async function Registration(req:any, res:any) {

    let user = await GetUser(req.body.username);

    if (user.username !== req.body.username) {
        let newUserId = await GetNewId();
        set(ref(dataBase, 'users/' + newUserId), {
            id: newUserId,
            username: req.body.username,
            password: req.body.password,
            e_mail: req.body.e_mail,
            role: req.body.role,
            isActive: req.body.isActive
        })
            .then(() => {
                res.status(200).json("Done!");
            });
    } else {
        res.status(401).json("Account exists!");
    }
}

async function Delete(req:any, res:any) {
    await set(child(dbRef, "users/" + req.body.id), null);
    res.status(200).json("Done!");
}

async function Update(req:any, res:any) {
    let userId = Number(req.body.id)
    set(ref(dataBase, 'users/' + userId), {
        id: userId,
        username: req.body.username,
        password: req.body.password,
        e_mail: req.body.e_mail,
        role: req.body.role,
        isActive: req.body.isActive
    })
        .then(() => {
            res.status(200).jsonp("Done!");
        });
}

function GetUser(username:any) {
    return get(child(dbRef, "users"))
        .then((snapshot) => {
            let users = Object.keys(snapshot.val()).map((user:any) => snapshot.val()[user]);
            let user = users.filter((user:any) => user.username === username)[0];
            return user ? user : false;
        });
}

function GetNewId() {
    return get(child(dbRef, "users"))
        .then((snapshot) => {
            let users = Object.keys(snapshot.val());
            return Number(users[users.length - 1]) + 1;
        });
}

server.listen(3000, () => {
    console.log("JSON Server is running see http://localhost:3000");
});