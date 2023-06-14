const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  
};

const getUserByEmail = (email) => {
  for (const user in users) {
    const existingEmail = users[user]["email"];
    if (email === existingEmail) {
      return users[user];
    }
  }
  return null;
};

const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};


app.set("view engine", "ejs");
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {
    user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    const user = null;
    const templateVars = {
      user,
      urls: urlDatabase
    };
    res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    const user = null;
    const templateVars = {
      user,
      urls: urlDatabase
    };
    res.render("login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  if (req.cookies["user_id"]) {
    const templateVars = {
      user
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    const longURL = req.body["longURL"];
    const id = generateRandomString();
    console.log(req.body); // Log the POST request body to the console
    urlDatabase[id] = longURL;
    res.redirect(`/urls/${id}`);
  } else {
    res.status(401).send("You are not logged in. Please log in to shorten a new URL");
  }
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body["email"];
  const password = req.body["password"];
  if (!email || !password) {
    res.status(400).send('An email or password was missing from your submission, please try again.');
  } else if (getUserByEmail(email)) {
    console.log('duplicated!');
    res.status(400).send('That account already exists');
  } else {
    users[id] = {
      id: id,
      email: email,
      password: password
    };
    res.cookie('user_id', id);
  }
  console.log(users);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  if (!email || !password) {
    res.status(400).send('An email or password was missing from your submission, please try again.');
  }
  const user = getUserByEmail(email);
  if (user) {
    if (password === user["password"]) {
      res.cookie("user_id", user["id"]);
      res.redirect('/urls');
    } else {
      console.log(password, user);
      res.status(403).send('Incorrect password.');
    }
  } else {
    res.status(403).send('No account was found with that email address');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  // res.status(200).send("Successfully logged out");
  res.redirect('/login');
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body["longURL"];
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    const longURL = urlDatabase[id];
    const userId = req.cookies["user_id"];
    const user = users[userId];
    const templateVars = { user, id, longURL };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Oops! No URL with that alias has been created :(");
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    const longURL = urlDatabase[id];
    res.redirect(longURL);
  } else {
    res.status(404).send("Oops! No URL with that alias has been created :(");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
