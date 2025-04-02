// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require('../utilities')
const validate = require("../utilities/inventory-validation")



// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:vehicleId", utilities.handleErrors(invController.getVehicleDetail));
router.get('/trigger-error', utilities.handleErrors(invController.triggerError));
// Exibir a página de gerenciamento do inventário
router.get("/management", utilities.handleErrors(invController.showManagement));
router.get("/add-classification",utilities.handleErrors(invController.showAddClassification));
router.get("/add-inventory",utilities.handleErrors(invController.showAddInventory));


router.post(
    "/add-classification",
    validate.classificationRules(), 
    validate.checkClassData, 
    utilities.handleErrors(invController.processAddClassification)
);


router.post(
    "/add-inventory",
    validate.inventoryRules(), 
    validate.checkInventoryData, 
    utilities.handleErrors(invController.addInventory)
);

module.exports = router;