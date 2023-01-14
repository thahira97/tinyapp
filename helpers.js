//// Function to get the email-id
const getUserByEmail = function (email, userDatabase) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return user;
    }
  }
  return undefined;
};
module.exports = getUserByEmail;
