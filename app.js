const express = require('express');
const app = express();

app.use(express.json());

// Sample in-memory data
let employees = [
  { id: 1, name: "John" },
  { id: 2, name: "David" }
];

// Home Route
app.get('/', (req, res) => {
  res.send('Sample Employee API is running');
});

// Health Check Route
app.get('/health', (req, res) => {
  res.json({
    status: "UP",
    service: "sample-api",
    port: 3000
  });
});

// Get All Employees
app.get('/employees', (req, res) => {
  res.json(employees);
});

// Get Employee By ID
app.get('/employees/:id', (req, res) => {
  const emp = employees.find(e => e.id == req.params.id);

  if (emp) {
    res.json(emp);
  } else {
    res.status(404).json({ message: "Employee not found" });
  }
});

// Add Employee
app.post('/employees', (req, res) => {
  const newEmployee = req.body;

  if (!newEmployee.id || !newEmployee.name) {
    return res.status(400).json({
      message: "id and name are required"
    });
  }

  employees.push(newEmployee);

  res.status(201).json({
    message: "Employee Added",
    employee: newEmployee
  });
});

// Version Route (Good for Interview Demo)
app.get('/version', (req, res) => {
  res.json({
    version: "1.0.0",
    build: "local-dev"
  });
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});