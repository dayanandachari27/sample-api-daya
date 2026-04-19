const express = require('express');
const app = express();

app.use(express.json());

let employees = [
  { id: 1, name: "John" },
  { id: 2, name: "David" }
];

app.get('/health', (req,res)=>{
   res.json({status:"UP"});
});

app.get('/employees', (req,res)=>{
   res.json(employees);
});

app.get('/employees/:id', (req,res)=>{
   const emp = employees.find(e => e.id == req.params.id);
   res.json(emp || {message:"Not found"});
});

app.post('/employees', (req,res)=>{
   employees.push(req.body);
   res.json({message:"Employee Added"});
});

app.listen(3000, ()=>{
 console.log("Server running on 3000");
});