// import required libraries
var sq = require("sqlite3");
const express=require("express");
const ip =require("ip")
const path=require("path")
var geoip = require('geoip-lite');
const bodyParser=require("body-parser");
const nodeCache = require('node-cache')
const queryCache = new nodeCache()
const { resolve } = require("path");
const { Console, table } = require("console");
var objectCsv=require("objects-to-csv")
const app=express()
app.set('view engine', 'ejs');
// creating general database
function create_db(){
var db = new sq.Database('data.db',(err)=>{
    if(err){
        console.log(err)
    }else{
        return db;
    }
    
});
return db;
}
// creating all the needed tables.
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
        create table if not exists academic(
            sid int primary key,
            name text,
            marks text,
            Grade text,
            Transcript blob,
            Remarks text,
            FOREIGN KEY (sid) REFERENCES students(id)
        );
   
        create table if not exists health(
            sid int primary key,
            first_name text,
            second_name text,
            doctor_fname text,
            doctor_sname text,
            hispital text,
            hospital_level text,
            gender text,
            age int,
            medical_report blob,
            remarks text,
            FOREIGN KEY (sid) REFERENCES students(id)
        );
    create table if not exists discipline(
        sid int primary key,
        school_id int,
        Teacher_fname text,
        Teacher_sname text,
        report text,
        remarks text,
        FOREIGN KEY (sid) REFERENCES students(id)
    );
    create table if not exists transfers(
        sid int primary key,
        previous text,
        current text,
        created date,
        createdby text,
        remark text,
        FOREIGN KEY (sid) REFERENCES students(id)
    );
   `

   );
}
// adding data to relevant tables
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
    insert into schools(sid,name,principal,doc,county,district,village,map,doe,pdj,remarks)
    values(?,?,?,?,?,?,?,?,?,?,?)
    `,sc_array[0],sc_array[1],sc_array[2],sc_array[3],sc_array[4],sc_array[5]
    ,sc_array[6],sc_array[7],sc_array[8],sc_array[9],sc_array[10],(err)=>{
        if (err){
            console.log(err)
        }
    })
}
function insertPerf(db,pArray){
    db.run(`insert into academic(sid,name,marks,Grade,Transcript,Remarks)
    VALUES(?,?,?,?,?,?)`,pArray[0],pArray[1],pArray[2],pArray[3],pArray[4],pArray[5],(err)=>{
        if(err){
            console.log(err)
        }
    }
    )
}
function insertHealth(db,hArray){
    db.run(`insert into health (sid,first_name,second_name,doctor_fname,doctor_sname,hispital,gender,age,medical_report,remarks)
    values(?,?,?,?,?,?,?,?,?,?) `,hArray[0],hArray[1],hArray[2],hArray[3],hArray[4],hArray[5],hArray[6],hArray[7],hArray[8],hArray[9])
}
function insertDisp(db,dArray){
    db.run(`insert into discipline(sid,school_id,Teacher_fname,Teacher_sname,report,remarks)
    values(?,?,?,?,?,?)`,dArray[0],dArray[1],dArray[2],dArray[3],dArray[4],dArray[5])
}
// adding transfers requested to database
function insertTrans(db,tArray){
db.run(`insert into transfers(sid,previous,current,created,createdby,remark) values(?,?,?,?,?,?)`,
tArray[0],tArray[1],tArray[2],tArray[3],tArray[4],tArray[5]
)
}
function looper(body){
    bodyArray=[];
    for(const [key,value] of Object.entries(body)){
         bodyArray.push(value);
    }
    return bodyArray;
}
function shifter(arr,index,element){
    if(index<=arr.length && index>=0){
        for(var i=arr.length;i>index;i--){
            arr[i]=arr[i-1];  
        }
        arr[index]=element;
    }
    return arr

}
async function toCsv(data,filename){
    const csvData=new objectCsv(data);
    await csvData.toDisk(filename);
}

/**
function numerate(){
    const db=create_db()
}
**/
app.use('/statics', express.static(path.join(__dirname,'statics')))
app.use(bodyParser.urlencoded({
    extended: true
  }))
// index/ home page route
app.get('/',(req,res)=>{
    const db=create_db();
    create_table(db) //table creator
    ips=req.socket.remoteAddress.split(':').pop().toString()
    var geo = geoip.lookup(ips);
    db.all(` select *from schools s join students st on s.sid=st.id
    `,(err,schools)=>{
        console.log(schools)
        res.render('pages/index',{schools:schools,ips:ips})
    })


})
// query/data retrieval page route
app.get('/student',(req,res)=>{
    const db =create_db()
    db.all(` select *from students
    `,(err,rows)=>{
        toCsv(rows,"./student_info.csv")
            res.render('pages/student',{rows:rows});
            
    }
    )
})
// student search data input route
app.post('/student',(req,res)=>{
    const db=create_db()
    if(Object.keys(req.body)[0]=="student"){
    db.all(`select *from students where (id=? or sid=?) or (parent_name=? or parent_sname=?) or (principal=?) or (dob>? and dob<?) or (doj>? and doj<?)
    `,req.body.student,req.body.school,req.body.parent,req.body.parent,req.body.principal,req.body.dob1,req.body.dob2,req.body.dob1,req.body.dob2,(err,rows)=>{
        toCsv(rows,"/student_info.csv")
        res.render('pages/student',{rows:rows});
    })
   }else if(Object.keys(req.body)[0]=="studentA"){
        db.all(`select *from academic where (sid=? or name=?)
        `,req.body.studentA,req.body.studentName,(err,rows)=>{
            toCsv(rows,"/student_info.csv")
            res.render('pages/academic',{rows:rows})
            
        }

        )
    }else if(Object.keys(req.body)[0]=="hsid"){
        db.all(`
        select *from health where sid=? or (first_name=? or second_name=?) or (doctor_fname=? or doctor_sname=?) or (hispital=?) 
        `,req.body.hsid,req.body.paname,req.body.paname,req.body.dname,req.body.dname,req.body.hospital,(err,rows)=>{
            toCsv(rows,"/student_info.csv")
            res.render('pages/health',{rows:rows})
        })
    }else if (Object.keys(req.body)[0]=="dsid"){
        db.all(`
        select *from discipline where (sid=? or school_id=?) or (Teacher_fname=? or Teacher_sname=?)
        `,req.body.dsid,req.body.schoolid,req.body.deputy,req.body.deputy,(err,rows)=>{
        toCsv(rows,"/student_info.csv")
        res.render('pages/disp',{rows:rows})
        })
        
    }
 
})
// school data query route
app.get('/school_res',(req,res)=>{
    const db=create_db();
    db.all(` select *from schools
    `,(err,rows)=>{
        toCsv(rows,"./schools.csv")
        res.render('pages/school_res',{rows:rows})
    })

})
// school search data route
app.post('/school_res',(req,res)=>{
    const db=create_db()
    db.all(`select *from schools where (sid=? or county=?) or (district=?) or (doe >=? and doe<=?)
    `,req.body.school,req.body.county,req.body.district,req.body.est1,req.body.est2,(err,rows)=>{
        toCsv(rows,"./schools.csv")
        res.render('pages/school_res',{rows:rows});
    })
})
// student data form page route
app.get('/student-add',(req,res)=>{
    res.render('pages/addstudent');
})
// adding student input data into the database.
app.post('/student-add',(req,res)=>
{
    const db=create_db();

        if(Object.keys(req.body)[0]=="name"){
            var now=Date.now()
            var fullDate=new Date(now);
            var setId=fullDate.getFullYear() + fullDate.getMonth() + fullDate.getDate();
            //console.log(looper(req.body))
            try{
            insert_student(db,[parseInt(setId)].concat(looper(req.body)));
            res.redirect('/student-add');
            }catch(err){
                console.log(err)
            }
        }else if (Object.keys(req.body)[0]=="student"){
            insertPerf(db,looper(req.body));
            res.redirect('/student-add');
            
        }else if(Object.keys(req.body)[0]=="hname"){
            insertHealth(db,looper(req.body));
            res.redirect('/student-add');
            
        }else{
            insertDisp(db,looper(req.body));
            res.redirect('/student-add');
        }
  
})
// adding school info page 
app.get('/school',(req,res)=>{
    res.render('pages/school');
})
app.post('/school',(req,res)=>{
    const db=create_db()
    var school_info=[];
    var now=Date.now()
    var fullDate=new Date(now);
    var doe=fullDate.getFullYear() + ":" + fullDate.getMonth() + ":"+ fullDate.getDate();
    console.log(doe)
    for(const [key,value] of Object.entries(req.body)){
        school_info.push(value);
    }

    try{
        insert_school(db,shifter(school_info,3,doe));
        res.redirect('/');
    }catch(err){
        console.log(err);
    }
})
// transfer input form page
app.get('/transfers',(req,res)=>{
    db=create_db()
    if (queryCache.has('transfers')){
    res.render('pages/transfers',{rows:queryCache.get('transfers')});
    }else{
        db.all(`select *from transfers`,(err,rows)=>{
            queryCache.set('transfers',rows)
            res.render('pages/transfers',{rows:rows})
        })

    }
    
})
app.post('/transfers',(req,res)=>{
    const db=create_db();
    console.log(req.body)
   if(Object.keys(req.body)[3]=="remarks"){
    insertTrans(db,looper(req.body));
    res.redirect('/transfers');
   }else{
    db.all(`select *from transfers where (sid=? or previous=?) or (current=?) or (sid=? and previous=?) and (current=?)`,
    req.body.sids,req.body.from,req.body.to,req.body.sids,req.body.from,req.body.to,(err,rows)=>{
        res.render('pages/transfers',{rows:rows});
    }
    )
    console.log("search")
   }
   
})
// school data download link 
app.get("/school_download",(req,res)=>{
    res.download(__dirname+'/schools.csv',(err)=>{
        if(err){
            console.log("file not found")
        }
    })
})
app.get("/student_download",(req,res)=>{
    res.download(__dirname+"/student_info.csv",(err)=>{
        if(err){
            console.log("file not found");
        }
    })
})
const server=app.listen(3000,()=>{
    console.log(`Server running at ${ip.address()} port: ${server.address().port}`)
}
)