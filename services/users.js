const mysql = require("mysql");
const params = require("../env/params");

var apiCounter = 0;

const mySQl_Database = mysql.createPool({
    connectionLimit: 15,
    host: params.DB_HOST,
    user: params.DB_USER,
    password: params.DB_PASSWORD,
    database: params.DB_DATABASE,
    port: params.DB_PORT
});


// GET all users as rows
function UsersGetAll(request, response) {
    console.log(`API# ${++apiCounter} GET::[/api/users] requested`);

    mySQl_Database.getConnection(async (errorConnectToDatabase, connection) => {
        if (errorConnectToDatabase) {
            console.log(`DB Connection error# ${errorConnectToDatabase}`);
            throw errorConnectToDatabase;
        }

        // entry point to buisness logic
        const sqlQuery = `select * from Users`;
        connection.query(sqlQuery, (error, rows) => {
            connection.release();
            if (error) {
                console.log(`Error occurs: ${error}`);
                return response.status(404).send({ text: 'Error occurs', error: error });
            }
            response.status(200).send(rows);
        });
    });
}

// POST add new user
function UsersAddOne(request, response) {
    console.log(`API# ${++apiCounter} POST::[/api/user] requested`);

    mySQl_Database.getConnection(async (errorConnectToDatabase, connection) => {
        if (errorConnectToDatabase) {
            console.log(`DB Connection error# ${errorConnectToDatabase}`);
            throw errorConnectToDatabase;
        }

        // entry point to buisness logic
        const sqlSearch = `select 1 from Users where UserEmail = ?`;
        const sqlInsert = `insert into Users(UserName, UserPassword, UserEmail, LastLoginTime, RegistrationTime) values (?,?,?,?,?)`;
        const userName = request.body['UserName'];
        const userPassword = request.body['UserPassword'];
        const userEmail = request.body['UserEmail'];
        const convertedLastLogin = new Date(request.body['LastLoginTime']).toISOString().slice(0, 19).replace('T', ' ');
        const convertedRegistration = new Date(request.body['RegistrationTime']).toISOString().slice(0, 19).replace('T', ' ');
        connection.query(mysql.format(sqlSearch, [userEmail]), async (searchError, searchResult) => {
            if (searchError) {
                console.log(`Error occurs: ${searchError}`);
                return response.status(404).send({ text: 'Error occurs', error: searchError });
            }
            if (searchResult.length != 0) {
                return response.status(409).send({ text: 'User alredy exist in database' });
            }
            await connection.query(mysql.format(sqlInsert, [userName, userPassword, userEmail, convertedLastLogin, convertedRegistration]), async (insertError) => {
                connection.release();
                if (insertError) {
                    console.log(`Error occurs: ${insertError}`);
                    return response.status(404).send({ text: 'Error occurs', error: insertError });
                }
                response.status(200).send({ text: `Users ${userName} added!`});
            });
        });
    });
};

// PUT update user name
function UsersUpdateOne(request, response) {
    console.log(`API# ${++apiCounter} PUT::[/api/user] requested`);

    mySQl_Database.getConnection(async (errorConnectToDatabase, connection) => {
        if (errorConnectToDatabase) {
            console.log(`DB Connection error# ${errorConnectToDatabase}`);
            throw errorConnectToDatabase;
        }

        // entry point to buisness logic
        const sqlUpdate = `update Users set
                    UserName=?,
                    UserPassword=?,
                    UserEmail=?,
                    LastLoginTime=?,
                    RegistrationTime=?,
                    UserStatus=?
                    where UserId=?`;
        const userId = request.body['UserId'];
        const userName = request.body['UserName'];
        const userEmail = request.body['UserEmail'];
        const convertedLastLogin = new Date(request.body['LastLoginTime']).toISOString().slice(0, 19).replace('T', ' ');
        const convertedRegistration = new Date(request.body['RegistrationTime']).toISOString().slice(0, 19).replace('T', ' ');
        const userPassword = request.body['UserPassword'];
        const userStatus = request.body['UserStatus'];
        connection.query(mysql.format(sqlUpdate, [userName, userPassword, userEmail, convertedLastLogin, convertedRegistration, userStatus, userId]), async (error) => {
            connection.release();
            if (error) {
                console.log(`Error occurs: ${error}`);
                return response.status(404).send({ text: 'Error occurs', error: error });
            }
            response.status(200).send({ text: `Users #${userId} had name changed to ${userName}!`});
        });
    });
};

// DELETE remove user from database
function UsersDeleteOne(request, response) {
    console.log(`API# ${++apiCounter} DELETE::[/api/user] requested`);

    mySQl_Database.getConnection(async (errorConnectToDatabase, connection) => {
        if (errorConnectToDatabase) {
            console.log(`DB Connection error# ${errorConnectToDatabase}`);
            throw errorConnectToDatabase;
        }

        // entry point to buisness logic
        const sqlQuery = `delete from Users where UserId=?`;
        const userId = request.params.id;
        const sqlValues = [userId];
        connection.query(sqlQuery, sqlValues, (deleteError) => {
            connection.release();
            if (deleteError) {
                console.log(`Error occurs: ${deleteError}`);
                return response.status(404).send({ text: 'Error occurs', error: deleteError });
            }
            response.status(200).send({ text: `Users #${userId} removed from DB!`});
        });
    });
};

function UserAuthentication(request, response) {
    console.log(`API# ${++apiCounter} GET::[/api/user/autentication] requested`);

    mySQl_Database.getConnection(async (errorConnectToDatabase, connection) => {
        if (errorConnectToDatabase) {
            console.log(`DB Connection error# ${errorConnectToDatabase}`);
            throw errorConnectToDatabase;
        }

        // entry point to buisness logic
        const userEmail = request.body['UserEmail'];
        console.log('Email: ' + userEmail);
        const userPassword = request.body['UserPassword'];
        const sqlSearch = `select UserPassword, UserStatus from Users where UserEmail = ?`;
        connection.query(mysql.format(sqlSearch, [userEmail]), async (searchError, searchResult) => {
            console.log('Error' + searchError);
            console.log('Result' + JSON.stringify(searchResult));
            if (searchError) {
                console.log(`Error occurs: ${searchError}`);
                return response.status(404).send({ text: 'Error occurs', error: searchError });
            }
            if (searchResult.length === 0) {
                console.log(`User NOT exist in database`);
                return response.status(409).send({ text: 'User NOT exist in database' });
            }
            const userStatus = searchResult[0].UserStatus;
            if (userStatus !== 1) {
                console.log(`User is blocked!`);
                return response.status(403).send({ text: 'User is blocked!' });
            }
            const psswrd = searchResult[0].UserPassword;
            if (psswrd.localeCompare(userPassword) === 0) {
                // save last login time
                const sqlUpdate = `update Users set LastLoginTime = ? where UserEmail = ?`;
                const lastLoginTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
                connection.query(mysql.format(sqlUpdate, [lastLoginTime, userEmail]), async (updateError) => {
                    connection.release();
                    if (updateError) {
                        console.log(`Error occurs: ${updateError}`);
                        return response.status(404).send({ text: 'Error occurs', error: updateError });
                    }
                    console.log(`User successfuly autenticated!`);
                    return response.status(200).send({ text: 'User successfuly autenticated!' });
                });
            } else {
                console.log(`User NOT authorized!`);
                return response.status(403).send({ text: 'User NOT authorized!' });
            }
        });
    });
};

function UsersBlockOne(request, response) {
    console.log(`API# ${++apiCounter} PUT::[/api/user/block] requested`);

    mySQl_Database.getConnection(async (errorConnectToDatabase, connection) => {
        if (errorConnectToDatabase) {
            console.log(`DB Connection error# ${errorConnectToDatabase}`);
            throw errorConnectToDatabase;
        }

        // entry point to buisness logic
        const sqlUpdate = `update Users set UserStatus=0 where UserId=?`;
        const userId = request.body['UserId'];
        connection.query(mysql.format(sqlUpdate, [userId]), async (error) => {
            connection.release();
            if (error) {
                console.log(`Error occurs: ${error}`);
                return response.status(404).send({ text: 'Error occurs', error: error });
            }
            response.status(200).send({ text: `Users #${userId} has been blocked!`});
        });
    });
};

function UsersUnBlockAll(request, response) {
    console.log(`API# ${++apiCounter} PUT::[/api/user/unblock] requested`);

    mySQl_Database.getConnection(async (errorConnectToDatabase, connection) => {
        if (errorConnectToDatabase) {
            console.log(`DB Connection error# ${errorConnectToDatabase}`);
            throw errorConnectToDatabase;
        }

        // entry point to buisness logic
        const sqlUpdate = `update Users set UserStatus=1`;
        connection.query(mysql.format(sqlUpdate), async (error) => {
            connection.release();
            if (error) {
                console.log(`Error occurs: ${error}`);
                return response.status(404).send({ text: 'Error occurs', error: error });
            }
            response.status(200).send({ text: `All users have been un-blocked!`});
        });
    });
};

module.exports = {
    UsersGetAll,
    UsersAddOne,
    UsersUpdateOne,
    UsersDeleteOne,
    UserAuthentication,
    UsersBlockOne,
    UsersUnBlockAll,
    mySQl_Database
};