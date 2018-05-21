var request = require('request')
var express = require('express')
var bp = require('body-parser')
var cors = require('cors')
app = express()
app.use(bp.json())
app.use(cors())
var basededatos = {
    productos: [{
        nombre: 'Sony Xperia Z1',
        unidades: 5,
        referencia: 'sxz1',
        imgUrl: 'img/xperiaz1.jpg'
    }, {
        nombre: 'Samsung S3',
        unidades: 3,
        referencia: 'sgs3',
        imgUrl: 'img/samsungs3.jpg'
    }, {
        nombre: 'Samsung S2',
        unidades: 0,
        referencia: 'sgs2',
        imgUrl: 'img/samsungs2.jpg'
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
    var endpoint = 'http://localhost:30000/productos'
    request.get(endpoint, function (err, httpResponse, body) {
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
app.get('/productos/:ref',function(req,resp){
    var result = []
    for(var producto of basededatos.productos){
        if(producto.referencia == req.params.ref){
            result.push(producto)
            break
        }
    }
    if(result.length<1){
        resp.status(404)
        resp.end()
    }else{
        resp.send(result)
    }
})
app.post('/productos/pedir', function (req, resp) {
    var endpoint = 'http://localhost:30000/pedido'
    var referenciaProducto = req.body.referenciaProducto
    var unidades = req.body.unidades
    request.post(endpoint, {
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