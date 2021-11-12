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

module.exports = { findUserByEmail, checkPassword, getUrlsForUserId, getEmailFromId };