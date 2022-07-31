const express = require('express')
const app = express()
require("dotenv").config();
const port = process.env.PORT;
const {ingresarUsuario, traerUsuarios, editarUsuario, eliminarUsuario, transferir, traerTransferencias} = require('./consultas.js')

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.post('/usuario', async(req, res)=>{
    const data = Object.values(req.body);
    try {
        const result = await ingresarUsuario(data);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/usuarios', async(req, res)=>{
    try {
        const result = await traerUsuarios();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/usuario', async(req, res)=>{
    const {name, balance} = req.body;
    const {id} = req.query;
    const data = Object.values({name, balance, id});
    try {
        const result = await editarUsuario(data);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/usuario', async(req, res)=>{
    const id = Object.values(req.query);
    try {
        const result = await eliminarUsuario(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/transferencia', async(req, res)=>{
    const data = req.body;
    try {
        const result = await transferir(data);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/transferencias', async(req, res)=>{
    try {
        const result = await traerTransferencias();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))