# ChatGPT Data Visualizer

A high-performance, privacy-first web application to visualize your ChatGPT history exports. Designed with a high-density "Data Style" layout for efficient browsing of large conversation logs.

![Project Screenshot](https://raw.githubusercontent.com/smallyu/chatgpt-visualizer/main/screenshot.png)

## Features

- **High-Density Layout**: Optimized for reading large amounts of text and code with minimal wasted space.
- **Privacy First**: Runs entirely locally. Your data never leaves your machine.
- **Full Rendering**: Supports Markdown, Code Syntax Highlighting, and LaTeX Math equations.
- **Image Attachments**: Automatically displays images included in your export.
- **Instant Search**: Virtualized list allows instant filtering even with thousands of conversations.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn

## Usage Guide

### Step 1: Export Your Data from ChatGPT

1. Log in to [ChatGPT](https://chat.openai.com).
2. Click on your profile icon (bottom left or top right) -> **Settings**.
3. Go to **Data controls** -> **Export data**.
4. Click **Confirm export**.
5. Wait for an email from OpenAI (usually takes a few minutes).
6. Download the `.zip` file from the email.

### Step 2: Prepare the Data

1. Clone or download this project to your computer.
2. Navigate to the project directory:
   ```bash
   cd chatgpt-visualizer
   ```
3. Create the data directory (if it doesn't exist):
   ```bash
   mkdir -p public/data
   ```
4. **Extract** the downloaded zip file from ChatGPT.
5. **Copy** all extracted files (including `conversations.json` and any image files like `file-*.png`) into the `public/data/` folder of this project.

   Directory structure should look like this:
   ```
   chatgpt-visualizer/
   ├── public/
   │   ├── data/
   │   │   ├── conversations.json
   │   │   ├── file-abc1234.png
   │   │   └── ...
   │   └── ...
   ├── src/
   └── ...
   ```

### Step 3: Run the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and visit: [http://localhost:5173](http://localhost:5173)

## Building for Production

To create a standalone static build (e.g., for deployment to a private server):

```bash
npm run build
npm run preview
```

The build artifacts will be in the `dist/` directory.

## Troubleshooting

- **Images not loading?** Ensure the image files (starting with `file-`) are in the root of `public/data/` alongside `conversations.json`.
- **Blank screen?** Check the browser console (F12) for errors. Ensure `public/data/conversations.json` exists and is valid JSON.
# chatgpt-visualizer
