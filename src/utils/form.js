/**
 * parses backend 422 errors and sets them in VeeValidate
 * @param {Object} error - The Axios error object
 * @param {Function} setErrors - VeeValidate's setErrors function
 */
export function setApiErrors(error, setErrors) {
    // 1. Check if it's actually a validation error (422)
    if (error.response && error.response.status === 422) {
        // 2. Extract the 'errors' object from the response
        // Laravel/Standard format: { "errors": { "email": ["Taken"], "password": ["Too short"] } }
        const backendErrors = error.response.data.errors || {};

        // 3. Transform format for VeeValidate
        // VeeValidate expects: { email: "Taken", password: "Too short" } (Strings, not arrays)
        const formErrors = {};

        Object.keys(backendErrors).forEach((key) => {
            // Take the first error message from the array
            formErrors[key] = backendErrors[key][0];
        });

        // 4. Push errors to the form
        setErrors(formErrors);
    }
}
