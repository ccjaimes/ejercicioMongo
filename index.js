const MongoClient = require("mongodb").MongoClient;
let fs = require("fs");
let express = require('express');
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var conn = MongoClient.connect("mongodb://localhost:27017",
    { useNewUrlParser: true, useUnifiedTopology: true });

//IMPORTAR DATOS A LA BD, ESTA CONFIGURADA PARA NO IMPORTAR LOS DATOS, SI NO TIENE LOS DATOS EN LA BD, DESCOMENTAR EL MÉTODO DE IMPORTAR

importar = () => {
    fs.readFile("countriesall.json", (err, data) => {
        if (err) throw (error);
        let datos = data.toString();
        insertDB(JSON.parse(datos));
    });
}

insertDB = (data) => {
    conn.then(client => {
        client.db("prueba").collection("paises").insertMany(data);
    });
}

//importar(); 

//EJERCICIO REST
app.get("/countries/", (req, res) => {
    conn.then(client => {
        client.db("prueba").collection("paises").find({}).toArray((err, data) => {
            res.send(data);
        });
    });
});

app.get("/countries/:pais", (req, res) => {
    conn.then(client => {
        client.db("prueba").collection("paises").find({ country: req.params.pais }).toArray((err, data) => {
            res.send(data);
        });
    });
});

app.post("/countries/", (req, res) => {
    conn.then(client => {
        client.db("prueba").collection("paises").find({ country: req.body.country }).toArray((err, data) => {
            if (data.length === 0) {
                client.db("prueba").collection("paises").insertOne(req.body);
                res.send("AGREGADO");
            }
            else {
                res.status(409).send("NO AGREGADO, YA EXISTE PAIS");
            }
        });
    });
});

app.put("/countries/:pais", (req, res) => {
    conn.then(client => {
        client.db("prueba").collection("paises").find({ country: req.params.pais }).toArray((err, data) => {
            if (data.length === 0) {
                res.status(404).send("NO EXISTE ESE PAÍS");
                return;
            }
            delete req.body.country;
            client.db("prueba").collection("paises").updateOne({country:req.params.pais}, {$set:req.body});
            res.send("ACTUALIZADO");
        });
    });
});

app.delete("/countries/:pais", (req,res) => {
    conn.then(client => {
        client.db("prueba").collection("paises").find({ country: req.params.pais }).toArray((err,data) => {
            if(data.length === 0){
                res.status(404).send("NO EXISTE ESE PAÍS");
                return;
            }
            client.db("prueba").collection("paises").deleteOne({ country: req.params.pais}, (err, resp) => {
                if(err) throw err;
                res.send("ELIMINADO");
            });
        });
    });
});

app.listen(8081);
