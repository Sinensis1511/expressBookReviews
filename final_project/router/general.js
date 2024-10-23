const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Task 10: Endpoint per ottenere la lista dei libri
public_users.get("/books", async (req, res) => {
    try {
        res.status(200).json(books); // Restituisce la lista di tutti i libri
    } catch (error) {
        console.error("Errore durante il recupero dei libri:", error);
        res.status(500).json({ message: "Errore nel recupero dei libri" });
    }
});

// Task 11: Endpoint per ottenere i dettagli di un libro in base all'ISBN
public_users.get("/books/:isbn", async (req, res) => {
    const isbn = req.params.isbn;
    console.log("Richiesta per l'ISBN:", isbn);

    // Trova il libro corrispondente all'ISBN
    const book = books.find(b => b.isbn === isbn);

    if (book) {
        res.json(book); // Invia i dati del libro come risposta
    } else {
        res.status(404).json({ message: "Libro non trovato" }); // Risposta per libro non trovato
    }
});

// Task 12: Endpoint per ottenere i dettagli di un libro in base all'autore
public_users.get("/books/author/:author", async (req, res) => {
    const author = req.params.author.toLowerCase();
    console.log("Richiesta per l'autore:", author);

    // Filtra i libri in base all'autore
    const filteredBooks = books.filter(b => b.author.toLowerCase() === author);

    if (filteredBooks.length > 0) {
        res.json(filteredBooks); // Restituisce i libri trovati
    } else {
        res.status(404).json({ message: "Nessun libro trovato per l'autore" }); // Risposta se nessun libro trovato
    }
});

// Task 13: Endpoint per ottenere i dettagli di un libro in base al titolo
public_users.get("/books/title/:title", async (req, res) => {
    const title = req.params.title.toLowerCase();
    console.log("Richiesta per il titolo:", title);

    // Trova il libro corrispondente al titolo
    const book = books.find(b => b.title.toLowerCase() === title);

    if (book) {
        res.json(book); // Invia i dati del libro come risposta
    } else {
        res.status(404).json({ message: "Libro non trovato" }); // Risposta per libro non trovato
    }
});

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Verifica che username e password siano forniti
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username e password sono obbligatori" });
  }

  // Verifica se l'username è già registrato
  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res
      .status(409)
      .json({ message: "Username già esistente, scegline un altro." });
  }

  // Aggiungi il nuovo utente all'array users
  users.push({ username, password });

  // Risposta di successo
  return res
    .status(201)
    .json({ message: "Registrazione effettuata con successo!" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
 res.send(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  let filtered_books = Object.values(books).filter(
    (book) => book.isbn === isbn
  );
 if (filtered_books.length > 0) {
   res.send(filtered_books);
 } else {
   res.status(404).json({ message: "Book not found" });
 }
 });
  

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const authorName = req.params.author.toLowerCase(); // Ottieni il nome dell'autore dalla richiesta
  // Filtra i libri basandosi sull'autore
  let filteredBooks = Object.values(books).filter(book => 
    book.author.toLowerCase() === authorName // Confronto case-insensitive
  );

  if (filteredBooks.length > 0) {
    res.send(filteredBooks); // Invia i libri filtrati come risposta
  } else {  
    res.status(404).json({ message: "Author not found" }); // Autore non trovato
  }
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
const title = req.params.title.toLocaleLowerCase(); 
let filteredBooks = Object.values(books).filter(book=>book.title.toLocaleLowerCase()==title);
if(filteredBooks.length>0){
  res.send(filteredBooks);
}else{
  res.status(404).json({ message: "Book not found" });
}
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn=req.params.isbn;
  let filtered_books=Object.values(books).filter(book=>book.isbn==isbn);
  if(filtered_books.length>0){
    let review=filtered_books[0].reviews;
    res.send(review);
  }
else{
  res.status(404).json({ message: "Book not found" });
}
});

module.exports.general = public_users;
