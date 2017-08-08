export default function(text: string) {
    const textarea = document.createElement('textarea');

    textarea.textContent = text;
    textarea.style.position = 'fixed';

    document.body.appendChild(textarea);

    try {
        textarea.select();
        document.execCommand('copy');
    } catch(err) {
        console.warn('Copy to clipboard failed.', err);
    } finally {
        document.body.removeChild(textarea);
    }
}