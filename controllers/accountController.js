const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
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
    errors: null,
  })
}

/* ****************************************
*  Deliver management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  const userType = req.session.user?.userType || "Guest" // segurança extra
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
    userType,
  })
}


/* ****************************************
*  Deliver Upadate Account view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/update", {
    title: "Edit Account",
    nav,
    errors: null,
    
  })
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {

    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    //getting user name, type and Id to use on header, form and authorization
    req.session.user = {
      name: accountData.account_firstname,
      userType: accountData.account_type,
      userId: accountData.account_id
    };
    return res.redirect("/account/")
    }
  } catch (error) {
    return new Error('Access Forbidden')
  }
 }

 async function accountLogout(req, res) {
  req.session.destroy(err => {
      if (err) {
          return res.redirect('/account/');
      }
      res.clearCookie('jwt');
      res.redirect('/');
  });
}

/* ****************************************
*  Process Update Account
* *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  const regResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (regResult) {
    const newAccountData = await accountModel.getAccountById(account_id)
    // adding new data to the session
    req.session.user = {
      name: newAccountData.account_firstname,
      userType: req.session.user.userType,
      userId: newAccountData.account_id
    };
    req.flash(
      "notice",
      `Congratulations, you\'re information has been updated.`
    )
    res.status(201).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
      //using update data to render the view
      user: req.session.user 
    })
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}


/* ****************************************
*  Process Registration
* *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const {account_password, account_id } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password updating.')
    res.status(500).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.updatePassword(
    hashedPassword,
    account_id
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re information has been updated.`
    )
    res.status(201).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
*  Deliver Application Form view
* *************************************** */
async function buildApply(req, res) {
  let nav = await utilities.getNav()
  res.render("account/apply", {
    title: "Work with us",
    nav,
    errors: null,
    user: req.session.user,
    messages: req.flash("notice"),
  })
}

async function processApplication(req, res) {
  const { fullname, email, phone, area, about } = req.body

  try {
    await accountModel.submitApplication(fullname, email, phone, area, about)
    req.flash("notice", "Your application has been sent successfully!")
    res.redirect("/account/apply")
  } catch (error) {
    console.error(error)
    req.flash("notice", "Error sending the application. Please try again.")
    res.redirect("/account/apply")
  }
}



module.exports = { buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildManagement, 
  accountLogout, 
  buildAccountManagement, 
  updateAccount, 
  updatePassword, 
  buildApply, processApplication }