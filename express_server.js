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
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
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
  const templateVars = { username: req.cookies['username'] }
  // const templateVars = { id: req.cookies[id] };
  res.render("urls_new", templateVars);
  // res.render("urls_new");
});

// new URL created
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username'],
    // id: req.cookies[id]
  };
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
  const templateVars = { username: req.cookies['username'] };
  if (longURL === undefined) {
    res.render('urls_notfound', templateVars);
  }
  res.redirect(longURL);
});

// login
app.post('/login', (req, res) => {
  if (checkPassword(req.body.password)) {
    res.cookie("username", req.body.username);  
    res.redirect('/urls');
  }
})

// login page
app.get('/login', (req, res) => {
  res.render('login');
})

// logout
app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
})

// register page
app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render('register', templateVars);
});

//register a new user
app.post('/register', (req, res) => {
  if (req.body.email === "") {
    return res.status(400).send({
      message: 'Please enter an email'
    });
  } else if (req.body.password === "") {
    return res.status(400).send({
      message: 'Please enter a password'
    });
  }
  let id = findUserByEmail(req.body.email);
  if (!id) { //ok
    newId = generateRandomString();
    users[newId] = { id: newId, email: req.body.email, password: req.body.password }
    console.log(users);
  } else {
    //check password
    if (!checkPassword(req.body.password)) {
      console.log('Wrong password');
      return res.status(400).send({
        message: 'Incorrect password'
      });  
    }
    res.cookie("username", req.body.email);
  }
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
  for (let id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
  return null;
};

const checkPassword = (id, password) => {
  if (users[id].password === password) {
    return true;
  }
  return false;
};