const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    if (!username || !/^[a-zA-Z0-9]+$/.test(username)) {
        return false;
    }
    if (username.length < 3 || username.length > 20) {
        return false;
    }
    const reservedUsernames = ['admin', 'root', 'superuser'];
    if (reservedUsernames.includes(username.toLowerCase())) {
        return false;
    }
    return true;
};

const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password;
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "Token missing" });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, "your_secret_key", (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
};

regd_users.post("/customer/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username: username }, "your_secret_key", { expiresIn: '1h' });

    return res.status(200).json({ message: "Login successful", token: token });
});

regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully" });
});

regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
    const { isbn } = req.params;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
