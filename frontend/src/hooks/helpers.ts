export const formatFileSize = (bytes: number): string => {
    const kb = 1024;
    const mb = kb * 1024;
    const gb = mb * 1024;

    if (bytes >= gb) {
        return (bytes / gb).toFixed(2) + ' GB';
    }

    if (bytes >= mb) {
        return (bytes / mb).toFixed(2) + ' MB';
    }

    return (bytes / kb).toFixed(2) + ' KB';
};