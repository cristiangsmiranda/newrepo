// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require('../utilities/inventory-validation')


// Route to build inventory 
router.get("/", utilities.checkAuthorization, utilities.handleErrors(invController.buildManagement))
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId))
router.get("/detail/", utilities.handleErrors(invController.buildByInvId))
router.get("/add-classification/", utilities.checkAuthorization, utilities.handleErrors(invController.buildAddClassification))
router.get("/add-inventory/", utilities.checkAuthorization, utilities.handleErrors(invController.buildAddInventory))
router.get("/getInventory/:classification_id", utilities.checkAuthorization, utilities.handleErrors(invController.getInventoryJSON))
//Edit Inventory route
router.get("/edit/:invId", utilities.checkAuthorization, utilities.handleErrors(invController.editInventoryView))
router.get("/delete/:invId", utilities.checkAuthorization, utilities.handleErrors(invController.deleteView))


// Process the classification data
router.post(
    "/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassData,
    utilities.handleErrors(invController.manageClassification)
  )

// Process the classification data
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.manageInventory)
)

//update Inventory route
router.post("/update", 
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory))

//delete Inventory route
router.post("/delete", 
  utilities.handleErrors(invController.deleteItem))


module.exports = router;