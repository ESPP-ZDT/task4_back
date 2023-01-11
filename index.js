var Express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");

const mysqlUsers = require("./services/users");

var app = Express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({credentials: true, origin: true}));

app.options('*', cors());

app.listen(49146, () => {
    console.log('API starting...');
    mysqlUsers.mySQl_Database.getConnection( (error) => {
        if (error) throw error;
        console.log('Connected to MySQL');
    })
    console.log('API ready and waiting...');
});


// GET -- Hello World from root
app.get('/', (request, response) => { HelloWorldResponse(response); });

/* ***************** USERS ************* */
// GET get all rows from Employee
app.get('/api/users', (request, response) => { mysqlUsers.UsersGetAll(request, response); });

// POST add new user
app.post('/api/user', (request, response) => { mysqlUsers.UsersAddOne(request, response); });

// PUT update user name
app.put('/api/user', (request, response) => { mysqlUsers.UsersUpdateOne(request, response); });

// DELETE remove user from database
app.delete('/api/user/:id', (request, response) => { mysqlUsers.UsersDeleteOne(request, response); });

// AUTENTICATION -> user/autentication
app.post('/api/user/authentication', (request, response) => { mysqlUsers.UserAuthentication(request, response); });

// PUT block user
app.put('/api/user/block', (request, response) => { mysqlUsers.UsersBlockOne(request, response); });

// PUT un-block all users
app.put('/api/user/unblock', (request, response) => { mysqlUsers.UsersUnBlockAll(request, response); });

function HelloWorldResponse(response) {
    console.log(`API# ${++global.apiCounter} [/] requested`);
    response.send('Hello World!');
};