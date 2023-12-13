module.exports = function(app, shopData) {
    const { check, validationResult } = require('express-validator');
    const redirectLogin = (req, res, next) => { 
        if (!req.session.userId ) {
            res.redirect('./login') 
        } else { 
            next (); 
        }
    }

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });
    app.get('/search',function(req,res){
        res.render("search.ejs", shopData);
    });

    app.get('/search-result', function (req, res) {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);
        let sqlquery = "SELECT * FROM cards WHERE CardName LIKE '%" + req.query.keyword + "%' OR CardColour LIKE '%" + req.query.keyword + "%';";  // query database to get all the cards
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableCards:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });        
    });

    app.get('/list', function (req, res) {
        let sqlquery = "SELECT * FROM cards"; 
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableCards:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });
    });   

    app.get('/addcollection', redirectLogin, function (req, res) {
        res.render('addcollection.ejs', shopData);
     });
 
    app.post('/cardadded', function (req,res) {
        //Fetch the UserID based on username (req.session.userId)
        let getUserIDQuery = "SELECT id FROM UserDetails WHERE username LIKE '%" + req.session.userId + "%'";
        const UserName = req.session.userId;

        console.log("Query:", getUserIDQuery);
        console.log("Parameters:", [UserName]);
        db.query(getUserIDQuery, [UserName], (err, userresult) =>{
            if (err) {
                return console.error(err.message);
            }
    
            if (userresult.length === 0) {
                // User not found, handle accordingly (e.g., send an error response)
                return res.send('User not registered.');
            }
        const userID = userresult[0].id;
        console.log("User ID:", userID);

        //Fetch the CardID based on all provided card details
        let getCardIDQuery = "SELECT id FROM cards WHERE CardName LIKE '%" + req.body.name + "%'";
        let cardName = '%' + req.body.name + '%';

        console.log("Query:", getCardIDQuery);
        console.log("Parameters:", [cardName]);
        db.query(getCardIDQuery, [cardName], (err, cardresult) => {
            if (err) {
                return console.error(err.message);
            }
    
            if (cardresult.length === 0) {
                // Card not found, handle accordingly (e.g., send an error response)
                return res.send('Card not found in the database.');
            }
    
            const cardID = cardresult[0].id;
            console.log("Card ID:", cardID);

            // Insert the UserID and CardID into the collection table
            let insertQuery = "INSERT INTO collection (UserID, CardID) VALUES (?, ?)";
            let newRecord = [userID, cardID];
            db.query(insertQuery, newRecord, (err, result) => {
                if (err) {
                    console.error(err.message);
                    return res.send('Error adding to collection. Please try again.');
                 }
            res.send(`${req.body.name} is added to your collection database.`);
            });
        });
        });
    });







    app.get('/personal', redirectLogin, function (req, res) {
        //Fetch the UserID based on username (req.session.userId)
        let getUserIDQuery = "SELECT id FROM UserDetails WHERE username LIKE '%" + req.session.userId + "%'";
        const UserName = req.session.userId;

        console.log("Query:", getUserIDQuery);
        console.log("Parameters:", [UserName]);
        db.query(getUserIDQuery, [UserName], (err, userresult) =>{
            if (err) {
                return console.error(err.message);
            }
    
            if (userresult.length === 0) {
                // User not found, handle accordingly (e.g., send an error response)
                return res.send('User not registered.');
            }
            const userID = userresult[0].id;
            console.log("User ID:", userID);

            // Fetch all card IDs related to the user from the collection database
            let getCardIDsQuery = "SELECT CardID FROM collection WHERE UserID LIKE '%" + userID + "%'";
            db.query(getCardIDsQuery, [userID], (err, result) =>{
                if(err){
                    console.error(err.message);
                    return res.send('Error fetching card IDs. Please try again.');
                }
                const cardIDs = result.map(row => row.CardID);


                let sqlquery = "SELECT * FROM cards WHERE id LIKE '%"+cardIDs+"%'"; 
                db.query(sqlquery, (err, result) => {
                    if (err) {
                        res.redirect('./'); 
                    }
                let newData = Object.assign({}, shopData, {availableCards:result});
                console.log(newData)
                res.render("personal.ejs", newData)
                });
            });
        });
    });   

















    
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);
    });     
    app.post('/registered', function (req, res) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;
        // Hash the password
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) { 
            if (err) {
                console.error('Error hashing password:', err.message);
                return res.status(500).send('Internal Server Error');
            }

            // Store hashed password and user details in your database
            const sqlquery = "INSERT INTO UserDetails (username, hashedPassword, firstname, lastname, email) VALUES (?,?,?,?,?)";
            const newrecord = [req.body.username, hashedPassword, req.body.first, req.body.last, req.body.email];

            db.query(sqlquery, newrecord, (dbErr, result) => {
                if (dbErr) {
                    console.error('Error saving data to the database:', dbErr.message);
                    return res.status(500).send('Internal Server Error');
                }

                // Respond to the client with a success message
                result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered! We will send an email to you at ' + req.body.email ;
                //result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
                res.send(result);
            });
        });
    });

    app.get('/listusers', redirectLogin, function (req,res){
        let sqlquery = "SELECT * FROM UserDetails"; // query database to get all the user data
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableUsers:result});
            console.log(newData)
            res.render("listusers.ejs", newData)
         });
    });

    app.get('/login', function (req, res) {
        res.render('login.ejs', shopData);
     });
    app.post('/loggedin', function (req, res) {
        const bcrypt = require('bcrypt');
        const username = req.body.username;
        const password = req.body.password;

        // Select the hashed password for the user from the database
        let sqlquery = "SELECT hashedPassword FROM UserDetails WHERE username = ?";
        db.query(sqlquery, [username], (err, result) => {
            if (err) {
                console.error('Error retrieving hashed password from the database:', err.message);
                // Handle the error
                return res.status(500).send('Internal Server Error');
            }

            if (result.length === 0) {
                // User not found
                return res.send('Login failed: User not found.');
            }

            const hashedPasswordFromDB = result[0].hashedPassword;

            // Compare the password supplied with the password in the database
            bcrypt.compare(password, hashedPasswordFromDB, function(err, passwordMatch) {
                if (err) {
                    console.error('Error comparing passwords:', err.message);
                    // Handle the error
                    return res.status(500).send('Internal Server Error');
                }

                if (passwordMatch) {
                    // Save user session here, when login is successful
                    req.session.userId = req.body.username;
                    // Passwords match, login successful
                    return res.send('Login successful! Welcome, ' + username + '. <a href='+'./'+'>Home</a>');
                } else {
                    // Passwords do not match
                    return res.send('Login failed: Incorrect password.');
                }
            });
        });
    });

    app.get('/logout', redirectLogin, (req,res) => { req.session.destroy(err => {
        if (err) {
            return res.redirect('./') }
            res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        });
    });

    app.get('/deleteuser', function (req, res) {
        res.render('deleteuser.ejs', shopData);     
    });
    app.post('/UserDeleted', function (req,res) {
        //searching in the database
        let query = "DELETE FROM UserDetails WHERE username LIKE '%" + req.body.keyword + "%'";
        // execute delete query
        db.query(query, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }else {
                res.send(req.body.keyword + 'is now deleted. <a href='+'./'+'>Home</a>');
            }
        });                                                                 
    });
}
