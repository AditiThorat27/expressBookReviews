const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Task 6: Register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Both fields are required
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // isValid returns true only when the username is not taken yet
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 1: Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({ message: "Book not found for ISBN " + isbn });
 });

// Task 3: Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const isbns = Object.keys(books); // all keys of the books object
  const booksByAuthor = [];

  isbns.forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author) {
      booksByAuthor.push({
        isbn: isbn,
        title: books[isbn].title,
        reviews: books[isbn].reviews
      });
    }
  });

  if (booksByAuthor.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor: booksByAuthor }, null, 4));
  }
  return res.status(404).json({ message: "No books found for author " + req.params.author });
});

// Task 4: Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const isbns = Object.keys(books);
  const booksByTitle = [];

  isbns.forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title) {
      booksByTitle.push({
        isbn: isbn,
        author: books[isbn].author,
        reviews: books[isbn].reviews
      });
    }
  });

  if (booksByTitle.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle: booksByTitle }, null, 4));
  }
  return res.status(404).json({ message: "No books found with title " + req.params.title });
});

// Task 5: Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found for ISBN " + isbn });
});


/* ------------------------------------------------------------------
   Tasks 10-13: the same features as Tasks 1-4, using Axios with
   async/await or Promise callbacks. Each route below calls the
   matching route above through Axios.
------------------------------------------------------------------- */

const BASE_URL = "http://localhost:5000";

// The routes above send their JSON as text, so convert it back to an object when needed
const toObject = (data) => (typeof data === 'string' ? JSON.parse(data) : data);

// Pass an Axios error on to the client (keeps the original status, e.g. 404)
const sendError = (res, error) => {
  if (error.response) {
    return res.status(error.response.status).json(error.response.data);
  }
  return res.status(500).json({ message: "Error fetching data", error: error.message });
};

// Task 10: Get the list of books using async-await with Axios
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).send(JSON.stringify(toObject(response.data), null, 4));
  } catch (error) {
    return sendError(res, error);
  }
});

// Task 11: Get book details based on ISBN using Promise callbacks with Axios
public_users.get('/async/isbn/:isbn', (req, res) => {
  const isbn = encodeURIComponent(req.params.isbn);

  axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => {
      return res.status(200).send(JSON.stringify(toObject(response.data), null, 4));
    })
    .catch((error) => {
      return sendError(res, error);
    });
});

// Task 12: Get book details based on author using async-await with Axios
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const author = encodeURIComponent(req.params.author);
    const response = await axios.get(`${BASE_URL}/author/${author}`);
    return res.status(200).send(JSON.stringify(toObject(response.data), null, 4));
  } catch (error) {
    return sendError(res, error);
  }
});

// Task 13: Get book details based on title using async-await with Axios
public_users.get('/async/title/:title', async (req, res) => {
  try {
    const title = encodeURIComponent(req.params.title);
    const response = await axios.get(`${BASE_URL}/title/${title}`);
    return res.status(200).send(JSON.stringify(toObject(response.data), null, 4));
  } catch (error) {
    return sendError(res, error);
  }
});

module.exports.general = public_users;