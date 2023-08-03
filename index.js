const inquirer = require("inquirer");
const figlet = require("figlet");
const chalk = require("chalk");
const cTable = require("console.table");

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

initialQuery = () => {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
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
          viewTable();
          break;

        case "Add department, roles or employees":
          addValue();
          break;

        case "Remove department":
          removeDep();
          break;

        case "Update employee role":
          updateRole();
          break;

        case "Remove employee":
          removeEmp();
          break;

        case "View department budgets":
          viewBudget();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

viewTable = () => {
  // ... (rest of the viewTable function, no changes needed)
}

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

updateRole = () => {
  // ... (rest of the updateRole function, no changes needed)
}

removeDep = () => {
  inquirer
    .prompt([
      {
        name: "depToRemove",
        type: "input",
        message: "What is the department you would like to remove?",
      },
    ])
    .then((answer) => {
      const query = `SELECT dep_id AS Department_ID FROM departments WHERE name = ?`;
      connection.query(query, [answer.depToRemove], (err, res) => {
        if (err) throw err;
        if (res.length === 0) {
          console.log(chalk.red.inverse("No department found"));
          initialQuery();
        } else {
          console.log(chalk.green.inverse("Department found"));
          console.log(` `);
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(`                              ` + chalk.red.bold(`Department Information:`));
          console.table(res);
          console.log(chalk.green.bold(`====================================================================================`));
          inquirer
            .prompt({
              name: "depConfirm",
              type: "number",
              message: "Please enter the department ID to confirm choice:",
            })
            .then((answer) => {
              const deleteQuery = `DELETE FROM departments WHERE dep_id = ?`;
              connection.query(deleteQuery, [answer.depConfirm], (err, res) => {
                if (err) throw err;
                console.log(chalk.green.bold(`====================================================================================`));
                console.log(`                  ` + chalk.red.bold(`Department #${answer.depConfirm} has been removed.`));
                console.log(chalk.green.bold(`====================================================================================`));
                initialQuery();
              });
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