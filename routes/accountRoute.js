// Importações necessárias
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation')

// Definindo a rota para o caminho '/account' 
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),   // Validação
  regValidate.checkRegData,         // Verificação dos dados
  utilities.handleErrors(accountController.registerAccount) // Controlador
)


// Middleware de erro
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Algo deu errado!");
});

// Exportando a rota para uso em outros arquivos
module.exports = router;
