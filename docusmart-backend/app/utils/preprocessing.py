"""Image preprocessing utilities for OCR quality improvement."""

from PIL import Image, ImageFilter, ImageOps


def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Apply standard preprocessing steps to improve OCR accuracy:
    1. Convert to grayscale
    2. Auto-contrast enhancement  
    3. Slight sharpening
    4. Binarization via thresholding
    """
    # 1. Grayscale
    if image.mode != "L":
        image = image.convert("L")

    # 2. Auto-contrast
    image = ImageOps.autocontrast(image, cutoff=1)

    # 3. Sharpen
    image = image.filter(ImageFilter.SHARPEN)

    # 4. Binarize (simple threshold)
    threshold = 150
    image = image.point(lambda x: 255 if x > threshold else 0, "1")

    return image


def resize_for_ocr(image: Image.Image, target_dpi: int = 300) -> Image.Image:
    """
    Resize image to a target DPI suitable for OCR.
    Most OCR engines work best at 300 DPI.
    """
    # If image has DPI info, scale accordingly
    try:
        current_dpi = image.info.get("dpi", (72, 72))
        if isinstance(current_dpi, tuple):
            current_dpi = current_dpi[0]
        if current_dpi < target_dpi:
            scale = target_dpi / current_dpi
            new_size = (int(image.width * scale), int(image.height * scale))
            image = image.resize(new_size, Image.LANCZOS)
    except Exception:
        pass

    return image
