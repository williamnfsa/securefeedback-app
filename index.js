require('dotenv').config(); // Importante, antes de usar process.env

const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de conexión a Azure SQL
const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USER,
            password: process.env.DB_PASS
        }
    },
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

app.get('/', (req, res) => {
    res.send(`
        <h1>Registro de datos personales</h1>
        <form method="POST" action="/registro">
          <input type="text" name="nombre" placeholder="Nombre" required><br><br>
          <input type="text" name="apellido" placeholder="Apellido" required><br><br>
          <input type="number" name="edad" placeholder="Edad" required><br><br>
          <input type="email" name="correo" placeholder="Correo electrónico" required><br><br>
          <input type="text" name="comentario" placeholder="Comentario" required><br><br>
          <button type="submit">Enviar</button>
        </form>
    `);
});

app.post('/registro', async (req, res) => {
    const { nombre, apellido, edad, correo, comentario } = req.body;

    // Sanitización básica
    if (!/^[a-zA-Z\s]+$/.test(nombre) || !/^[a-zA-Z\s]+$/.test(apellido)) {
        return res.send("Nombre o apellido inválido");
    }

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('apellido', sql.VarChar, apellido)
            .input('edad', sql.Int, edad)
            .input('correo', sql.VarChar, correo)
            .input('comentario', sql.VarChar, comentario)
            .query(`
                INSERT INTO Personas (Nombre, Apellido, Edad, Correo, Comentario)
                VALUES (@nombre, @apellido, @edad, @correo, @comentario)
            `);

        res.send("Datos guardados correctamente.");
    } catch (err) {
        console.log(err);
        res.send("Error en el servidor.");
    }
});

app.listen(port, () => console.log(`App corriendo en puerto ${port}`));
