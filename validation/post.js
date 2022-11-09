const isEmpty = require("./isempty")
const Validator = require("validator")

const ValidatePostInput = (data) => {
    let errors = {}

    data.text = isEmpty(data.text) ? '' : data.text

    if (!Validator.isLength(data.text, { min: 6, max: 300 })) {
        errors.text = "Text must between 6 and 300 characters"
    }

    if (Validator.isEmpty(data.text)) {
        errors.text = "Text field is required"
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

module.exports = ValidatePostInput;