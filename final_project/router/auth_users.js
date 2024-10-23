const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();
const bodyParser = require("body-parser");

let users = [
    {
      username: "testuser",
      password: "password123"
    }
];

// Middleware per il parsing del body delle richieste
regd_users.use(bodyParser.json());

// Verifica se l'username è valido
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Verifica se username e password corrispondono a un utente registrato
const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Login per gli utenti registrati
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Verifica se l'utente esiste ed è autenticato
  if (!authenticatedUser(username, password)) {
    return res.status(403).json({ message: "Invalid username or password" });
  }

  // Genera il token JWT
  const accessToken = jwt.sign({ username: username }, "access", {
    expiresIn: "1h", // Tempo di scadenza del token
  });

  // Imposta il token nella sessione
  req.session.authorization = {
    accessToken: accessToken,
  };

  return res
    .status(200)
    .json({ message: "Login successful", token: accessToken });
});

// Aggiungi una recensione a un libro
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }

  // Verifica il token JWT
  jwt.verify(token.split(" ")[1], "access", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const isbn = req.params.isbn;
    let filtered_books = Object.values(books).filter(
      (book) => book.isbn === isbn
    );

    if (filtered_books.length > 0) {
      // Aggiungi la recensione al libro
      filtered_books[0].reviews.push(req.body.review);
      return res.status(200).json({ message: "Review added successfully" });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
});
// Cancellazione di una recensione
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const bearerToken = token.split(" ")[1];

  // Verifica il token JWT
  jwt.verify(bearerToken, "access", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const isbn = req.params.isbn;
    const username = user.username; // Username dall'oggetto utente decodificato dal token

    let filtered_books = Object.values(books).filter(
      (book) => book.isbn === isbn
    );

    if (filtered_books.length > 0) {
      const reviews = filtered_books[0].reviews;

      // Rimuovi tutte le recensioni scritte dall'utente attualmente autenticato
      const originalLength = reviews.length;
      filtered_books[0].reviews = reviews.filter(
        (review) => review.reviewer !== username
      );

      if (originalLength !== filtered_books[0].reviews.length) {
        return res
          .status(200)
          .json({ message: "All reviews by the user deleted successfully" });
      } else {
        return res
          .status(404)
          .json({ message: "No reviews found for this user" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
