# User Documentation

This document explains how to set up, configure, and use the LiveSitter app, including video streaming setup, inputting RTSP URLs, and managing overlays.

---

## 1. Installation & Setup

### Backend (Flask)
1. Navigate to the backend folder:
   ```bash
   cd backend
````

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate   # Linux / macOS
   venv\Scripts\activate      # Windows
   ```
3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file:

   ```env
   MONGODB_CONNECTION_STRING=mongodb+srv://user:pass@cluster.mongodb.net
   ```
5. Start the Flask server:

   ```bash
   python app.py
   ```

The backend will run at:
`http://localhost:5000`

---

### Frontend (React)

1. Navigate to frontend:

   ```bash
   cd frontend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the development server:

   ```bash
   npm start
   ```

The frontend will run at:
`http://localhost:3000`

---

## 2. Video Streaming Setup

The application uses **HLS streaming**. By default, it looks for an `.m3u8` file served by the backend.

### Using Local Video (Default)

Place your video HLS files in the `mystream` folder inside the backend project. Example:

```
backend/mystream/index.m3u8
backend/mystream/segment0.ts
backend/mystream/segment1.ts
```

Access it at:

```
http://localhost:5000/hls/index.m3u8
```

### Using RTSP Camera Stream

If you have an RTSP camera or stream, you need to convert RTSP → HLS using **FFmpeg**.

Example command:

```bash
ffmpeg -i rtsp://your-camera-ip/stream -c:v libx264 -f hls -hls_time 2 -hls_list_size 3 -hls_flags delete_segments mystream/index.m3u8
```

* Replace `rtsp://your-camera-ip/stream` with your RTSP URL.
* This will create `index.m3u8` and `.ts` segment files inside `mystream/`.
* The app will automatically load it.

---

## 3. Input Video URL (Frontend)

On the frontend:

* You can either use the **default video source** (`index.m3u8`) or provide your **own URL**.
* Enter your URL in the video input field (above the overlay form).
* Supported formats:

  * HLS (`.m3u8`)
  * MP4 (served locally or via HTTP)
  * Converted RTSP streams.

---

## 4. Managing Overlays

### Add Overlay

1. Select type: **Text** or **Image**.
2. Fill in:

   * **Text** (if text overlay).
   * **Upload Image** (if image overlay).
   * **X, Y position**.
   * **Font size** & **Color**.
   * **Scale %** (for images).
   * **Label/Name** (to identify overlay).
3. Submit to save.

### View Overlays

* A table below the video displays all overlays.
* Scrollable table with details:

  * Content (text/image label)
  * Type
  * Position (x,y)
  * Scale (if image)
  * Visibility (on/off toggle)

### Edit Overlay

* Click **Edit** in the table.
* Update values via the form.
* Save changes.

### Toggle Overlay

* Use the **visibility toggle** to show/hide overlays.
* This updates the database, not just frontend state.

### Delete Overlay

* Remove one overlay with **Delete** button.
* Remove all overlays with **Clear All**.

---

## 5. Typical Workflow

1. Start backend (`Flask`) and frontend (`React`).
2. Input your **video source** (local file, HLS `.m3u8`, or RTSP URL).
3. Add overlays (text or image) via the form.
4. Overlays are saved in MongoDB Atlas.
5. Overlays appear **live on the video**.
6. Use the table to **toggle, edit, or delete** overlays.

---

## 6. Example MongoDB Document

```json
{
  "_id": "68a38aee083d541204033e97",
  "type": "text",
  "text": "Praveen",
  "x": 50,
  "y": 50,
  "fontSize": 20,
  "color": "pink",
  "image": "",
  "visible": false,
  "scale": 100,
  "label": "Name Tag"
}
```

---

## 7. Notes

* **Windows users**: Use `ffmpeg.exe` in PowerShell for RTSP conversion.
* **Linux/macOS users**: Install ffmpeg via package manager (`apt`, `brew`, etc.).
* Browser autoplay may block video → click play manually if needed.
