import  colors  from 'colors';
// NOTE connect docker
// mysql--host=127.0.0.1 --port=3366 -u root -p --database=db       

import mysql from "mysql2/promise"
colors.enable()

// console.log(process.env)
// Create the connection to database
// const port =  Number.parseInt(process.env.DB_KMITL_PORT ?? "3306")

const config : mysql.ConnectionOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    // port
}
// console.log(config)
export const dbConnection = await mysql.createConnection(config);

// A simple SELECT query
try {
    // const [results, fields] = await dbConnection.query(
    //     'select * from User limit 1'
    // );

    // console.log(results); // results contains rows returned by server
    // console.log(fields); // fields contains extra meta data about results, if available
    console.info("DB Connected. ".green)
} catch (err) {
    const msg = "Can not connect to database (try fix your configuration file .env)".red
    console.error(msg)
    console.log(err);
    throw new Error(msg)
}

// Using placeholders
// try {
//     const [results] = await connection.query(
//         'SELECT * FROM `table` WHERE `name` = ? AND `age` > ?',
//         ['Page', 45]
//     );

//     console.log(results);
// } catch (err) {
//     console.log(err);
// }