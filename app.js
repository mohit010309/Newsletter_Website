const bodyParser=require('body-parser');
const express=require('express');
const request=require('request');
const https=require('https');
require('dotenv').config();


const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.listen(process.env.PORT || 3000,function(){
    console.log("Server is running on port 3000");
});

app.get("/",function(req,res){
    res.sendFile(__dirname+"/signup.html");
});

app.get("/about",function(req,res){
    const url = "https://us14.api.mailchimp.com/3.0/lists/1197909e5a/members";
    const options = {
        method:"GET",
        // auth: "mohitakh:b301ba939bd0c97f9db09b06bf3eca8d-us14"
        auth:"mohitakh:"+process.env.API_KEY
    };
    
    const mailReq = https.request(url,options,function(response){
        // response.on("data",function(chunk){
        //     //console.log(chunk.toString());
        //     // console.log("JSON string length : "+chunk.toString().length);
        //     // var ob=JSON.parse(chunk);
        //     // console.log(ob);
        //     console.log(chunk.toString());
        // });
        var dataRec="";
        response.on("data",function(chunk){
            dataRec=dataRec+chunk;
            // console.log(dataRec);
        });
        response.on("end",function(chunk){
            //console.log(JSON.parse(dataRec));
            //console.log(dataRec);
            const jsonData = JSON.parse(dataRec);
            var email_list = [];
            for(var i=0;i<jsonData.members.length;i++)
            {
                email_list.push(jsonData.members[i].email_address);
            }
            console.log(email_list);

            var htmlResponse="<h1>Subscribers List</h1><ul>";
            for(var i=0;i<email_list.length;i++)
            {
                htmlResponse+="<li>"+email_list[i]+"</li>";
            }
            htmlResponse+="</ul>";
            res.send(htmlResponse);
        });
    });
    // mailReq.on("error",function(error){
    //     console.log(error);
    // });
    
    // console.log(JSON.parse(dataRec));
    mailReq.end();
    
    // console.log(JSON.parse())
    
});

app.post("/",function(req,res){
    
    const fname = req.body.firstName;
    const lname = req.body.lastName;
    const email = req.body.email;
    

    //creating the javascript object
    const ob = {
        members:[
            {
                email_address: email,
                status: "subscribed",
                merge_fields:{
                    FNAME: fname,
                    LNAME: lname
                }
            }
        ]
    };
    const jsonData = JSON.stringify(ob);


    // Using Mailchimp API to send data to them 
    const url = "https://us14.api.mailchimp.com/3.0/lists/1197909e5a";
    //console.log(process.env.API_KEY);
    const options = {
        method:"POST",
        // auth: "mohitakh:038e688e82d4b24f8440cb5f912766c0-us14"
        auth:"mohitakh:"+process.env.API_KEY
    };

    const mailReq = https.request(url,options,function(response){
        if(response.statusCode===200)
            res.sendFile(__dirname+"/success.html");
        else
        {
            res.sendFile(__dirname+"/failure.html");
        }

        //printing whatever data received on console
        response.on("data",function(chunk){
            console.log(JSON.parse(chunk));
        });
    });
    mailReq.write(jsonData);
    
    mailReq.on('error',function(error){
        console.log(error);
    });

    mailReq.end();
    //res.send("Data posted...");
});

app.post("/failure",function(req,res){
    res.redirect("/");
});
// API KEY for mailchimp
// b301ba939bd0c97f9db09b06bf3eca8d-us14

// New API Key
// 038e688e82d4b24f8440cb5f912766c0-us14

// list ID for audience in mailchimp
// 1197909e5a

// API ENDPOINT
// https://us14.api.mailchimp.com/3.0/lists