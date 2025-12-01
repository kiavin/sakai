import api from '@/utils/axios';

/**
 * Downloads a binary file from the API
 * @param {String} url - The API endpoint (e.g. '/v1/exports/users')
 * @param {String} [defaultFilename] - Fallback filename if server doesn't provide one
 */
export const downloadFile = async (url, defaultFilename = 'download') => {
    try {
        const response = await api.get(url, {
            responseType: 'blob' // Critical: tells Axios to treat this as binary
            // Optional: Add headers if you need specific export formats
            // headers: { 'Accept': 'application/pdf' }
        });

        // 1. Extract Filename from Headers (Content-Disposition)
        // Header format: 'attachment; filename="users_export_2024.csv"'
        let filename = defaultFilename;
        const disposition = response.headers['content-disposition'];

        if (disposition && disposition.indexOf('filename=') !== -1) {
            const regex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = regex.exec(disposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        // 2. Create Virtual Link & Trigger Click
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);

        document.body.appendChild(link);
        link.click();

        // 3. Cleanup (Prevent Memory Leaks)
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        // 4. Handle Blob Errors
        // If the server returns 400/500, it returns a JSON object INSIDE the Blob.
        // We must parse it back to text to see the error message.
        if (error.response && error.response.data instanceof Blob) {
            const errorText = await error.response.data.text();
            try {
                const errorJson = JSON.parse(errorText);

                // Dispatch your global error notification
                window.dispatchEvent(
                    new CustomEvent('api-notification', {
                        detail: {
                            message: errorJson.message || 'Download failed',
                            theme: 'error',
                            type: 'toast'
                        }
                    })
                );
            } catch (error) {
                // Fallback if it wasn't JSON
                console.error('Download failed', error);
            }
        }
    }
};
