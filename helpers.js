const bcrypt = require('bcryptjs');

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
  return undefined;
};

const checkPassword = (id, password, userdb) => {
  return bcrypt.compareSync(password, userdb[id].password);
};

const getEmailFromId = (user_id, userdb) => {
  return (userdb[user_id]) ? userdb[user_id].email : null;
};

const getUrlsForUserId = (user, urlDatabase) => {
  const urls = [];
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === user) {
      urls.push({shortURL: shortUrl, longURL: urlDatabase[shortUrl].longURL});
    }
  }
  return urls;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  checkPassword,
  getEmailFromId,
  getUrlsForUserId
};