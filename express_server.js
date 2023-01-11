const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
// const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

///Function to generate random Alpha-Numerical id
const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
};
// //// Function to get the email-id
const getUserByEmail = function (email) {
  for (let id in users) {
    console.log(id)
    if (users[id].email === email ){
      return users[id];
    }
  }
}

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

//To add all URLS from URLDatabase
///To save cookie
app.post("/login", (req, res) => {
  // const username = req.body.username;
  // res.cookie("username", username);
  res.redirect("urls/");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// GET Request to create longURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

////Get Request to read the Particular id
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    user : users[req.cookies.user_id],
    id: id,
    longURL: urlDatabase[id],
  };
  res.render("urls_show", templateVars);
});

/// POST Request for the submit form to get the short url
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  // console.log(req.body)
  res.redirect(`urls/${id}`);
});

// Redirecting the shortURL link to longURL page
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

///To delete the URL resource
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

///To Add the Updated Resource
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  // console.log(req.params.id)
  const longURL = req.body.longURL;
  console.log(longURL);
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

// /To handle the logins
app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id]
  res.render("login", { user });
});

// /To handle the LogOuts and clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

///To Register in the app
app.get("/register", (req, res) => {
  res.render("urls_register");
});

///To handle the registration page
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user_id = generateRandomString();


  if (userEmail.length === 0 || userPassword.length === 0) {
    return res.status(400).send("Invalid Email or Invalid Password");
  }

   if(getUserByEmail(req.body.email)) {
    res.status(400).send("Email already exists")
    return
  }
  users[user_id] = {
    id: user_id,
    email: userEmail,
    password: userPassword,
  };
 
  console.log(users);
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

///To handle login in seperate page
app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id]
  res.render("login", {user})
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
