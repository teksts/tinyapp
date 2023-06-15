const { object } = require("joi");
const express = require("express");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString } = require("./helpers");
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

const urlsForUser = (id) => {
  const urlsForThisUser = Object.keys(urlDatabase)
    .filter(key => urlDatabase[key]["userId"] === id)
    .reduce((cur, key) => {
      return Object.assign(cur, { [key]: urlDatabase[key] });
    }, {});
  return urlsForThisUser;
};


app.set("view engine", "ejs");
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));

app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const user = users[userId];
  if (userId) {
    const urlsForThisUser = urlsForUser(userId);
    const templateVars = {
      user,
      urls: urlsForThisUser
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send('You must be logged in to view your shortened URLs');
  }
});

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


app.post("/urls", (req, res) => {
  const userId = req.session["user_id"];
  if (userId) {
    const longURL = req.body["longURL"];
    const id = generateRandomString();
    urlDatabase[id] = {
      longURL,
      userId
    };
    res.redirect(`/urls/${id}`);
  } else {
    res.status(401).send("You are not logged in. Please log in to shorten a new URL");
  }
});

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

app.post("/logout", (req, res) => {
  res.clearCookie("session");
  // res.status(200).send("Successfully logged out");
  res.redirect('/login');
});

//When does this get called again?
app.post("/urls/:id", (req, res) => {
  const userId = req.session["user_id"];
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.status(404).send("That alias does not exist");
  } else if (!userId) {
    res.status(401).send("You are not logged in. Please log in to update a URL alias");
  } else if (urlDatabase[id]["userId"] !== userId) {
    res.status(401).send("That alias belongs to another user");
  } else {
    const newLongURL = req.body["longURL"];
    urlDatabase[id]["longURL"] = newLongURL;
    res.redirect('/urls');
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session["user_id"];
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.status(404).send("That alias does not exist");
  } else if (!userId) {
    res.status(401).send("You are not logged in. Please log in to update a URL alias");
  } else if (urlDatabase[id]["userId"] !== userId) {
    res.status(401).send("That alias belongs to another user");
  } else {
    delete urlDatabase[id];
    res.redirect("/urls");
  }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    const userId = req.session["user_id"];
    const user = users[userId];
    if (urlDatabase[id]["userId"] === userId) {
      const longURL = urlDatabase[id]["longURL"];
      const templateVars = { user, id, longURL };
      res.render("urls_show", templateVars);
    } else {
      res.status(401).send("That alias belongs to another user");
    }
  } else {
    res.status(404).send("Oops! No URL with that alias has been created :(");
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    const longURL = urlDatabase[id]["longURL"];
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
