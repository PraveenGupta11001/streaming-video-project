# LiveSitter Project

A full-stack application for live video streaming with real-time overlay management (text and image).
Built with **React (frontend)**, **Flask (backend)**, and **MongoDB Atlas (database)**.

---

## Features

* **Live Video Playback**

  * Supports HLS streams (`.m3u8`).
  * Supports local/static MP4 videos.
  * Switch between streams by providing a URL.

* **Overlay Management**

  * Add text overlays with customizable position, color, and font size.
  * Add image overlays with position, scale (in %), and labels.
  * Toggle visibility of overlays.
  * Delete or update overlays at any time.
  * Data is stored persistently in MongoDB Atlas.

* **Overlay Display**

  * All overlays are rendered on top of the video player.
  * Image overlays can be scaled in percentage.
  * Overlays can be toggled on/off without reloading the video.

* **Admin Interface**

  * Form to add/edit overlays.
  * Scrollable table listing all overlays (text or image).
  * Supports live preview of changes.

---

## Project Structure

```
Livesitter_project/
│
├── livestram-app/           # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── OverlayForm.jsx
│   │   │   ├── OverlayTable.jsx
│   │   │   └── VideoPlayer.jsx
│   │   └── App.css
│   └── package.json
│
├── backend/                 # Flask backend
│   └── app.py
│
├── mystream/                # HLS files (index.m3u8, segments)
├── sample.mp4               # Example local video
└── README.md
```

---

## Setup Instructions

### 1. Backend (Flask + MongoDB Atlas)

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:

   ```bash
   python3 -m venv venv
   source venv/bin/activate   # Linux/macOS
   venv\Scripts\activate      # Windows
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend folder:

   ```
   MONGODB_CONNECTION_STRING=mongodb+srv://<username>:<password>@<cluster-url>/
   ```

4. Run the Flask server:

   ```bash
   python app.py
   ```

   Server will run on:

   ```
   http://localhost:5000
   ```

---

### 2. Frontend (React)

1. Navigate to frontend folder:

   ```bash
   cd livestram-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start React development server:

   ```bash
   npm start
   ```

   React app will run on:

   ```
   http://localhost:3000
   ```

---

## Usage

1. Start backend (`Flask`) and frontend (`React`) servers.
2. Open `http://localhost:3000` in the browser.
3. By default, the video loads `http://localhost:5000/hls/index.m3u8`.
4. Enter a custom video URL or path (e.g., `http://localhost:5000/video/sample.mp4`) in the input field.
5. Use the form to add/edit overlays.
6. Table below the video shows all overlays with their details.

---

## Requirements

* Node.js (>= 16.x)
* Python (>= 3.9)
* MongoDB Atlas account
* FFmpeg (only required if you want to generate `.m3u8` HLS files locally)

---

## Future Improvements

* Drag-and-drop positioning of overlays.
* Real-time collaborative editing.
* Authentication for admin panel.
* Support for multiple video sources.