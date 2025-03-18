const {check} = require('express-validator');

const signUpValidation = [
    check('name', 'Full Name is required').not().isEmpty(),
    check('username', 'Username is required').not().isEmpty(),
    check('number', 'Phone Number is required').not().isEmpty(),
    check('email', 'Email is required').not().isEmpty(),
    check('email', 'please enter a valid mail').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password', 'password is required').not().isEmpty(),
    check('password', 'password min 6 length').isLength({min:6}),
];

const loginValidation = [
    check('username', "Please enter a username").not().isEmpty(),
    check('password', 'Password min 6 length').not().isEmpty(),
];
const airtimeValidation = [
    check('network', 'provide ur network').not().isEmpty(),
    // check('paymentmethod', 'provide ur network').not().isEmpty(),
    check('number', 'Enter your phone number').not().isEmpty(),
    check('number', 'Phone number must be exactly 11 digits').isLength({ min: 11, max: 11 }),
    check('amount', 'Please enter your amount').not().isEmpty(),
    check('amount', 'Amount must be at least 100').isInt({ min: 100 }),
    check('amount', 'Amount must be at most 2000').isInt({ max: 2000 }),
    check('amount', 'Amount must not contain special characters').custom(value => !/[+-]/.test(value)),
    check('amount', 'Amount must not contain special characters').matches(/^\d+$/)
];
const airtimepin = [
    check('network', 'provide ur network').not().isEmpty(),
    // check('paymentmethod', 'provide ur network').not().isEmpty(),
    check('number', 'Enter your phone number').not().isEmpty(),
    check('number', 'Phone number must be exactly 11 digits').isLength({ min: 11, max: 11 }),
    check('amount', 'Please enter your amount').not().isEmpty(),
    check('amount', 'Amount must be at least 100').isInt({ min: 100 }),
    check('amount', 'Amount must be at most 2000').isInt({ max: 2000 }),
    check('amount', 'Amount must not contain special characters').custom(value => !/[+-]/.test(value)),
    check('amount', 'Amount must not contain special characters').matches(/^\d+$/)
];
const reward = [
    check('amount', 'Amount must not contain special characters').custom(value => !/[+-]/.test(value)),
    check('amount', 'Amount must not contain special characters').matches(/^\d+$/),
    check('rewardtype', 'rewardtype required').not().isEmpty(),

];
const dataValidation = [
    // check('paymentmethod', 'provide ur network').not().isEmpty(),
    // check('network', 'provide ur network').not().isEmpty(),
    check('number', 'Enter your phone number').not().isEmpty(),
    check('number', 'Phone number must be exactly 11 digits').isLength({ min: 11, max: 11 }),
    check('amount', 'Please enter your amount').not().isEmpty(),
    check('id', 'kindly provide ur network id').not().isEmpty(),
    check('amount', 'Amount must not contain special characters').custom(value => !/[+-]/.test(value)),
    check('amount', 'Amount must not contain special characters').matches(/^\d+$/)
];

const usercheck=[
    check("userId", "userId is required").not().isEmpty()
];

const forgetValidation = [
    check('email', 'Please enter a valid mail').isEmail().normalizeEmail({gmail_remove_dots:true}),
];
module.exports = {
   signUpValidation,
    loginValidation,
    airtimeValidation,
    dataValidation,
    forgetValidation,
    usercheck,
    reward,
    airtimepin
};
