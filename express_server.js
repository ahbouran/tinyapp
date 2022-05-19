const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080;

app.use(morgan('dev'));

app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser')
app.use(cookieParser());

function generateRandomString() {
  let randomString = [];
  const characters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  
  for (let j = 0; j < 60; j++) {
    randomString.push(characters[Math.floor(Math.random() * 60)]);
  }
  
  randomString = randomString.slice(0, 6);
  randomString = randomString.join('');
  return randomString;
};


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const user = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID' : {
    id: 'userRandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_index', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls')
})

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  //console.log('urlDatabase: ', urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { 
    username: req.cookies['username']
  };
  res.render('urls_new', templateVars);
});


app.get('/urls/:shortURL', (req, res) => { //colon means req.params will contain a key called the rest of the text
  const shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL],
    username: req.cookies['username']
  };
  res.render('urls_show', templateVars)
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.updatedURL
  res.redirect('/urls');
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/login', (req, res) => {
  const value = req.body.username;
  res.cookie('username', value);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.cookie('username', null);
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  }
  res.render('urls_registration', templateVars)
})

app.post('/register', (req, res) => {
  const newUserID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const word = req.body.password;
  user[newUserID] = {
    id: newUserID,
    email,
    password
  }
  res.cookie('user_id', newUserID)
  res.redirect('/urls')
  res.render('urls_registration')
});


app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('*', (req, res) => {
  res.status(404).send('You shall not pass.')
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});