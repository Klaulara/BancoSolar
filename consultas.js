const { Pool } = require('pg');
require("dotenv").config();
const moment = require('moment');

const pool = new Pool({
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    database: process.env.DB
});

const ingresarUsuario = async(data) => {
    const SQLQuery = {
        text: "INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *;",
        values: data
    }
    try {
        const result = await pool.query(SQLQuery);
        return result;
    } catch (error) {
        throw new Error();
    }
}

const traerUsuarios = async() =>{
    const SQLQuery = {
        text: "SELECT * FROM usuarios;",
    }
    try {
        const result = await pool.query(SQLQuery);
        return result.rows;
    } catch (error) {
        throw new Error();
    }
};

const editarUsuario = async(data)=>{
    const SQLQuery = {
        text: "UPDATE usuarios SET nombre=$1, balance=$2 WHERE id=$3 RETURNING *;",
        values: data
    }
    try {
        const result = await pool.query(SQLQuery);
        return result;
    } catch (error) {
        throw new Error();
    }
};

const eliminarUsuario = async(id) => {
    const SQLQuery = {
        text: "DELETE FROM usuarios WHERE id=$1 RETURNING *;",
        values: id
    }
    try {
        const result = await pool.query(SQLQuery);
        return result;
    } catch (error) {
        throw new Error();
    }
};

const transferir = async(data) => {
    const {emisor, receptor, monto} = data
    const valor = parseFloat(monto);
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const idEmisor = await pool.query(`SELECT id FROM usuarios WHERE nombre='${emisor}'`);
    const idReceptor = await pool.query(`SELECT id FROM usuarios WHERE nombre='${receptor}'`);    
    const SQLQuery = {
        text: "UPDATE usuarios SET balance = balance - $2 WHERE nombre=$1 RETURNING *;",
        values: [emisor, valor]
    }
    const SQLQuery2 = {
        text: "UPDATE usuarios SET balance = balance + $2 WHERE nombre=$1 RETURNING *;",
        values: [receptor, valor]
    }
    const SQLQuery3 = {
        text: "INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, $4) RETURNING *;",
        values: [idEmisor.rows[0].id, idReceptor.rows[0].id, valor, date]
    }
    try {
        await pool.query('BEGIN');
        await pool.query(SQLQuery);
        await pool.query(SQLQuery2);
        await pool.query(SQLQuery3);
        await pool.query('COMMIT');
        return true;
    } catch (error) {
        await pool.query('CALLBACK');
        throw new Error(error);
    }
};

const traerTransferencias = async() => {
    const SQLQueryEmisor = {
        text: "select transferencias.id, usuarios.nombre from usuarios INNER JOIN transferencias ON usuarios.id = transferencias.emisor",
        rowMode: "array"
    }
    const SQLQueryReceptor = {
        text: "select usuarios.nombre, transferencias.monto, transferencias.fecha from usuarios INNER JOIN transferencias ON usuarios.id = transferencias.receptor",
        rowMode: "array"
    }
    const emisor = await pool.query(SQLQueryEmisor)
    const receptor = await pool.query(SQLQueryReceptor) 
    const emisorId = emisor.rows;
    const receptorId = receptor.rows;
    try {
        array = [];
        for (let i = 0; i < emisorId.length; i++) {
            for (let j = 0; j < receptorId.length; j++) {
                if(i == j){
                    let arr = emisorId[i].concat(receptorId[j]);
                    array.push(arr);
                }
            }
        }
        return array;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    ingresarUsuario, 
    traerUsuarios,
    editarUsuario,
    eliminarUsuario,
    transferir,
    traerTransferencias
}