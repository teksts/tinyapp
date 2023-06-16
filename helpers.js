// Retrieve a user object given a user's email and an object of user objects
const getUserByEmail = (email, database) => {
  for (const userId in database) {
    const existingEmail = database[userId]["email"];
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
  return urlsForThisUser;
};

const getTimestamp = (date) => {
  const currentTime = date.toJSON();
  const timestamp = `${currentTime.slice(0, 10)} ${currentTime.slice(12, 22)}`;
  return timestamp;
};

// Generate the current date in Year-Month-Day format
const makeYearMonthDayDate = (date) => {
  let currentDate = date.toJSON().slice(0, 10);
  return currentDate;

};

// Generate a random six character ID for new users and link aliases
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser, getTimestamp, makeYearMonthDayDate };