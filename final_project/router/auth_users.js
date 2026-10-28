const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Returns true if the username is valid for registration (not empty and not already taken)
const isValid = (username)=>{
  if (!username) {
    return false;
  }
  const userWithSameName = users.filter((user) => user.username === username);
  return userWithSameName.length === 0;
}

// Returns true if the username and password match a registered user
const authenticatedUser = (username,password)=>{
  const validUsers = users.filter((user) => user.username === username && user.password === password);
  return validUsers.length > 0;
}

// Task 7: only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check username and password" });
  }

  // Create a JWT access token and save it, with the username, in the session
  const accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 * 60 });
  req.session.authorization = {
    accessToken: accessToken,
    username: username
  };

  return res.status(200).json({ message: "Customer successfully logged in" });
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;                 // review comes as a request query
  const username = req.session.authorization.username; // username comes from the session

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }

  if (!review) {
    return res.status(400).json({ message: "Please provide a review as a query, e.g. ?review=Great" });
  }

  // Same user + same ISBN modifies the existing review; a different user adds a new one
  const alreadyReviewed = books[isbn].reviews[username] !== undefined;
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: alreadyReviewed
      ? "Review for ISBN " + isbn + " modified successfully"
      : "Review for ISBN " + isbn + " added successfully",
    reviews: books[isbn].reviews
  });
});

// Task 9: Delete a book review (a user can only delete their own review)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }

  if (books[isbn].reviews[username] === undefined) {
    return res.status(404).json({ message: "No review by " + username + " found for ISBN " + isbn });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review for ISBN " + isbn + " posted by " + username + " deleted",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;