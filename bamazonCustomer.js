var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection(
    {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "Littleton99",
        database: "bamazon_db"
    }
);

connection.connect(function (err) {
    if (err) throw err;

    start();

})


function start() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "Who are you?",
                choices: ["customer", "manager", "supervisor", "I'm Done"],
                name: "start"
            }
        ]).then(function (answer) {
            switch (answer.start) {
                case ("customer"):
                    customer();
                    break;
                case ("manager"):
                    manager();
                    break;
                case ("supervisor"):
                    supervisor();
                    break;
                case ("I'm Done"):
                    exit();
                    break;
                default:
                    exit();
            }
        })

};


function customer() {
    connection.query("SELECT id, product_name, price, stock_quantity FROM products;", function (err, data) {
        if (err) throw err;


        for (var i = 0; i < data.length; i++) {
            console.log(`id: ${data[i].id} || Product Name: ${data[i].product_name} || Price: ${data[i].price}\n`)
        }

        inquirer
            .prompt([
                {
                    message: "Which item id would you like to purchase?",
                    name: "purchase"
                },
                {
                    message: "How many would you like to buy?",
                    name: "quantity"
                }
            ]).then(function (answer) {
                var chosenId = parseInt(answer.purchase);
                var chosenStock = parseInt(data[((answer.purchase) - 1)].stock_quantity);
                var chosenProduct = data[((answer.purchase) - 1)].product_name;
                var chosenQuantity = parseInt(answer.quantity);
                var total = chosenQuantity * parseInt(data[((answer.purchase) - 1)].price);

                if (chosenQuantity > chosenStock) {
                    console.log(`We don't have enough in stock. Order less than ${chosenStock}`)
                    customer();
                } else {
                    console.log(`You want ${chosenQuantity} of ${chosenProduct}`)

                    console.log(`your total comes to $${total}`);

                    console.log("------------------------------------------")

                    connection.query("UPDATE products SET stock_quantity = stock_quantity - " + chosenQuantity + " WHERE id = ?", chosenId, function (err, data) {
                        if (err) throw err;

                        viewAll();
                    })


                }


            })

    })
}

function manager() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to do?",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
                name: "managerQuestion"
            }
        ]).then(function (answer) {

            switch (answer.managerQuestion) {
                case ("View Products for Sale"):
                    console.log(`You want to see what's for sale`);
                    break;
                case ("View Low Inventory"):
                    console.log(`You want to see what's low in inventory`);
                    break;
                case ("Add to Inventory"):
                    console.log(`You want to add to inventory`);
                    break;
                case ("Add New Product"):
                    console.log(`You want to add a new product`);
                    break;
                case ("Exit"):
                    start();
                    break;
                default:
                    start();

            }
        });
}

function supervisor() {
    console.log(`You chose to be the supervisor`);
    start();
}

function exit() {
    connection.end();
}

function viewAll() {
    connection.query("SELECT * FROM products", function (err, data) {
        for (var i = 0; i < data.length; i++) {
            console.log(`id: ${data[i].id} || Product Name: ${data[i].product_name} || Department Name: ${data[i].department_name} || Price: ${data[i].price} || Stock: ${data[i].stock_quantity}\n`)
        }
    })
}