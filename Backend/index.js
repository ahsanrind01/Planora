const express = require('express')
const app = express()

app.get('/', (req,res )=>{
    res.json({message : 'recevied'})
})

app.listen(3000);