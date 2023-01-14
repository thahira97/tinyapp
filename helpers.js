//// Function to get the email-id
const getUserByEmail = function (email, userDatabase) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return user;
    }
  }
  return false;
};

///Function to generate random id
const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};

////Function to compare the userid
const urlsForUser = function (urlDatabase, id) {
  let userURL = {};
  // let urlDatabaseKeys = Object.keys(urlDatabase)
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userURL[key] = urlDatabase[key];
    }
  }
  return userURL;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser};
