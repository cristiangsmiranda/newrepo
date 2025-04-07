// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

// Route to build account
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))
router.get('/logout', utilities.handleErrors(accountController.accountLogout))
router.get("/update", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
    "/",
    regValidate.LoginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

// Process the update account data
router.post(
    "/updateAccount",
    regValidate.updateAccountRules(),
    regValidate.checkUpdateAccountData,
    utilities.handleErrors(accountController.updateAccount)
)

// Process the update account data
router.post(
    "/updatePassword",
    regValidate.updatePasswordRules(),
    regValidate.checkUpdatePasswordData,
    utilities.handleErrors(accountController.updatePassword)
)


module.exports = router;