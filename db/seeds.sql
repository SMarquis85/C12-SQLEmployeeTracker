INSERT INTO Departments (name)
VALUES ("Executive"), ("Military"), ("Research"), ("Misc");

INSERT INTO Roles (title,salary,dept_id)
VALUES ("Emperor", 250000, 1), ("Sith Apprentice", 150000, 1), ("Grand Moff", 100000, 2),
("Fleet Admiral", 80000, 2), ("Director of Military Research", 140000, 2), ("Scientist", 90000, 3);

INSERT INTO Employees (first_name,last_name,role_id,manager_id)
VALUES ("Sheev", "Palpatine", 1, null), ("Darth", "Vader", 2, 1), ("Wilhuff", "Tarkin", 3, 1),
("Orson","Krennic", 5, 3), ("Cylo", "", 6, 1), ("Gallius", "Rex",4, 1);