// import required libraries
var sq = require("sqlite3");
const express=require("express");
const ip =require("ip")
const path=require("path")
const bodyParser=require("body-parser");
const { resolve } = require("path");
const app=express()
app.set('view engine', 'ejs');
function create_db(){
var db = new sq.Database('data.db',(err)=>{
    if(err){np
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
            county text,
            district text,
            village text,
            map text,
            doe date,
            pdj date,
            remarks text
        );
        `
        );
        db.exec(`
        create table if not exists students(
            id int primary key,
            first text,
            sir text,
            parent_name text,
            parent_sname text,
            school text,
            sid int,
            principal text,
            student_location text,
            school_location text,
            county text,
            district text,
            dob text,
            doj text,
            doe text,
            birth_certificate blob,
            passport blob,
            former_id blob,
            parents_id blob,
            remarks text,
            FOREIGN KEY (sid) REFERENCES schools(sid)
        );
         `
        );
    db.exec(
        `create if not exists academic(
            sid int primary key,
            name text,
            Transcript blob,
            Remarks text
        );`
    );
    db.exec(
        `create if not exists health(
            sid int primary key,
            first_name text,
            second_name text,
            doctor_fname text,
            doctor_sname text,
            hispital text,
            hospital level,
            gender text,
            age,
            medical_report blob,
            remarks text
        );`
    )
   db.exec(
    `create if not exists discipline(
        Teacher_fname text,
        Teacher_sname text,
        report text,
        remarks
    );
   `

   )
}
function insert_student(db,s_array){
    db.run(`
    insert into students(id,first,sir,parent_name,parent_sname ,school,sid,principal,student_location,
        school_location,county,district,dob,doj,doe,birth_certificate,passport,former_id,
        parents_id,remarks) 
    values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,s_array[0],s_array[1],s_array[2],s_array[3],s_array[4],s_array[5],s_array[6],s_array[7],s_array[8],s_array[9],s_array[10],
    s_array[11],s_array[12],s_array[13],s_array[14],s_array[15],s_array[16],s_array[17],s_array[18],s_array[19])
}
function insert_school(db,sc_array){
    db.run(`
    insert into schools(sid,name,principal,doc,county,district,village)
    values(?,?,?,?,?,?,?)
    `,sc_array[0],sc_array[1],sc_array[2],sc_array[3],sc_array[4],sc_array[5]
    ,sc_array[6],sc_array[7],sc_array[8],sc_array[9],sc_array[10],(err)=>{
        if (err){
            console.log(err)
        }
    })
}
/**function getData(db){
    db.all(`
        select *from students
    `,(err,rows)=>{
        if(err){
            console.log(err)
        }else{
            var data=[]
            rows.forEach(row=>{
                console.log(row.id)
            
            })
        }
    })
    
}
**/
function trans_student(db){
    return 0;
}
app.use('/statics', express.static(path.join(__dirname,'statics')))
app.use(bodyParser.urlencoded({
    extended: true
  }))
app.get('/',(req,res)=>{
    var name="tony";
    res.render('pages/index',{name:name})
})
app.get('/student',(req,res)=>{
    const db =create_db()
    db.all(` select *from students
    `,(err,rows)=>{
            res.render('pages/student',{rows:rows});
    }
    )
})
app.post('/student',(req,res)=>{
    console.log(req.body)
    res.redirect('/student')
})
app.get('/student-add',(req,res)=>{
    res.render('pages/addstudent');
})
app.post('/student-add',(req,res)=>
{
    var info=[];
    for (const [key,value] of Object.entries(req.body)){
        info.push(value)
    }
    try{
        if (info.length>15){
            var db=create_db();
            create_table(db);
            insert_student(db,info);
            res.redirect('/');
        }else{
            console.log(info)
        }
    }catch(err){
        console.log("database error")
    }
})
app.get('/school',(req,res)=>{
    res.render('pages/school');
})
const server=app.listen(3000,()=>{
    console.log(`Server running at ${ip.address()} port: ${server.address().port}`)
}
)