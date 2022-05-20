const getUserByEmail = function(email, database) {
  let user; 
  for (let randomIDs in database) {
    if (email === database[randomIDs].email) {
    user = database[randomIDs].id
    return user
  }
 }
 return undefined
};

module.exports = { getUserByEmail };

