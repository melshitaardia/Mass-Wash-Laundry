const express = require("express")
const app = express()
const models = require("../models/index")
const paket = models.paket
app.use(express.json())
app.get("/",async(request, response) => {
    let dataPaket = await paket.findAll()
    return response.json(dataPaket)
})
app.post("/",(request,response) => {
    let newPaket = {
        jenis_paket: request.body.jenis_paket,
        harga: request.body.harga
    }

    paket.create(newPaket)
    .then(result => {
        return response.json({
            message: `Data paket berhasil ditambahkan`,
            data: result
        })
    })
    .catch(error => {
        return response.json({
            message: error.message
        })
    })
})

app.put("/:id_paket",(request,response) => {
    let data = {
        jenis_paket: request.body.jenis_paket,
        harga: request.body.harga
    }

    let parameter = {
        id_paket: request.params.id_paket
    }

    paket.update(data, {where: parameter})
    .then(result => {
        return response.json({
            message: `Data paket berhasil diubah`,
            data: result
        })
    })
    .catch(error => {
        return response.json({
            message: error.message
        })
    })
})

app.delete("/:id_paket", (request,response) => {
    let parameter = {
        id_paket: request.params.id_paket
    }

    paket.destroy({where: parameter})
    .then(result => {
        return response.json({
            message: `Data paket berhasil dihapus`
        })
    })
    .catch(error => {
        message: error.message
    })
})
module.exports = app