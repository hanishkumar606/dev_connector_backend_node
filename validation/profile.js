const Validator = require('validator');
const isEmpty = require('./isempty');

module.exports = function validateProfileInput(data) {

    let errors = {}

    data.handle = isEmpty(data.handle) ? '' : data.handle
    data.status = isEmpty(data.status) ? '' : data.status
    data.skills = isEmpty(data.skills) ? '' : data.skills

    if (!Validator.isLength(data.handle, { min: 2, max: 30 })) {
        errors.handle = "Handle must be between 2 to 30 characters"
    }

    if (isEmpty(data.handle)) {
        errors.handle = "Handle field is required"
    }

    if (isEmpty(data.status)) {
        errors.status = "Status field is required"
    }

    if (isEmpty(data.skills)) {
        errors.skills = "Skills field is required"
    }
    if (!isEmpty(data.website)) {
        if (!Validator.isURL(data.website))
            errors.website = "Provide a Valid URL"
    }
    if (!isEmpty(data.youtube)) {
        if (!Validator.isURL(data.youtube))
            errors.youtube = "Provide a Valid URL"
    }
    if (!isEmpty(data.twitter)) {
        if (!Validator.isURL(data.twitter))
            errors.twitter = "Provide a Valid URL"
    }
    if (!isEmpty(data.facebook)) {
        if (!Validator.isURL(data.facebook))
            errors.facebook = "Provide a Valid URL"
    }
    if (!isEmpty(data.linkedin)) {
        if (!Validator.isURL(data.linkedin))
            errors.linkedin = "Provide a Valid URL"
    }
    if (!isEmpty(data.instagram)) {
        if (!Validator.isURL(data.instagram))
            errors.instagram = "Provide a Valid URL"
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}