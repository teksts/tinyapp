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

const urlsForUser = (id, database) => {
  const urlsForThisUser = Object.keys(database)
  // filter for URLs created by this user
    .filter(key => database[key]["userId"] === id)
    /* generate a new object of objects with the following structure:
    { linkId: {
        longURL: http://example.com,
        userID: xmg31p
      }
    } */
    .reduce((objectOfLinks, key) => {
      return Object.assign(objectOfLinks, { [key]: database[key] });
    }, {});
  console.log(urlsForThisUser);
  return urlsForThisUser;
};

const getTimestamp = () => {
  const currentTime = new Date();
  const timestamp = currentTime.getTime();
  return timestamp;
};

// Generate a random six character ID for new users and link aliases
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser, getTimestamp };