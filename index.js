const express = require("express")
const app = express()
const fs = require("fs")
const ytdl = require("ytdl-core")
const body_parser = require("body-parser")
const cors = require("cors")


app.use(cors())
app.use(body_parser.json())
app.use(express.static("public"))


app.set("view engine","ejs")
app.listen(2000, ()=>{console.log("http://localhost:"+2000)})
app.get("/",(req, res)=>{
    res.send("Bienvenue sur notre platform de téléchargement de video Youtub gratuitement")
})
app.get("/infovideo",(req,res)=>{
    const url_video = req.body.url
    ytdl.getInfo(url_video)
     .then(info =>{
        const title = info.videoDetails.title
        const author = info.videoDetails.author
        const inf = info.videoDetails
        res.status(200).json({title,author,inf})
     })
})
app.post("/", (req,res)=>{
    const url_video = req.body.url
    ytdl.getInfo(url_video)
     .then(info =>{
        const format = ytdl.chooseFormat(info.formats,{quality:""})
        const outputFile =`${info.videoDetails.title}.mp4`
        const outputStream = fs.createWriteStream(outputFile)
        ytdl.downloadFromInfo(info, {format:format}).pipe(outputStream)
        outputStream.on("finish", ()=>{
            res.status(200).json({info})
        })
     })
     .catch(er =>{console.log(er)})
})
app.post("/ytdl", (req,res)=>{
    const url_video = req.body.url
    ytdl.getInfo(url_video)
     .then(info =>{
        const name = `${info.videoDetails.title}.mp4`
        res.download(name, (erreur )=>{
            if(erreur)
            {
                const message = "le serveur n'a pas pu transfèrer la video dans vos téléchargement "
                res.status(500).json({message,erreur})
            }
            else
            {
                const message = `La video "${name}" a été télécharger avec succes. vous pouvez donc y acceder a partir de vos téléchargement`
                res.status(200).json({message})
            }
        })
     })
})
