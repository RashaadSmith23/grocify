# 🛒 Grocify

A clean, responsive grocery list app that runs entirely in the browser. No server, no sign-up, no dependencies — just open the page and start adding items.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## Features

| Feature | Description |
|---------|-------------|
| **Add items** | Name, quantity, and category selector |
| **Attach images** | Paste a URL or upload a file — thumbnail shown on each item |
| **Lightbox viewer** | Click a thumbnail to view the full image |
| **Mark purchased** | Check off items as you buy them |
| **Filters** | All / Active / Purchased tabs |
| **Category tags** | Filter by Produce, Dairy, Meat, Bakery, Frozen, etc. |
| **Search** | Real-time search across item names |
| **Sort** | A-Z / Z-A toggle |
| **Download list** | Export a formatted `.txt` file grouped by category |
| **Confirm dialogs** | Custom animated modals for delete and clear actions |
| **Persistent storage** | All data saved to `localStorage` — survives page reload |
| **Smart defaults** | 5 seed items on first visit, never re-added after clearing |
| **Fully responsive** | Works on mobile, tablet, and desktop |

---

## Getting Started

No build tools. No server. Just download the three files and open `index.html`:

```bash
git clone https://github.com/YOUR_USERNAME/grocify.git
cd grocify
# Open index.html in your browser
```

Or [download the ZIP](https://github.com/YOUR_USERNAME/grocify/archive/refs/heads/main.zip) and extract.

---

## How to Use

1. **Add an item** — type a name, set quantity, pick a category, click **Add**
2. **Add an image** — click the camera button, paste a URL or browse a file
3. **Mark as bought** — click the circle next to an item
4. **Filter** — use the tabs (All / Active / Purchased) and category tags
5. **Search** — type in the search bar to filter in real time
6. **Sort** — click **Sort** to toggle A-Z / Z-A
7. **Download** — click **Download** to export your list as a text file
8. **Clear bought** — click **Clear Bought** to remove all purchased items

---

## Project Structure

```
grocify/
├── index.html      # App structure (143 lines)
├── style.css       # All styles with custom properties (894 lines)
├── app.js          # Full application logic (524 lines)
└── README.md       # This file
```

Single-page app — all three files are self-contained with no external dependencies beyond the Google Fonts stylesheet.

---

## Customization

All colors are controlled via CSS custom properties in `:root`. Edit `style.css` to change the theme:

```css
:root {
  --primary: #2e7d32;       /* Green theme */
  --primary-light: #4caf50;
  --primary-dark: #1b5e20;
  --danger: #d32f2f;        /* Delete buttons */
  --bg: #f5f7fa;            /* Page background */
  --surface: #ffffff;       /* Card background */
}
```

---

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — Flexbox, animations, custom properties, responsive queries
- **Vanilla JavaScript (ES6+)** — IIFE pattern, arrow functions, template literals, `localStorage`, `FileReader` API
- **[Inter](https://fonts.google.com/specimen/Inter)** — system font stack with Google Fonts fallback
- **No frameworks, no build tools, no runtime dependencies**

---

## License

MIT
