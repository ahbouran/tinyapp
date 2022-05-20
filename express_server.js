//////////////Requirements/////////////////////////
const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const { redirect } = require("express/lib/response");

///////////////Template////////////////////////////////////////

app.set("view engine", "ejs");
/////////////Middleware///////////////////////////////////////

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//////////////Functions///////////////////////////////////////

function generateRandomString() {
  let randomString = [];
  const characters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

  for (let j = 0; j < 60; j++) {
    randomString.push(characters[Math.floor(Math.random() * 60)]);
  }

  randomString = randomString.slice(0, 6);
  randomString = randomString.join("");
  return randomString;
}


/////////////////////Global Data Objects/////////////////////////////////////////////////////////////////

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "aJ48lW",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

/////////////////////////////ROUTES////////////////////////ROUTES/////////////////ROUTES//////////////////////////////////////

////////"Home Page Greeting"/////////
app.get("/", (req, res) => {
  res.send("Hello!"); ////Respond with hello when user solely types in / after localhost http://localhost:8080/
});

////////////////////////////////The Fray/////////////////////////////////////////

app.get("/urls", (req, res) => {
  ///Passes url data to urls_index template
  if (req.cookies.user_id === undefined || req.cookies.user_id === null) {
    res.send("<html><body>Please register or login first to access URLS</body></html>\n");
    return
  }

  const loggedInId = req.cookies.user_id;
  
 console.log('users:', users)
  let userURLs = {};

  for (let smallURLS in urlDatabase) {
    if (loggedInId === urlDatabase[smallURLS].userID) {
      userURLs[smallURLS] = urlDatabase[smallURLS];
    }
  }

  const templateVars = {
    urls: userURLs,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_id;

  if (urlDatabase[shortURL].userID === userID) {
    delete urlDatabase[shortURL];
  res.redirect("/urls");
  } else {
    res.status(403).send("You don't have authorization.");
  }

  
});

app.post("/urls", (req, res) => {
  if (req.cookies.user_id === undefined || req.cookies.user_id === null) {
    return res.status(403).send("Please register and/or login first.");
  }
  const shortURL = generateRandomString();
  const userID = req.cookies.user_id;
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL,
    userID
  };

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id === undefined || req.cookies.user_id === null) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies.user_id === undefined || req.cookies.user_id === null) {
    return res.redirect("/login");
  }
  const userID = req.cookies.user_id
  //colon means it's a route parameter, value in this part is available in req.params object
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === userID) {
    const templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: users[req.cookies["user_id"]], ////Again, sends data from short url to urls_show.ejs
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("You don't have authorization.");
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.updatedURL;
  const userID = req.cookies?.user_id; 
  
  if (urlDatabase[id].userID === userID) {
    urlDatabase[id] = {
      longURL,
      userID
    };
    res.redirect("/urls");
  } else {
    res.status(403).send("You don't have authorization.");
  }  
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]?.longURL; 
  if (longURL) {
    res.redirect(longURL)
  } else {
    res.status(403).send("Short URL does not exist.")
  }
});

///////////////////////////Login and Logout//////////////////////////////////////

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;


  for (let user in users) {
    if (email === users[user].email && bcrypt.compareSync(password, users[user].password)) {
      res.cookie("user_id", users[user].id);
      return res.redirect("/urls");
    }
  }
  res.status(403).send("Incorrect Password.");
});

app.post("/logout", (req, res) => {
  res.cookie("user_id", null);
  res.clearCookie("user_id");
  res.redirect("/urls");
});

///////////////////////////Register New Users///////////////////////////////////////

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Please put in a valid email.");
  }

  const newUserID = generateRandomString();
  const email = req.body.email;

  const compareObjectKeys = function () {
    for (let user in users) {
      if (req.body.email === users[user].email) {
        return res.status(400).send("This email is already in use.");
      }
    }
  };
  compareObjectKeys();
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt)

  users[newUserID] = {
    id: newUserID,
    email,
    password: hash
  };

  res.cookie("user_id", newUserID);
  res.redirect("/urls");
});

/////////////Catch any errors//////////////////////////////////////////////////////////////////////////

app.get("*", (req, res) => {
  res.status(404).send("404. Try something else.");
});

/////////////////Server listening in////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
