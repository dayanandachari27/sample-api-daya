const express = require('express');
const app = express();

app.use(express.json());

// Sample in-memory data
let employees = [
  { id: 1, name: "John" },
  { id: 2, name: "David" },
  { id: 3, name: "dayanand" },
  { id: 4, name: "Ravi" }
];

// Home Route
app.get('/', (req, res) => {
  res.send('Sample Employee API is running');
});

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "sample-api",
    port: 3000
  });
});

// Get All Employees
app.get('/employees', (req, res) => {
  res.status(200).json(employees);
});

// Get Employee By ID
app.get('/employees/:id', (req, res) => {
  const emp = employees.find(e => e.id == req.params.id);

  if (emp) {
    res.status(200).json(emp);
  } else {
    res.status(404).json({
      message: "Employee not found"
    });
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

  const exists = employees.find(e => e.id == newEmployee.id);

  if (exists) {
    return res.status(409).json({
      message: "Employee id already exists"
    });
  }

  employees.push(newEmployee);

  res.status(201).json({
    message: "Employee Added",
    employee: newEmployee
  });
});

// Update Employee
app.put('/employees/:id', (req, res) => {
  const emp = employees.find(e => e.id == req.params.id);

  if (!emp) {
    return res.status(404).json({
      message: "Employee not found"
    });
  }

  emp.name = req.body.name || emp.name;

  res.status(200).json({
    message: "Employee Updated",
    employee: emp
  });
});

// Delete Employee
app.delete('/employees/:id', (req, res) => {
  const index = employees.findIndex(e => e.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({
      message: "Employee not found"
    });
  }

  const deleted = employees.splice(index, 1);

  res.status(200).json({
    message: "Employee Deleted",
    employee: deleted[0]
  });
});

// Version Route
app.get('/version', (req, res) => {
  res.status(200).json({
    version: "1.0.0",
    build: process.env.BUILD_NUMBER || "local-dev"
  });
});

// Start Server only when run directly
if (require.main === module) {
  app.listen(3000, '0.0.0.0', () => {
    console.log("Server running on port 3000");
  });
}

// Export app for testing
module.exports = app;