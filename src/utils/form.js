/**
 * parses backend 422 errors and sets them in VeeValidate
 * @param {Object} error - The Axios error object
 * @param {Function} setErrors - VeeValidate's setErrors function
 */
export function setApiErrors(error, setErrors) {
    // 1. Check if it's actually a validation error (422)
    if (error.response && error.response.status === 422) {
        // Adjust path based on your specific API response structure
        const backendErrors = error.response.data.errorPayload?.errors || error.response.data.errors || {};

        console.log('Backend Validation Errors:', backendErrors);

        const formErrors = {};

        Object.keys(backendErrors).forEach((key) => {
            const errorValue = backendErrors[key];

            // FIX: Check if it's an array or a string
            if (Array.isArray(errorValue)) {
                // It's an array (Laravel style): ["Error message"] -> Take the first one
                formErrors[key] = errorValue[0];
            } else {
                // It's a plain string: "Error message" -> Take it directly
                formErrors[key] = errorValue;
            }
        });

        // 4. Push errors to the form
        setErrors(formErrors);
    }
}
