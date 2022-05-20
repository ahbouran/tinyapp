const { assert } = require('chai');

const { getUserByEmail} = require('../helpers');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },

  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

describe('getUserByEmail', function() {
  it ('should return a user with a valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers)
    const expectedID = "userRandomID";

    assert.equal(user, expectedID, true)
  });

  it ('should return undefined if email does not exist in database', function() {
    const user = getUserByEmail('user3@example.com', testUsers)
    const expectedOutcome = undefined;

    assert.equal(user, expectedOutcome, undefined)
  });
});