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
    }],
    pedidos: []
}
app.get('/', function (req, resp) {
    resp.sendFile('views/index.html', {
        root: __dirname
    })
})
app.get('/productos', function (req, resp) {
    resp.send(basededatos.productos)
})
app.get('/productos/stock', function (req, resp) {
    var constock = basededatos.productos.filter(p => p.unidades > 0)
    resp.send(constock)
})
app.get('/productos/almacen', function (req, resp) {
    var endpoint = 'http://localhost:9090/productos'
    request.get(endpoint, function (err, httpResponse, body) {
        if (err) {
            resp.status(500)
            resp.send(err)
        } else {
            body = JSON.parse(body)
            var productos = []
            for (var prod of body) {
                var arrayProducto = basededatos.productos.filter(p => p.referencia == prod.referencia)
                var tmpUnidades = prod.unidades
                Object.assign(prod, arrayProducto[0])
                prod.unidades = tmpUnidades
                productos.push(prod)
                console.log(JSON.stringify(arrayProducto))
                console.log(JSON.stringify(prod))
            }
            resp.send(productos)
        }
    })
})
app.get('/pedidos', function (req, resp) {
    var pedidos = []
    for (var pedido of basededatos.pedidos) {
        var arrayProducto = basededatos.productos.filter(p => p.referencia == pedido.referencia)
        var tmpUnidades = pedido.unidades
        Object.assign(pedido, arrayProducto[0])
        pedido.unidades = tmpUnidades
        pedidos.push(pedido)
    }
    resp.send(pedidos)
})
app.get('/productos/:ref', function (req, resp) {
    var result = []
    for (var producto of basededatos.productos) {
        if (producto.referencia == req.params.ref) {
            result.push(producto)
            break
        }
    }
    if (result.length < 1) {
        resp.status(404)
        resp.end()
    } else {
        resp.send(result)
    }
})
app.post('/productos/pedir', function (req, resp) {
    var endpoint = 'http://localhost:9090/pedido'
    var referenciaProducto = req.body.referenciaProducto
    if (existsReference(referenciaProducto)) {
        var unidades = req.body.unidades
        var formdata = {
            tienda: '1',
            referenciaProducto: referenciaProducto,
            unidades: unidades
        }
        request.post({
            url: endpoint,
            form: formdata
        }, function (err, httpResponse, body) {
            if (err) {
                resp.status(500)
                resp.send(err)
            } else {
                try {
                    body = JSON.parse(body)
                    console.log(JSON.stringify(body))
                    var fecha = ''
                    if (body.respuesta.fecha) {
                        fecha = body.respuesta.fecha
                    } else {
                        incrementProducto(referenciaProducto, unidades)
                    }
                    var mensaje = body.respuesta.mensaje
                    var salida = body.respuesta.salida
                    var obj = {
                        mensaje: mensaje,
                        fecha: fecha,
                        referencia: referenciaProducto,
                        unidades: unidades
                    }
                    if (!obj.fecha)
                        obj.fecha = ''
                    basededatos.pedidos.push(obj)
                    resp.send(body)
                } catch (error) {
                    resp.status(500)
                    resp.send(error)
                }
            }
        })
    } else {
        resp.status(404)
        resp.end()
    }

})

function incrementProducto(ref, unidades) {
    for (var prodkey in basededatos.productos) {
        if (basededatos.productos[prodkey].referencia == ref) {
            basededatos.productos[prodkey].unidades += unidades
            break
        }
    }
}

function existsReference(ref) {
    for (var prodkey in basededatos.productos) {
        if (basededatos.productos[prodkey].referencia == ref) {
            return true
        }
    }
}
// RUNING SERVER
app.listen(30003, function () {
    console.log('MTIS GRUPAL almacén rest, por Diego Maroto, sirviendo por el puerto 30003')
})