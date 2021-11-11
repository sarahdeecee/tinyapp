const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'ds8ad4'
  },
  s9m5xK: {
    longURL: "http://www.google.com",
    userID: 'ds8ad4'
  }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "123"
  },
  "ds8ad4": {
    id: "ds8ad4",
    email: "user2@example.com",
    password: "qwe"
  }
};

// set homepage to /urls/new
app.get("/", (req, res) => {
  (req.cookies['user_id']) ? res.redirect('/urls/new') : res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// display URLs
app.get("/urls", (req, res) => {
  (req.cookies['user_id']) ? null : res.redirect('/login');
  const templateVars = {
    urls: getUrlsForUserId(req.cookies['user_id']),
    user_id: req.cookies['user_id'],
    email: getEmailFromId(req.cookies['user_id']) };
  res.render("urls_index", templateVars);
});

// URL database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
         
// Create new shortURL, redirect to shortURL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies['user_id'] };
  res.redirect(`/urls/${shortURL}`);
});

// Create New URL page
app.get("/urls/new", (req, res) => {
  (req.cookies['user_id']) ? null : res.redirect('/login');
  const templateVars = { user_id: req.cookies['user_id'], email: getEmailFromId(req.cookies['user_id']) };
  res.render("urls_new", templateVars);
});

// new URL created
app.get("/urls/:shortURL", (req, res) => {
  (req.cookies['user_id']) ? null : res.redirect('/login');
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user_id: req.cookies['user_id'],
    email: getEmailFromId(req.cookies['user_id'])
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

// update URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  (req.cookies['user_id'] === urlDatabase[shortURL].userID) ? null : res.render('noaccess');
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls');
});

// delete shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.cookies['user_id'] || req.cookies['user_id'] !== urlDatabase[shortURL].userID) {
    res.render('noaccess');
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// redirect to shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    const templateVars = { user_id: null, email: null};
    res.render('urls_notfound', templateVars);
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// login
app.post('/login', (req, res) => {
  const templateVars = { user_id:null, email: null, message: null};
  if (req.body.email === "") {
    templateVars.message = "Please enter an email address.";
    res.status(400);
    res.render('error', templateVars);
  } else if (req.body.password === "") {
    templateVars.message = "Please enter a password.";
    res.status(400);
    res.render('error', templateVars);
  }
  let id = findUserByEmail(req.body.email);
  if (!id) { //not found
    templateVars.message = "Email not found. Please register for an account.";
    res.status(400);
    res.render('error', templateVars);
  } else if (!checkPassword(id, req.body.password)) {
    templateVars.message = "Password is incorrect. Please try again.";
    res.status(401);
    res.render('error', templateVars);
  }
  res.cookie('user_id', id);
  res.redirect('/urls');
});

// login page
app.get('/login', (req, res) => {
  const templateVars = { user_id: req.cookies['user_id'], email: getEmailFromId(req.cookies['user_id']) };
  res.render('login', templateVars);
});

// logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// register page
app.get("/register", (req, res) => {
  const templateVars = { user_id: req.cookies['user_id'] };
  res.render('register', templateVars);
});

//register a new user
app.post('/register', (req, res) => {
  const templateVars = { user_id:null, email: null, message: null};
  if (req.body.email === "") {
    templateVars.message = "Please enter an email address.";
    res.status(400);
    res.render('error', templateVars);
  } else if (req.body.password === "") {
    templateVars.message = "Please enter a password.";
    res.status(400);
    res.render('error', templateVars);
  }
  let id = findUserByEmail(req.body.email);
  if (!id) { //new user
    const newId = generateRandomString();
    users[newId] = { id: newId, email: req.body.email, password: req.body.password };
    res.cookie("user_id", newId);
  } else { //email exists
    templateVars.message = 'Account already exists. Please login instead.';
    res.status(400);
    res.render('error', templateVars);
  }
  res.redirect('/urls');
});

const generateRandomString = () => {
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
};

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

const getEmailFromId = user_id => {
  return (users[user_id]) ? users[user_id].email : null;
};

const getUrlsForUserId = user => {
  const urls = [];
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === user) {
      urls.push({shortURL: shortUrl, longURL: urlDatabase[shortUrl].longURL});
    }
  }
  return urls;
};