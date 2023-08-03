const inquirer = require("inquirer");
const mysql = requirer("mysql2");
const figlet = require("figlet");
const chalk = require("chalk");
const cTable = require("console.table")

const connection = require('./config/connection');

connection.connect((err) => {
  if (err) throw err;
  console.log(chalk.blue.bold(`==============================================================================================`));
  console.log(chalk.blue.bold(`==============================================================================================`));
  console.log(``);
  console.log(chalk.red.bold(figlet.textSync("Employee Tracker", {
    font: "Star Wars",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 90,
    whitespaceBreak: false,
  })));
  console.log(`                                                                    ` + chalk.yellow.bold("Created By: Sophie Marquis"));
  console.log(``);
  console.log(chalk.blue.bold(`==============================================================================================`));
  console.log(chalk.blue.bold(`==============================================================================================`));
  console.log(``);
  initialQuery();
});

function mainPrompt() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View department, roles or employees",
        "Add department, roles or employees",
        "Remove department",
        "Update employee role",
        "Remove employee",
        "View department budgets",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View department, roles or employees":
          viewPrompt();
          break;
        case "Add department, roles or employees":
          addPrompt();
          break;
        case "Remove department":
          removeDep(); // Call the removeDep function
          break;
        case "Update employee role":
          updateEmpRole();
          break;
        case "Remove employee":
          removeEmp();
          break;
        case "View department budgets":
          viewBudgets();
          break;
        case "Exit":
          connection.end();
          break;
      }
    });
}

// function to view tables of departments, roles and/or employees
viewTable = () => {
  inquirer
    .prompt({
      name: "view_table",
      type: "list",
      message: "Which table would you like to view?",
      choices: ["Departments", "Roles", "Employees"],
    })
    .then((val) => {
      if (val.view_table === "Departments") {
        connection.query(`SELECT dept_id AS Department_ID, departments.name AS Department_Name FROM departments`, (err, res) => {
          if (err) throw err;
          console.log(' ');
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(`                              ` + chalk.red.bold(`All Departments:`));
          console.table(res);
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(' ');
          initialQuery();
        });
      } else if (val.view_table === "Roles") {
        const query = `SELECT roles.role_id AS Role_ID, roles.title AS Title, CONCAT('$', FORMAT (salary, 0)) AS Salary, departments.name AS Department 
        FROM roles 
        INNER JOIN departments ON roles.dept_id = departments.dept_id 
        ORDER BY roles.role_id ASC`
        connection.query(query, (err, res) => {
          if (err) throw err;
          console.log(' ');
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(`                              ` + chalk.red.bold(`All Roles:`));
          console.table(res);
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(' ');
          initialQuery();
        });
      } else if (val.view_table === "Employees") {
        const query = `SELECT emp_id AS Employee_ID, first_name AS First_Name, last_name AS Last_Name, title AS Title, CONCAT('$', FORMAT (salary, 0)) AS Salary, departments.name AS Department 
          FROM employees 
          INNER JOIN roles ON employees.role_Id = roles.role_id 
          INNER JOIN departments ON roles.dept_id = departments.dept_id 
          ORDER BY last_name ASC`
        connection.query(query, (err, res) => {
          if (err) throw err;
          console.log(' ');
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(`                              ` + chalk.red.bold(`All Employees:`));
          console.table(res);
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(' ');
          initialQuery();
        });
      }
    });
}

// function to add a department, role and/or employee
addValue = () => {
  inquirer
    .prompt({
      name: "add",
      type: "list",
      message: "Which would you like to add?",
      choices: ["Department", "Role", "Employee"],
    })
    .then((val) => {
      if (val.add === "Department") {
        inquirer
          .prompt({
            type: "input",
            name: "dept_add",
            message: "What is the name of the department you would like to add?",
            validate: newDeptInput => {
              if (newDeptInput) {
                return true;
              } else {
                console.log("Please enter a name for the new department");
                return false;
              }
            }
          })
          .then((answer) => {
            console.log(' ');
            console.log(chalk.green.bold(`====================================================================================`));
            console.log(`                     ` + chalk.red.bold(`Department Added:`) + ` ${answer.dept_add}`);
            console.log(chalk.green.bold(`====================================================================================`));
            console.log(' ');
            connection.query("INSERT INTO departments SET ?", { name: answer.dept_add }, (err, res) => {
              if (err) throw err;
              initialQuery();
            });
          });
      } else if (val.add === "Role") {
        // ... (rest of the addValue function for Role, no changes needed)
      } else if (val.add === "Employee") {
        // ... (rest of the addValue function for Employee, no changes needed)
      }
    });
}

// function to update the role of a single employee
updateRole = () => {

  let listOfEmployees = [];
  let listOfRoles = [];
  let employeeLastName = null;

  // asks the user for the last name of the employee they would like to update
  inquirer
    .prompt([
      {
        name: "empLastName",
        type: "input",
        message:
          "What is the last name of the employee you would like to update?",
      }
    ])
    // then it searches the database for employees with that last name and puts them into an array
    .then((answer) => {

      employeeLastName = answer.empLastName;
      // db query to find all employees by user inputted last name
      // then puts part of the response into an array for subsequent inquirer question
      // then displays info to the user in table
      const query = `SELECT emp_id AS Employee_ID, first_name AS First_Name, last_name AS Last_Name, title AS Title, salary AS Salary, departments.name AS Department FROM employees 
      INNER JOIN roles ON employees.role_Id = roles.role_id
      INNER JOIN departments ON roles.dept_id = departments.dept_id 
      WHERE ?`;
      // 
      connection.query(query, { last_name: answer.empLastName }, (err, res) => {
        if (err) throw err;

        console.log(` `)
        console.log(chalk.green.bold(`====================================================================================`));
        console.log(`                              ` + chalk.red.bold(`Employee Information:`));
        console.table(res);
        console.log(chalk.green.bold(`====================================================================================`));
        console.log(` `);

        listOfEmployees = res.map(employee => (
          {
            name: employee.First_Name,
            value: employee.Employee_ID
          }
        ));

        // db query to find all roles and then put them into an array for a subsequent inquirer question
        connection.query("SELECT * FROM roles", (err, res) => {
          if (err) throw err;

          listOfRoles = res.map(role => (
            {
              name: role.title,
              value: role.role_id
            }
          ))

          inquirer.prompt([
            {
              type: "list",
              name: "nameConfirm",
              message: "Please select the employee to confirm",
              choices: listOfEmployees
            },
            {
              type: "list",
              name: "roleChoice",
              message: "Please select a new role for the employee",
              choices: listOfRoles
            }
          ])
            .then((answers) => {

              const query = `UPDATE employees SET role_id = ${answers.roleChoice} WHERE emp_id = ${answers.nameConfirm}`;
              connection.query(query, (err, res) => {
                if (err) throw err;
              });
            })
            .then(() => {
              const query = `SELECT emp_id AS Employee_ID, first_name AS First_Name, last_name AS Last_Name, title AS Title, salary AS Salary, departments.name AS Department FROM employees 
                INNER JOIN roles ON employees.role_Id = roles.role_id
                INNER JOIN departments ON roles.dept_id = departments.dept_id 
                WHERE ?`;
              connection.query(query, { last_name: employeeLastName }, (err, res) => {
                if (err) throw err;
                console.log(` `);
                console.log(chalk.green.bold(`====================================================================================`));
                console.log(`                              ` + chalk.red.bold(`Updated Employee Information:`));
                console.table(res);
                console.log(chalk.green.bold(`====================================================================================`));
                console.log(` `);
                initialQuery();
              })
            });
        });
      });
    });

}

// function to remove a department from the database

function removeDep() {
  inquirer
    .prompt([
      {
        name: "departmentName",
        type: "input",
        message: "What is the department you would like to remove?",
      },
    ])
    .then((answer) => {
      const departmentName = answer.departmentName;

      // Debugging statement to check the departmentName
      console.log("Department name to remove:", departmentName);

      // Check if the department exists in the database
      const checkDepartmentQuery = "SELECT * FROM departments WHERE name = ?";
      connection.query(checkDepartmentQuery, [departmentName], (err, results) => {
        if (err) throw err;

        // Debugging statement to check the query results
        console.log("Query results:", results);

        if (results.length === 0) {
          console.log("No department found");
          mainPrompt();
        } else {
          const removeDepartmentQuery = "DELETE FROM departments WHERE name = ?";
          connection.query(removeDepartmentQuery, [departmentName], (err, result) => {
            if (err) throw err;
            console.log(`Department "${departmentName}" has been removed.`);
            mainPrompt();
          });
        }
      });
    });
}

// function to remove an employee from the database
removeEmp = () => {

  inquirer
    .prompt([
      {
        name: "empToRemove",
        type: "input",
        message:
          "What is the last name of the employee you would like to remove?",
      },
    ])
    .then((answer) => {
      const query = `SELECT emp_id AS Employee_ID, first_name AS First_Name, last_name AS Last_Name, title AS Title, salary AS Salary, departments.name AS Department FROM employees 
      INNER JOIN roles ON employees.role_Id = roles.role_id
      INNER JOIN departments ON roles.dept_id = departments.dept_id 
      WHERE ?`;
      connection.query(query, { last_name: answer.empToRemove }, (err, res) => {
        if (err) throw err;
        if (res.length === 0) {
          console.log(chalk.red.inverse("No employee found by that name"));
          initialQuery();
        } else {
          console.log(chalk.green.inverse("Employee found"))
          console.log(` `)
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(`                              ` + chalk.red.bold(`Employee Information:`));
          console.table(res);
          console.log(chalk.green.bold(`====================================================================================`));
          inquirer
            .prompt({
              name: "idConfirm",
              type: "number",
              message: "Please enter the employee's ID to confirm choice:",
            })
            .then((answer) => {
              const query = "SELECT * FROM Employees WHERE ?";
              connection.query(query, { emp_id: answer.idConfirm }, (err, res) => {
                if (err) throw err;
                let idToDelete = answer.idConfirm;
                const deleteQuery = `DELETE FROM employees WHERE emp_id = ${idToDelete}`;
                connection.query(deleteQuery, (err, res) => {
                  if (err) throw err;

                  console.log(chalk.green.bold(`====================================================================================`));
                  console.log(`                  ` + chalk.red.bold(`Employee with ID #${idToDelete} has been removed.`));
                  console.log(chalk.green.bold(`====================================================================================`));

                  initialQuery();
                })
              }
              );
            });
        }
      }
      );
    });

}

// function to view the budgets of each department
viewBudget = () => {
  const query = `SELECT departments.dept_id AS Dept_ID, departments.name AS Department_Name, CONCAT('$', FORMAT(SUM(salary),0)) AS Budget 
  FROM roles 
  INNER JOIN employees USING (role_id)
  INNER JOIN departments ON roles.dept_id = departments.dept_id 
  GROUP BY roles.dept_id;`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log(` `);
    console.log(chalk.green.bold(`====================================================================================`));
    console.log(`                              ` + chalk.red.bold(`Department Budgets:`));
    console.table(res);
    console.log(chalk.green.bold(`====================================================================================`));
    console.log(` `);
    initialQuery();
  })
}

// End of line 