const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.headers["authorization"];

  // Verifica se il token è presente nell'header Authorization
  if (token) {
    const accessToken = token.split(" ")[1]; // Prende solo il token senza "Bearer"

    // Verifica il token JWT
    jwt.verify(accessToken, "access", (err, user) => {
      if (!err) {
        req.user = user; // Imposta i dati dell'utente autenticato
        next(); // Prosegui con la richiesta
      } else {
        return res.status(403).json({ message: "Invalid token" });
      }
    });
  } else {
    return res.status(403).json({ message: "Token not provided" });
  }
});


const PORT = 3000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
