
export async function saveCover(file) {
    const allowedTypes = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif"
    };

    if (!allowedTypes[file.type]) {
        throw new Error("[!] Please upload a JPG, PNG, WebP, or Gif image.");
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
        throw new Error("[!] The cover image size cannot exceed 5 MB.");
    }

    const filename = crypto.randomUUID() + allowedTypes[file.type];

    await Deno.mkdir("./public/uploads", {recursive: true});

    const imageBytes = new Uint8Array(await file.arrayBuffer());

    await Deno.writeFile(`./public/uploads/${filename}`, imageBytes);

    return `/uploads/${filename}`;
}