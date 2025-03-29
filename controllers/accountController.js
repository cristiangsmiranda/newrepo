const utilities = require("../utilities");
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

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
    .withMessage("Enter a valid email address")
    .custom(async (account_email) => {
      const emailExists = await accountModel.checkExistingEmail(account_email);
      if (emailExists) {
        throw new Error("This email is already in use. Please use another.");
      }
    }),
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
      errors,
      account_firstname,
      account_lastname,
      account_email
      
    });
  }

  try {
    // Gera o hash da senha antes de armazená-la
    const hashedPassword = bcrypt.hashSync(account_password, 10);

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


async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  // Verificação se o e-mail existe no banco
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "Email not found." }],
      account_email,
    });
  }

  try {
    // Comparar a senha fornecida com a senha armazenada no banco
    const isPasswordValid = await bcrypt.compare(account_password, accountData.account_password);
    if (!isPasswordValid) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Incorrect password." }],
        account_email,
      });
    }

    // Remover a senha do objeto accountData antes de gerar o token
    delete accountData.account_password;

    // Gerar o token JWT
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

    // Configurar o cookie com o token JWT
    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000, sameSite: "Strict" });
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000, sameSite: "Strict" });
    }

    // Armazenar os dados do usuário na sessão
    req.session.user = {
      name: accountData.account_firstname,
      userType: accountData.account_type,
      userId: accountData.account_id,
    };

    // Redirecionar para a página de conta
    return res.redirect("/account/");
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error. Please try again later." });
  }
}

async function accountLogout(req, res) {
  req.session.destroy(err => {
      if (err) {
          return res.redirect('/account/');
      }
      res.clearCookie('jwt');
      res.redirect('/account/login');
    });
}


module.exports = { buildLogin, buildRegister, registerAccount, validateRegistration, accountLogin, accountLogout }
