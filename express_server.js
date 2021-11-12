const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const users = require("./data/userdb");
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session');

// const {
//   getUserByEmail,
//   checkPassword,
//   getUrlsForUserId,
//   getEmailFromId
// } = require('./helpers/user-helpers');
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["this tinyapp", "is super secure"],
}))

// const cookieCheck = (req, res, next) => {
//   // const { email } = req.cookies;
//   const { email } = req.session;
//   const safeList = ["/", "/login"];
//   const isSafe = safeList.includes(req.path);
//   // Fetch user information based on the value of the cookie
//   const { data, error } = fetchUserInformation(userDB, email);

//   if (error && !isSafe) {
//     console.log(error);
//     return res.redirect("/");
//   }

//   return next();
// };

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

// set homepage to /urls/new
app.get("/", (req, res) => {
  return (req.session.user_id) ? res.redirect('/urls/new') : res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// display URLs
app.get("/urls", (req, res) => {
  (req.session.user_id) ? null : res.redirect('/login');
  const templateVars = {
    urls: getUrlsForUserId(req.session.user_id),
    user_id: req.session.user_id,
    email: getEmailFromId(req.session.user_id)
  };
  return res.render("urls_index", templateVars);
});

// URL database
app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});
         
// Create new shortURL, redirect to shortURL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  if (longURL === "") {
    const templateVars = { user_id: null, email: null, message: null };
    templateVars.message = "Please enter a url to shorten.";
    res.statusCode = 400;
    return res.render('error', templateVars);
  }
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id };
  return res.redirect(`/urls/${shortURL}`);
});

// Create New URL page
app.get("/urls/new", (req, res) => {
  (req.session.user_id) ? null : res.redirect('/login');
  const templateVars = { user_id: req.session.user_id, email: getEmailFromId(req.session.user_id) };
  return res.render("urls_new", templateVars);
});

// new URL created
app.get("/urls/:shortURL", (req, res) => {
  (req.session.user_id) ? null : res.redirect('/login');
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user_id: req.session.user_id,
    email: getEmailFromId(req.session.user_id)
  };
  return res.render("urls_show", templateVars);
});

// update URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  (req.session.user_id === urlDatabase[shortURL].userID) ? null : res.render('noaccess');
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  return res.redirect('/urls');
});

// delete shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.session.user_id || req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.render('noaccess');
  }
  delete urlDatabase[shortURL];
  return res.redirect('/urls');
});

// redirect to shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    const templateVars = { user_id: null, email: null};
    return res.render('urls_notfound', templateVars);
  }
  const longURL = urlDatabase[shortURL].longURL;
  return res.redirect(longURL);
});

// login
app.post('/login', (req, res) => {
  const templateVars = { user_id: null, email: null, message: null};
  if (req.body.email === "") {
    templateVars.message = "Please enter an email address.";
    res.statusCode = 400;
    return res.render('error', templateVars);
  } else if (req.body.password === "") {
    templateVars.message = "Please enter a password.";
    res.statusCode = 400;
    return res.render('error', templateVars);
  }
  let id = getUserByEmail(req.body.email, users);
  if (!id) { //not found
    templateVars.message = "Email not found. Please register for an account.";
    res.statusCode = 400;
    return res.render('error', templateVars);
  } else if (!checkPassword(id, req.body.password)) {
    templateVars.message = "Password is incorrect. Please try again.";
    res.statusCode = 401;
    return res.render('error', templateVars);
  }
  req.session.user_id = id;
  return res.redirect('/urls');
});

// login page
app.get('/login', (req, res) => {
  const templateVars = { user_id: req.session.user_id, email: getEmailFromId(req.session.user_id) };
  return res.render('login', templateVars);
});

// logout
app.post('/logout', (req, res) => {
  req.session = null;
  // res.clearCookie('user_id');
  return res.redirect('/urls');
});

// register page
app.get("/register", (req, res) => {
  const templateVars = { user_id: req.session.user_id };
  res.render('register', templateVars);
});

//register a new user
app.post('/register', (req, res) => {
  const templateVars = { user_id:null, email: null, message: null};
  if (req.body.email === "") {
    templateVars.message = "Please enter an email address.";
    res.statusCode = 400;
    return res.render('error', templateVars);
  } else if (req.body.password === "") {
    templateVars.message = "Please enter a password.";
    res.statusCode = 400;
    return res.render('error', templateVars);
  }
  let id = getUserByEmail(req.body.email, users);
  if (!id) { //new user
    const newId = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    console.log(hashedPassword);
    users[newId] = { id: newId, email: req.body.email, password: hashedPassword };
    req.session.user_id = newId;
  } else { //email exists
    templateVars.message = 'Account already exists. Please login instead.';
    res.statusCode = 400;
    return res.render('error', templateVars);
  }
  return res.redirect('/urls');
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

const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return null;
};

const checkPassword = (id, password) => {
  return bcrypt.compareSync(password, users[id].password);
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