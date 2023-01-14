const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

///Function to generate random id
const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
  lolkhd7: {
    longURL: "http://www.ik.com",
    userID: "nmwcb2",
  },
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  nmwcb2: {
    id: "nmwcb2",
    email: "thameemsh.ca@gmail.com",
    password: bcrypt.hashSync("1234",10),
  },
};

////// Function to get the email-id
const getUserByEmail = function (email) {
  for (let id in users) {
    // console.log(id)
    if (users[id].email === email ) {
      return users[id];
    }
  }
};
////Function to compare the userid
const urlsForUser = function (urlDatabase, id) {
  let userURL = {};
  // let urlDatabaseKeys = Object.keys(urlDatabase)
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userURL[key] = urlDatabase[key];
    }
  }
  return userURL;
};

/// Get Requests
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if (users[req.cookies.user_id]) {
    const templateVars = {
      user: users[req.cookies.user_id],
      urls: urlsForUser(urlDatabase, req.cookies.user_id),
    };

    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

// GET Request to create longURL
app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

////Get Request to read the Particular id
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (
    Object.keys(urlDatabase).includes(id) &&
    req.cookies.user_id === urlDatabase[id].userID
  ) {
    const templateVars = {
      user: users[req.cookies.user_id],
      id: id,
      longURL: urlDatabase[id].longURL,
      userID: urlDatabase[id].userID,
    };
    res.render("urls_show", templateVars);
  } else {
    res
      .status(400)
      .send("You cannot access the page or You do not own the URL");
  }
});

/// POST Request for the submit form to get the short url
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL: longURL,
    userID: req.cookies.user_id,
  };
  // console.log(req.body)
  res.redirect(`urls/${id}`);
});

// Redirecting the shortURL link to longURL page
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
  res.status(404).send("ID doesn't exist");
});

///To delete the URL resource
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (users[req.cookies.user_id]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
  res.status(401).send("Oops! You cannot Access the page");
});

///To Add the Updated Resource
app.post("/urls/:id", (req, res) => {
  if (users[req.cookies.user_id]) {
    const id = req.params.id;
    // console.log(req.params.id)
    const longURL = req.body.longURL;
    // console.log(longURL);
    urlDatabase[id].longURL = longURL;
    res.redirect(`/urls/${id}`);
  } else {
    res.status(401).send("Oops! You cannot Access the page");
  }
});

// /To handle the logins
app.get("/login", (req, res) => {
  if (!req.cookies.user_id) {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("login", templateVars);
  }
  res.redirect("/urls");
});

// /To handle the LogOuts and clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

///To Register in the app
app.get("/register", (req, res) => {
  if (!req.cookies.user_id) {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("urls_register", templateVars);
  }
  res.redirect("/urls");
});

///To handle the registration page
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  

  if (userEmail.length === 0 || userPassword.length === 0) {
    return res.status(400).send("Invalid Email or Invalid Password");
  }

  if (getUserByEmail(req.body.email)) {
    res.status(400).send("Email already exists");
    return;
  }
  const user_id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  users[user_id] = {
    id: user_id,
    email: userEmail,
    password: hashedPassword,
  };
  console.log(users[user_id]);
  // console.log(users);
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

/////To handle the login registration page
app.post("/login", (req, res) => {
  //-----------------------------
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userinfo = getUserByEmail(userEmail);
  
  if (!userinfo) {
    res.status(400).send("User cannot be found");
  } else {
    if (!bcrypt.compareSync(userPassword, userinfo.password) ) {

      res.status(400).send("Wrong Password or Invalid email-id");
    }
    res.cookie("user_id", userinfo.id);
    res.redirect("/urls");
    console.log(userinfo)
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
