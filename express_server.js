const { object } = require("joi");
const express = require("express");
const methodOverride = require("method-override");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');

const urlDatabase = {
  "b2xVn2": {
    "longURL": "http://www.lighthouselabs.ca",
    "userId": "bbbbbb"
  },
  "9sm5xK": {
    "longURL": "http://www.google.com",
    "userId": "bbbbbb"
  }
};

const users = {
};

app.set("view engine", "ejs");
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));



///////////////////////////////
//          GET
///////////////////////////////

// Dummy root landing site
app.get("/", (req, res) => {
  res.send("Hello!");
});

// View all of a user's shortened URLs
app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const user = users[userId];
  if (userId) {
    const urls = urlsForUser(userId, urlDatabase);
    const templateVars = {
      user,
      urls
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send('You must be logged in to view your shortened URLs');
  }
});

// Interface for creating a new shortened URL
app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"];
  const user = users[userId];
  if (userId) {
    const templateVars = {
      user
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// View a specific shortened URL
app.get("/urls/:id", (req, res) => {
  const urlId = req.params.id;
  if (urlDatabase[urlId]) {
    const userId = req.session["user_id"];
    const user = users[userId];
    if (urlDatabase[urlId]["userId"] === userId) {
      const longURL = urlDatabase[urlId]["longURL"];
      const templateVars = { user, urlId, longURL };
      res.render("urls_show", templateVars);
    } else {
      res.status(401).send("That alias belongs to another user");
    }
  } else {
    res.status(404).send("Oops! No URL with that alias has been created :(");
  }
});

// Page for registering an account
app.get("/register", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    const user = null;
    const templateVars = {
      user
    };
    res.render("register", templateVars);
  }
});

// Pag for logging in to an account
app.get("/login", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    const user = null;
    const templateVars = {
      user
    };
    res.render("login", templateVars);
  }
});


///////////////////////////////
//          POST
///////////////////////////////

// Create a new shortened URL and storing it in the database
app.post("/urls", (req, res) => {
  const userId = req.session["user_id"];
  if (userId) {
    const longURL = req.body["longURL"];
    const newId = generateRandomString();
    urlDatabase[newId] = {
      longURL,
      userId
    };
    res.redirect(`/urls/${newId}`);
  } else {
    res.status(401).send("You are not logged in. Please log in to shorten a new URL");
  }
});

// Register a new account and store the new user in user database
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body["email"];
  const password = bcrypt.hashSync(req.body["password"], 10);
  if (!email || !password) {
    res.status(400).send('An email or password was missing from your submission, please try again.');
  } else if (getUserByEmail(email, users)) {
    console.log('duplicated!');
    res.status(400).send('That account already exists');
  } else {
    users[id] = {
      id,
      email,
      password
    };
    req.session["user_id"] = id;
  }
  console.log(users);
  res.redirect('/urls');
});

// Log in to an existing account
app.post("/login", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  if (!email || !password) {
    res.status(400).send('An email or password was missing from your submission, please try again.');
  }
  const userId = getUserByEmail(email, users);
  if (userId) {
    if (bcrypt.compareSync(password, users[userId]["password"])) {
      req.session["user_id"] = userId;
      res.redirect('/urls');
    } else {
      console.log(password, userId);
      res.status(403).send('Incorrect password.');
    }
  } else {
    console.log(userId);
    res.status(403).send('No account was found with that email address');
  }
});

// Log out of an account
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect('/login');
});

// Update the URL redirected to by an existing alias
app.put("/urls/:id", (req, res) => {
  const userId = req.session["user_id"];
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.status(404).send("That alias does not exist");
  } else if (!userId) {
    res.status(401).send("You are not logged in, please log in to update a URL alias");
  } else if (urlDatabase[id]["userId"] !== userId) {
    res.status(401).send("That alias belongs to another user");
  } else {
    const newLongURL = req.body["longURL"];
    urlDatabase[id]["longURL"] = newLongURL;
    res.redirect('/urls');
  }
});

// Delete a shortened URL
app.get("/urls/:id", (req, res) => {
  const userId = req.session["user_id"];
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.status(404).send("That alias does not exist");
  } else if (!userId) {
    res.status(401).send("You are not logged in, please log in to update a URL alias");
  } else if (urlDatabase[id]["userId"] !== userId) {
    res.status(401).send("That alias belongs to another user");
  } else {
    delete urlDatabase[id];
    res.redirect("/urls");
  }
});

// Redirect to a URL using its corresponding alias
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    const longURL = urlDatabase[id]["longURL"];
    res.redirect(longURL);
  } else {
    res.status(404).send("Oops! No URL with that alias has been created :(");
  }
});

// Cookie reset route for easy testing
app.delete("/clear-cookies", (req, res) => {
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.send("Cookies cleared!");
});

///////////////////////////////
//        `LISTEN
///////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
