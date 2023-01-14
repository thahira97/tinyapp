///////////////////////
//// DEPENDENCIES /////
///////////////////////

const express = require("express");
const app = express();
const PORT = 8080; // default port
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["noomehtotgniklaw", "efilrofgnidoc"],

    maxAge: 24 * 60 * 60 * 1000,
  })
);

///////////////////////
//// FUNCTIONS    /////
///////////////////////

const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");

///////////////////////
//// DATABASE     /////
///////////////////////

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
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
  nmwcb2: {
    id: "nmwcb2",
    email: "thameemsh.ca@gmail.com",
    password: bcrypt.hashSync("1234", 10),
  },
};

///////////////////////
//// ROUTES/ENDPOINTS /
///////////////////////

/// Get / :
//If user logged in redirects to urls,if not,redirects to login
app.get("/", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});

////Shows the urls to the loggedin user:::
app.get("/urls", (req, res) => {
  if (users[req.session.user_id]) {
    const templateVars = {
      user: users[req.session.user_id],
      urls: urlsForUser(urlDatabase, req.session.user_id),
    };

    res.render("urls_index", templateVars);
  } else {
    res
      .status(401)
      .send(
        "Must be logged in to view your URLs! If a registered user, please <a href='/login'>login!</a> or  please <a href='/register'> register!</a>"
      );
  }
});

///GET Request to create longURL
app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

////Get Request to read the Particular id only for the registered
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const userUrls = urlsForUser(urlDatabase, userID);
  const templateVars = {
    user: users[req.session.user_id],
    urlDatabase,
    userUrls,
    id,
  };
  if (!urlDatabase[id]) {
    res
      .status(404)
      .send(
        "Please enter a valid URL or URL does not exist for the given tinyURL"
      );
  } else if (!users[userID]) {
    res
      .status(401)
      .send(
        "User must login to view the URL! please <a href='/login'>login!</a>"
      );
  } else if (!userUrls[id]) {
    res
      .status(401)
      .send("Unauthorized access! This URL does not belong to you!");
  } else {
    res.render("urls_show", templateVars);
  }
});

/// POST Request for the submit form to get the short url
app.post("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    res
      .status(400)
      .send(
        "Must be logged in to view your URLs! If a registered user, please <a href='/login'>login!</a> or  please <a href='/register'> register!</a>"
      );
  } else {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[id] = {
      longURL: longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${id}`);
  }
});

// Redirecting the shortURL link to longURL page
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
  res.status(404).send("URL doesn't exist");
});

///To delete the URL resource
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (
    users[req.session.user_id] &&
    req.session.user_id === urlDatabase[id].userID
  ) {
    delete urlDatabase[id];
    res.redirect("/urls");
  }
  res.status(401).send("Oops! You cannot Access the page");
});

///To Add the Updated Resource
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  if (
    users[req.session.user_id] &&
    req.session.user_id === urlDatabase[id].userID
  ) {
    urlDatabase[id].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.status(401).send("Oops! You cannot Access the page");
  }
});

// /To handle the logins
app.get("/login", (req, res) => {
  if (!users[req.session.user_id]) {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("login", templateVars);
  }
  res.redirect("/urls");
});

// /To handle the LogOuts and clear cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

///To Register in the app
app.get("/register", (req, res) => {
  if (!users[req.session.user_id]) {
    const templateVars = {
      user: users[req.session.user_id],
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

  if (getUserByEmail(userEmail, users)) {
    return res
      .status(400)
      .send(
        "Email already exists. <a href= '/login'> Return to Login Page <a>"
      );
  }
  const user_id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  users[user_id] = {
    id: user_id,
    email: userEmail,
    password: hashedPassword,
  };

  req.session.user_id = user_id;
  res.redirect("/urls");
});

/////To handle the login registration page
app.post("/login", (req, res) => {
  //-----------------------------
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user_id = getUserByEmail(userEmail, users);

  if (!user_id) {
    return res
      .status(400)
      .send(
        "User cannot be found, <a href= '/register'> Return to Login Page <a>"
      );
  }
  if (!bcrypt.compareSync(userPassword, users[user_id].password)) {
    return res.status(400).send("Wrong Password or Invalid email-id");
  } else {
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
