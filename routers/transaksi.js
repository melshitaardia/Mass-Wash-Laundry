const { request, response } = require("express")
const express = require("express")
const app = express()
app.use(express.json())

//memanggil model 
const models = require("../models/index")
const transaksi = models.transaksi
const detail_transaksi = models.detail_transaksi

const {auth} = require("./login")
app.use(auth)

app.get("/", async(request, response) => {
    let dataTransaksi = await transaksi.findAll({
        include : [
            { model: models.member, as: "member" },
            { model: models.users, as: "user" },
            { 
                model: models.detail_transaksi, 
                as: "detail_transaksi",
                include : [
                    {model: models.paket, as: "paket"}
                ]
            }
        ]
    })
    return response.json(dataTransaksi)
})

app.post("/", async(request, response) => {
    let newTransaksi = {
        id_member : request.body.id_member,
        tgl : request.body.tgl,
        batas_waktu : request.body.batas_waktu,
        tgl_bayar : request.body.tgl_bayar,
        status : 1,
        dibayar : request.body.dibayar,
        id_user : request.body.id_user,
    }
    transaksi.create(newTransaksi)
    .then(result=> {
        //jika insert data transaksi berhasil maka akan lanjut ke inseert detail transaksi
        let newIdTransaksi = result.id_transaksi
        let detail = request.body.detail_transaksi
        for (let i = 0; i < detail.length; i++) {
            //sebelumnya nilai detail[i] hanya mempunyai id_paket dan qty, maka untuk menambahkan id_transaksi 
            //menggunakan for untuk menambah id_transaksi disetiap objek pada array
            detail[i].id_transaksi = newIdTransaksi            
        }
        //proses insert detail transaksi
        detail_transaksi.bulkCreate(detail)
        //create : hanya menambah 1 data objek
        //bulkCreate : dapat menambah data objek dalam jumlah banyak (array)
        .then(result=> {
            return response.json({
                message: `Data transaksi berhasil ditambahkan`
            })
        })
        .catch(error => {
            return response.json({
                message: error.message
            })
        })
    })
    .catch(error => {
        return response.json({
            message: error.message
        })
    })
})
//mengubah data transaksi dan disisipkan di url /:id_transaksi
app.put("/:id_transaksi", (request, response) => {
    //tampung data untuk update ke tabel transaksi
    let dataTransaksi = {
        id_member : request.body.id_member,
        tgl : request.body.tgl,
        batas_waktu : request.body.batas_waktu,
        tgl_bayar : request.body.tgl_bayar,
        status : 1,
        dibayar : request.body.dibayar,
        id_user : request.body.id_user,
    }

    //tampung parameter id_transaksi
    let param = {
        id_transaksi: request.params.id_transaksi
    }
    transaksi.update(dataTransaksi, {where: param})
    //setelah berhasil insert data detail transaksi yang lama dihapus berdasarkan id_transaksinya
    .then(async (result) => {

        // hapus data di detail
        await detail_transaksi.destroy({where: param})

        // ambil nilai dari transaksi_id
        let detail = request.body.detail_transaksi

        // proses menyisipkan transaksi_id
        for (let i = 0; i < detail.length; i++) {
            //sebelumnya nilai detail[i] hanya mempunyai id_paket dan qty, maka untuk menambahkan id_transaksi 
            //menggunakan for untuk menambah id_transaksi disetiap objek pada array
            detail[i].id_transaksi = request.params.id_transaksi            
        }
        detail_transaksi.bulkCreate(detail)
        .then(result => {
            response.json({
                message: "data berhasil di update"
            })
        })
        .catch(error => {
            response.json({
                message: error.message
            })
        })
    })

    //setelah dihapus masukan lagi menggunakan bulkcreate 
})
app.delete("/:id_transaksi", (request, response) => {
    let param = {
        id_transaksi: request.params.id_transaksi
    }
    detail_transaksi.destroy({where: param})
    .then(result => {
        //menghapus data transaksi
        transaksi.destroy({where:param})
        .then(hasil => {
            response.json({
                message: `Data Berhasil Dihapus`
            })
        })
        .catch(error => {
            response.json({
                message: error.message
            })
        })
    })
    .catch(error => {
        response.json({
            message: error.message
        })
    })
})

//endpoint untuk mengubah status transkasi
app.post("/status/:id_transaksi", (request, response) => {
    let param = {id_transaksi: request.params.id_transaksi}
    let data = {
        status: request.body.status
    }
    //proses update status transaksi
    transaksi.update(data, {where: param})
    .then(result => {
        return response.json({
            message: `Data Status Berhasil diubah`
        })
    })
    .catch(error =>{
        return response.json({
            message: error.message
        })
    })
})

app.get("/bayar/:id_transaksi", (request, response) => {
    let param = {id_transaksi: request.params.id_transaksi}

    let data = {
        //mendapatkan tanggal yang saat ini berjalan
        tgl_bayar: new Date().toISOString().split("T")[0],
        dibayar: true
    }
    transaksi.update(data, {where: param})
    .then(result => {
        return response.json({
            message: `Transaksi telah berhasil dibayar`
        })
    })
    .catch(error => {
        return response.json({
            message: error.message
        })
    })
})
module.exports = app