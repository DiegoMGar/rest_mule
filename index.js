var request = require('request')
var express = require('express')
var bp = require('body-parser')
var cors = require('cors')
app = express()
app.use(bp.json())
app.use(cors())
var basededatos = {
    productos: [{
        name: '',
        unidades: '',
        referencia: ''
    }]
}

app.get('/', function (req, resp) {
    resp.sendFile('views/index.html', {
        root: __dirname
    })
})
app.get('/productos/stock', function (req, resp) {
    var constock = basededatos.productos.filter(p => p.unidades > 0)
    resp.send(constock)
})
app.get('/productos/almacen', function (req, resp) {
    var endpoint = 'http://localhost:9090/productos'
    var tienda = req.body.tiendaId
    var referenciaProducto = req.body.referenciaProducto
    var unidades = req.body.unidades
    request.get(endpoint, {
        tienda,
        referenciaProducto,
        unidades
    }, function (err, httpResponse, body) {
        if (err) {
            resp.status(500)
            resp.send(err)
        } else {
            resp.send(body)
        }
    })
})
app.get('/productos/', function (req, resp) {
    resp.send(basededatos.productos)
})
app.post('/productos/pedir', function (req, resp) {
    var endpoint = 'http://localhost:9090/pedido'
    var tienda = req.body.tiendaId
    var referenciaProducto = req.body.referenciaProducto
    var unidades = req.body.unidades
    request.post(endpoint, {
        tienda,
        referenciaProducto,
        unidades
    }, function (err, httpResponse, body) {
        if (err) {
            resp.status(500)
            resp.send(err)
        } else {
            resp.send(body)
        }
    })
})
app.put('/productos', function (req, resp) {
    resp.status(501)
    resp.end()
})

// RUNING SERVER
app.listen(3000, function () {
    console.log('MTIS GRUPAL, por Diego Maroto, sirviendo por el puerto 3000')
})