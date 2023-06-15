// Retrieve a user object given a user's email and an object of user objects
const getUserByEmail = (email, database) => {
  for (const user in database) {
    const existingEmail = database[user]["email"];
    if (email === existingEmail) {
      return database[user];
    }
  }
  return null;
};

// Generate a random six character ID for new users and link aliases
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = { getUserByEmail, generateRandomString };