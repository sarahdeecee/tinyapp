const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
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
}

// set homepage to /urls/new
app.get("/", (req, res) => {
  (req.cookies['user_id']) ? res.redirect('/urls/new') : res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// display URLs //ok
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

// Create new shortURL, redirect to shortURL //ok
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

// new URL created //ok
app.get("/urls/:shortURL", (req, res) => {
  (req.cookies['user_id']) ? null : res.redirect('/login');
  shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user_id: req.cookies['user_id'],
    email: getEmailFromId(req.cookies['user_id'])
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

// update URL //ok
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  console.log(urlDatabase[shortURL]);
  res.redirect('/urls');
});

// delete shortURL //ok
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// redirect to shortURL
app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { user_id: req.cookies['user_id'], email: getEmailFromId(req.cookies['user_id']) };
  if (longURL === undefined) {
    res.render('urls_notfound', templateVars);
  }
  res.redirect(longURL);
});

// login
app.post('/login', (req, res) => {
  if (req.body.email === "") {
    return res.status(400).send('Please enter an email');
  } else if (req.body.password === "") {
    return res.status(400).send('Please enter a password');
  }
  let id = findUserByEmail(req.body.email);
  if (!id) {
    return res.status(403).send('Email not found. Please register for an account.');
  } else if (!checkPassword(id, req.body.password)) {
    return res.status(403).send('Password incorrect.');
  }
  res.cookie('user_id', id);
  res.redirect('/urls');
})

// login page
app.get('/login', (req, res) => {
  const templateVars = { user_id: req.cookies['user_id'], email: getEmailFromId(req.cookies['user_id']) };
  res.render('login', templateVars);
})

// logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

// register page
app.get("/register", (req, res) => {
  const templateVars = { user_id: req.cookies['user_id'] };
  res.render('register', templateVars);
});

//register a new user
app.post('/register', (req, res) => {
  if (req.body.email === "") {
    return res.status(400).send('Please enter an email');
  } else if (req.body.password === "") {
    return res.status(400).send('Please enter a password');
  }
  let id = findUserByEmail(req.body.email);
  if (!id) { //new user
    newId = generateRandomString();
    users[newId] = { id: newId, email: req.body.email, password: req.body.password }
    res.cookie("user_id", newId);
  } else { //
    return res.status(403).send('Account exists. Please login.');
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