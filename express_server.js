const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// set homepage to /urls/new
app.get("/", (req, res) => {
  res.redirect('/urls/new');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// display URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, id: req.cookies[id] };
  res.render("urls_index", templateVars);
});

// URL database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Create new shortURL, redirect to shortURL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Create New URL page
app.get("/urls/new", (req, res) => {
  const templateVars = { id: req.cookies[id] };
  res.render("urls_new", templateVars);
});

// new URL created
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    id: req.cookies[id] };
  res.render("urls_show", templateVars);
});

// update URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

// delete shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// redirect to shortURL
app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { id: req.cookies[id] };
  if (longURL === undefined) {
    res.render('urls_notfound', templateVars);
  }
  res.redirect(longURL);
});

// login
app.post('/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
})

// logout
app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
})

//register page
app.get("/register", (req, res) => {
  const templateVars = { id: req.cookies[id] };
  res.render('register', templateVars);
});

//register a new user
app.post('/register', (req, res) => {
  newId = generateRandomString();
  users[newId] = { id: newId, email: req.body.email, password: req.body.password }
  res.cookie(newId);
  res.redirect('/urls');
})

function generateRandomString() {
  let randomStr = "";
  let passLength = 6;
  for (let i = 0; i < passLength; i++) {
    let randomNum = Math.floor(Math.random() * 36) + 48;
    if (randomNum >= 58) {
      randomNum += 7;
    }
    randomStr += String.fromCharCode(randomNum);
  }
  return randomStr.toLowerCase();
}

const findUserByEmail = email => {
  for (let user in users) {
    console.log('key --->', user);
    // if (users[key].email === email) {
    //   return users[key];
    // }
  }
  return null;
}