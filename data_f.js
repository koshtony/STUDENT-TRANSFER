// import required libraries
var sq = require("sqlite3");
const express=require("express");
const ip =require("ip")
const app=express()
function create_db(){
var db = new sq.Database('data.db',(err)=>{
    if(err){
        console.log(err)
    }else{
        return db
    }
});
return db;
}
function create_table(db){
    db.exec(
        `create table if not exists schools(
            sid int PRIMARY KEY,
            name text,
            principal text,
            doc date,
            county,
            district,
            village
        );
        `

        );
        db.exec(`
        create table if not exists students(
            id int primary key,
            first text,
            second text,
            sir text,
            dob date,
            start_date date, 
            school text,
            sid int,
            principal text, 
            county text,
            district text,
            village text,
            remarks text,
            FOREIGN KEY (sid) REFERENCES schools(sid)
        );
         `
        );
}
function insert_student(db,s_array){
    db.run(`
    insert into students(id,first,second,sir,dob,start_date,school,sid,principal,county,district,village,remarks) 
    values(?,?,?,?,?,?,?,?,?,?,?,?)
    `,s_array[0],s_array[1],s_array[2],s_array[3],s_array[4],s_array[5],s_array[6],s_array[7],s_array[8],s_array[9],s_array[10],s_array[11])
}
function insert_school(db,sc_array){
    db.run(`
    insert into schools(sid,name,principal,doc,county,district,village)
    values(?,?,?,?,?,?,?)
    `,sc_array[0],sc_array[1],sc_array[2],sc_array[3],sc_array[4],sc_array[5],sc_array[6],(err)=>{
        if (err){
            console.log(err)
        }
    })
}
var sc_array=[1,"Juja Farm"," ",Date.now()," "," "," "];
//create_table(create_db());
//insert_school(create_db(),sc_array);
app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/dash.html")
})
const server=app.listen(3000,()=>{
    console.log(`Server running at ${ip.address()} port: ${server.address().port}`)
}
)