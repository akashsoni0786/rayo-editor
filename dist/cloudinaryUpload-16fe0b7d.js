async function i(r, e, t) {
  const o = new FormData();
  o.append("file", r), o.append("upload_preset", t);
  const a = `https://api.cloudinary.com/v1_1/${e}/image/upload`;
  try {
    const n = await fetch(a, {
      method: "POST",
      body: o
    });
    if (!n.ok)
      throw new Error(`Upload failed: ${n.statusText}`);
    return await n.json();
  } catch (n) {
    throw console.error("Error uploading to Cloudinary:", n), n;
  }
}
function s() {
  const r = {}.VITE_CLOUDINARY_CLOUD_NAME || "", e = {}.VITE_CLOUDINARY_UPLOAD_PRESET || "";
  return {
    cloudName: r,
    uploadPreset: e,
    isConfigured: r && e
  };
}
function d(r) {
  return new Promise((e, t) => {
    const o = new FileReader();
    o.readAsDataURL(r), o.onload = () => e(o.result), o.onerror = (a) => t(a);
  });
}
export {
  d as fileToBase64,
  s as getCloudinaryConfig,
  i as uploadToCloudinary
};
