
const express = require("express");
const { body, validationResult } = require("express-validator");

const {
    registerPatient,
    loginUser,
    logoutUser
} = require("../controllers/authController");

const router = express.Router();


// =====================================
// VALIDATION MIDDLEWARE
// =====================================

function validateRequest(req, res, next) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({
            message: errors.array()[0].msg
        });

    }

    next();

}


// =====================================
// REGISTER
// =====================================

router.post(
    "/register",

    [
        body("fullName")
            .trim()
            .notEmpty()
            .withMessage("Full name is required."),

        body("email")
            .trim()
            .isEmail()
            .withMessage("Please enter a valid email address.")
            .normalizeEmail(),

        body("phone")
            .trim()
            .notEmpty()
            .withMessage("Phone number is required."),

        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must contain at least 8 characters.")
    ],

    validateRequest,

    registerPatient
);


// =====================================
// LOGIN
// =====================================

router.post(
    "/login",

    [
        body("email")
            .trim()
            .isEmail()
            .withMessage("Please enter a valid email address.")
            .normalizeEmail(),

        body("password")
            .notEmpty()
            .withMessage("Password is required.")
    ],

    validateRequest,

    loginUser
);


// =====================================
// LOGOUT
// =====================================

router.post("/logout", logoutUser);


module.exports = router;
