const utilities = require("../utilities");
const accountModel = require("../models/account-model")
const bcrypt = require("bcrypt");

const { check, validationResult } = require("express-validator");


/* ****************************************
*  Function to deliver the login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}


const validateRegistration = [
  check("account_firstname")
    .notEmpty()
    .withMessage("First name is required"),
  check("account_lastname")
    .notEmpty()
    .withMessage("Last name is required"),
  check("account_email")
    .isEmail()
    .withMessage("Enter a valid email address"),
  check("account_password")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{12,}$/)
    .withMessage("Password must be at least 12 characters and contain at least 1 number, 1 uppercase letter, and 1 special character"),
];



/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Verifica se há erros de validação
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Se houver erros, renderiza o formulário novamente com erros
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      locals: req.body, // Mantém os dados do formulário após erro
    });
  }

  const emailExists = await accountModel.checkExistingEmail(account_email);
  if (emailExists) {
    req.flash("notice", "This email is already in use. Please use another.");
    return res.status(400).render("account/register", { title: "Register", nav,
      locals: req.body,
    });
  }

  try {
    // Gera o hash da senha antes de armazená-la
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render("account/login", { title: "Login", nav });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", { title: "Register", nav });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    req.flash("notice", "Something went wrong during registration.");
    return res.status(500).render("account/register", { title: "Register", nav });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, validateRegistration }
