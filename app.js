document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const imageUpload = document.getElementById('image-upload');
    const pdfDownload = document.getElementById('pdf-download');
    const body = document.body;

    // Always use dark mode
    body.classList.add('dark-mode');

    // Focus editor on page load
    setTimeout(() => {
        editor.focus();
        // Move caret to end if there's existing content
        if (editor.childNodes.length > 0) {
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }, 0);

    // Initialize from local storage or defaults
    loadEditorContent();
    
    // Handle placeholder text
    editor.addEventListener('focus', () => {
        const placeholder = editor.querySelector('.placeholder');
        if (placeholder && editor.textContent.trim() === 'Start writing...') {
            placeholder.remove();
            editor.innerHTML = '';
        }
    });
    
    // Auto-save content to local storage
    editor.addEventListener('input', () => {
        localStorage.setItem('editorContent', editor.innerHTML);
    });
    
    // Image upload handling
    imageUpload.addEventListener('change', handleImageUpload);
    

    // PDF download
    pdfDownload.addEventListener('click', generatePDF);
    
    // Functions
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = file.name;
                img.style.maxWidth = '100%';
                img.style.display = 'block';
                img.style.margin = '10px 0';

                // Insert image at caret position
                const selection = window.getSelection();
                let range = null;
                if (selection.rangeCount > 0) {
                    range = selection.getRangeAt(0);
                    // If selection is not inside the editor, append at end
                    let editorContainsSelection = false;
                    let node = selection.anchorNode;
                    while (node) {
                        if (node === editor) {
                            editorContainsSelection = true;
                            break;
                        }
                        node = node.parentNode;
                    }
                    if (editorContainsSelection) {
                        // Remove placeholder if present
                        const placeholder = editor.querySelector('.placeholder');
                        if (placeholder) placeholder.remove();
                        range.collapse(false);
                        range.insertNode(img);
                        // Move caret after image
                        range.setStartAfter(img);
                        range.setEndAfter(img);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } else {
                        editor.appendChild(img);
                    }
                } else {
                    editor.appendChild(img);
                }
                // Save content to local storage
                localStorage.setItem('editorContent', editor.innerHTML);
            };
            reader.readAsDataURL(file);
        }
        // Reset file input
        e.target.value = '';
    }
    

    function loadEditorContent() {
        const savedContent = localStorage.getItem('editorContent');
        if (savedContent && savedContent.trim() !== '') {
            editor.innerHTML = savedContent;
        }
    }
    
    function generatePDF() {
        try {
            // Create a clone of the editor content for PDF conversion
            const contentClone = document.createElement('div');
            contentClone.innerHTML = editor.innerHTML;
            contentClone.classList.add('pdf-container');
            
            // Remove placeholder if it exists
            const placeholder = contentClone.querySelector('.placeholder');
            if (placeholder) {
                placeholder.remove();
            }
            
            // Configure pdf options
            const options = {
                margin: [15, 15, 15, 15],
                filename: 'minimal-writer-document.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // Generate PDF
            html2pdf().from(contentClone).set(options).save();
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('PDF download failed. See console for details.');
        }
    }
});
