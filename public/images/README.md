# Image Assets Instructions

## Founder Image
Please add Katrina Zhuk's professional photo in this directory with the following specifications:

1. **File name**: `katrina-zhuk.jpg` or `katrina-zhuk.png`
2. **Recommended dimensions**: 600x600px or 800x800px (square format works best)
3. **File location**: `/public/images/katrina-zhuk.jpg`

## How to Update the Image References

Once you've added the image, update the following files:

### 1. Home Page (`src/pages/Home.jsx`)
Replace the placeholder div (around line 185-195) with:
```jsx
<img 
  src="/images/katrina-zhuk.jpg" 
  alt="Katrina Zhuk - Founder & Visionary"
  className="w-full h-full object-cover"
/>
```

### 2. About Page (`src/pages/About.jsx`)
Replace the placeholder div (around line 135-145) with:
```jsx
<img 
  src="/images/katrina-zhuk.jpg" 
  alt="Katrina Zhuk - Founder & CEO"
  className="w-full h-full object-cover"
/>
```

## Additional Images
Feel free to add any other images for:
- Testimonials
- Team members
- Background images
- Feature illustrations

All images should be optimized for web use (compressed and appropriately sized).