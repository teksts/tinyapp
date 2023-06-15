// Retrieve a user object given a user's email and an object of user objects
const getUserByEmail = (email, database) => {
  for (const userId in database) {
    const existingEmail = database[userId]["email"];
    console.log(email, existingEmail);
    if (email === existingEmail) {
      return userId;
    }
  }
  return undefined;
};

// Generate a random six character ID for new users and link aliases
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = { getUserByEmail, generateRandomString };