const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const userId = getUserByEmail("user@example.com", testUsers);
    const expectedUserId = "userRandomID";
    assert.equal(userId, expectedUserId);
  });
});
describe('getUserByEmail', function() {
  it('should return null', function() {
    const userId = getUserByEmail("mydude@example.com", testUsers);
    const expectedUserId = undefined;
    assert.equal(userId, expectedUserId);
  });
});