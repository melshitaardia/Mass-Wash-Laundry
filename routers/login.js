const express = require("express")
const md5 = require("md5")
const login = express()
login.use(express.json())

const jwt = require("jsonwebtoken")
const secretkey = "tokolaundry"
const models = require("../models/index")
const user = models.users





login.post("/",async (request, response) => {
    
    let login = {
        username : request.body.username,
        password : md5(request.body.password),
    }
    let dataUser = await user.findOne({
        where : login
    })
    if(dataUser){
        let payload = JSON.stringify(dataUser)
        let token = jwt.sign(payload, secretkey)
        return response.json({
            logged: true,
            token: token,
            user: dataUser
        })
    }else{
        return response.json({
            logged: false,
            message: `Invalid Username or Password`
        })
    }
})

// fungsi auth digunakan untuk verifikasi token yg dikirimkan
const auth = (request, response, next) => {
    // kita dapatkan data authorization
    let header = request.headers.authorization
    // header = Bearer hofihdsofhfifhsdklfhisdgh
    
    // kita ambil data token nya
    let token = header && header.split(" ")[1]

    if(token == null){
        // jika token nya kosong
        return response.status(401).json({
            message: `Unauthorized`
        })
    }else{
        let jwtHeader = {
            algorithm: "HS256"
        }

        // verifikasi token yang diberikan
        jwt.verify(token, secretkey, jwtHeader, error => {
            if(error){
                return response.status(401).json({
                    message: `Invalid Token`
                })
            }else{
                next()
            }
        })
    }
}

module.exports = {login, auth}