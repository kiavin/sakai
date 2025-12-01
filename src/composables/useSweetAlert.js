import { useConfirm } from 'primevue/useconfirm';

export function useSweetAlert() {
    const confirm = useConfirm();

    // Internal helper to reduce repetition
    const fire = (options) => {
        confirm.require({
            group: 'sweetalert', // <--- IMPORTANT: Targets our custom template
            header: options.title,
            message: options.text,
            icon: options.icon,
            acceptLabel: options.confirmBtnText || 'OK',
            rejectLabel: options.cancelBtnText, // If null, button hides
            acceptClass: options.confirmBtnClass || 'p-button-primary',
            accept: options.onConfirm,
            reject: options.onCancel
        });
    };

    return {
        success: (title, text) =>
            fire({
                title,
                text,
                icon: 'pi pi-check', // Template detects 'check' -> makes it Green
                confirmBtnText: 'Great!',
                confirmBtnClass: 'p-button-success'
            }),

        error: (title, text) =>
            fire({
                title,
                text,
                icon: 'pi pi-times', // Template detects 'times' -> makes it Red
                confirmBtnText: 'Close',
                confirmBtnClass: 'p-button-danger'
            }),

        warning: (title, text) =>
            fire({
                title,
                text,
                icon: 'pi pi-exclamation-triangle', // Template detects 'exclamation' -> Orange
                confirmBtnText: 'Understood',
                confirmBtnClass: 'p-button-warning'
            }),

        confirmAction: (title, text, onAccept) =>
            fire({
                title,
                text,
                icon: 'pi pi-exclamation-circle',
                confirmBtnText: 'Yes, delete it!',
                cancelBtnText: 'Cancel', // This triggers the secondary button
                confirmBtnClass: 'p-button-danger',
                onConfirm: onAccept
            })
    };
}
