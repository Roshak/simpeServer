(
  function () {
    "use strict";
    const express = require('express');
    const bodyParser = require('body-parser');
    const { Connection, Request } = require("tedious");

    const error = document.getElementById('error');

    let app = express();

    const config = {
      authentication: {
        options: {
          userName: "sa", // update me
          password: "1Password1" // update me
        },
        type: "default"
      },
      server: "nis-gest-server", // update me
      options: {
        database: "SAMA02", //update me
        encrypt: false
      }
    };

    const connection = new Connection(config);

    // Attempt to connect and execute queries if connection goes through
    connection.on("connect", err => {
      if (err) {
        plog(err.message);
      }
    });

    let json = '';
    let sql = '';
    let values = '';

    app.use(bodyParser.urlencoded({ extended: false }))

    app.use(bodyParser.json())

    app.get('/', function (req, res) {
      res.send("TEST GET REQUEST");
    });

    app.post('/', (req, res) => {
      res.setHeader('Content-Type', 'text/plain')
      json = JSON.stringify(req.body, null, 2);
      try {
        handlePost(json);
      } catch (error) {
        res.write('KO: ' + error.message + '\n')
      }
      res.end(json);
    });

    let server = app.listen(8080, function () {
      plog('Express server listening on port ' + server.address().port);
    });

    function handlePost(json) {
      values = '';
      sql = 'INSERT INTO EXT_DATI_SEGHETTO (';
      JSON.parse(json, (key, value) => {
        sql += key + ','
        values += `'${value}',`;
        console.log(`${key}: ${value}`);
      });
      sql = sql.slice(0, -2);
      sql += ' ) ';
      values = ` VALUES ( ${values.slice(0, -19)} )`;
      sql = sql + values;
      plog(sql);
      insertSQL(sql);
    }

    function insertSQL(sql) {
      var request = new Request(sql, (err, rowCount) => {
        if (err)
          plog(err);
        plog('rowCount: ' + rowCount);
      });
      connection.execSql(request);
    }

    function plog(str) {
      error.innerHTML += str + '<br />';
    }

    module.exports = app;
  }()
);