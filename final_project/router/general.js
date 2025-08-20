const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email, and password are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  if (users.some(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const hashedPassword = hashPassword(password);

  const newUser = { username, email, password: hashedPassword };
  users.push(newUser);

  return res.status(200).json({ message: "User registered successfully" });
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function hashPassword(password) {
  return password;
}


public_users.get('/', async (req, res) => {
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        resolve(books);
      });
    };

    const allBooks = await getBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books" });
  }
});


public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const getBookByISBN = (isbn) => {
      return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject("Book not found");
        }
      });
    };

    const book = await getBookByISBN(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;

  try {
    const getBooksByAuthor = (author) => {
      return new Promise((resolve, reject) => {
        const result = Object.values(books).filter(book => book.author === author);
        if (result.length > 0) {
          resolve(result);
        } else {
          reject("Books by this author not found");
        }
      });
    };

    const booksByAuthor = await getBooksByAuthor(author);
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});


public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;

  try {
    const getBooksByTitle = (title) => {
      return new Promise((resolve, reject) => {
        const result = Object.values(books).filter(book => book.title === title);
        if (result.length > 0) {
          resolve(result);
        } else {
          reject("Books with this title not found");
        }
      });
    };

    const booksByTitle = await getBooksByTitle(title);
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json({ reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "Review for this book not found" });
  }
});

module.exports.general = public_users;
