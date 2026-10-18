
const coverInput = document.getElementById("cover-image");

const coverPreviewContainer =
    document.getElementById("cover-preview-container");

const coverPreview = document.getElementById("cover-preview");

// Stores the temporary URL used to display the selected image.
let previewUrl = null;

/*
    Export this function so app.js can import and call it.
*/
export default function clearCoverPreview() {

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
    }

    coverPreview.removeAttribute("src");
    coverPreviewContainer.hidden = true;
}



coverInput.addEventListener("change", () => {

    // Get the first selected file.
    const file = coverInput.files[0];

    // If no file is selected, clear the preview.
    if (!file) {
        clearCoverPreview();
        return;
    }

    // Check whether the selected file is an image.
    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");

        coverInput.value = "";
        clearCoverPreview();

        return;
    }

    // Remove the previous preview before creating a new one.
    clearCoverPreview();

    // Create a temporary URL for the selected local image.
    previewUrl = URL.createObjectURL(file);

    // Set the image source to that temporary URL.
    coverPreview.src = previewUrl;

    // Make the preview visible.
    coverPreviewContainer.hidden = false;
});
