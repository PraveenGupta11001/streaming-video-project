# API Documentation

The backend exposes a RESTful API to manage video overlays for live video streaming.
All endpoints are prefixed with:

```
http://localhost:5000/api
```

---

## Video Streaming

| Method | Endpoint          | Description                         |
| ------ | ----------------- | ----------------------------------- |
| `GET`  | `/hls/<filename>` | Serves `.m3u8` and `.ts` HLS files. |

Example:

```http
GET /hls/index.m3u8
```

---

## Overlay Management

### 1. Get All Overlays

```http
GET /api/overlays
```

Returns all overlays.

---

### 2. Get Overlay by ID

```http
GET /api/overlays/<overlay_id>
```

Fetch a single overlay document.

---

### 3. Add Overlay

```http
POST /api/overlays
```

**Request Body (JSON):**

```json
{
  "type": "text",            
  "text": "Praveen",         
  "image": "",               
  "x": 50,
  "y": 50,
  "fontSize": 20,
  "color": "pink",
  "visible": false,
  "scale": 100,
  "label": "optional label"
}
```

---

### 4. Update Overlay (Full Replace)

```http
PUT /api/overlays/<overlay_id>
```

* Replaces all fields with provided values.
* Empty fields are ignored.

---

### 5. Partial Update Overlay

```http
PATCH /api/overlays/<overlay_id>/update
```

**Example Body:**

```json
{
  "x": 200,
  "y": 120,
  "visible": true
}
```

---

### 6. Toggle Overlay Visibility

```http
PATCH /api/overlays/<overlay_id>/toggle
```

* Flips visibility `true ↔ false`.

---

### 7. Delete Overlay

```http
DELETE /api/overlays/<overlay_id>
```

Removes a single overlay.

---

### 8. Delete All Overlays

```http
DELETE /api/overlays
```

Removes all overlays.

---

## Sample MongoDB Document

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
  "scale": 100
}
```

---

## Development Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/livesitter.git
   cd livesitter
   ```

2. **Backend Setup**

   * Create a `.env` file in backend:

     ```env
     MONGODB_CONNECTION_STRING=mongodb+srv://user:pass@cluster.mongodb.net
     ```
   * Run backend:

     ```bash
     cd backend
     pip install -r requirements.txt
     python app.py
     ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   npm start
   ```

---

## Testing the API

You can test endpoints using `curl` or Postman.

### Example: Add Overlay

```bash
curl -X POST http://localhost:5000/api/overlays \
-H "Content-Type: application/json" \
-d '{
  "type": "text",
  "text": "Hello Overlay",
  "x": 100,
  "y": 150,
  "color": "blue",
  "fontSize": 24,
  "visible": true,
  "scale": 100
}'
```

### Example: Toggle Visibility

```bash
curl -X PATCH http://localhost:5000/api/overlays/68a38aee083d541204033e97/toggle
```

### Example: Delete Overlay

```bash
curl -X DELETE http://localhost:5000/api/overlays/68a38aee083d541204033e97
```

---

## Usage Workflow

1. Start backend (Flask) and frontend (React).
2. Video stream loads via HLS (`index.m3u8`).
3. Use the form to add overlays (text/image).
4. Overlays are stored in MongoDB Atlas.
5. Overlays are dynamically displayed on the video.
6. Manage overlays (toggle, edit, delete) via table or API.
