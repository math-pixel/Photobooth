const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Configuration du stockage des photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `photo_${Date.now()}.jpg`)
});

const upload = multer({ storage });

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Sert les fichiers HTML, CSS, JS
app.use('/uploads', express.static('uploads')); // Sert les images uploadées

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/attractLoop.html')));

app.post('/upload', upload.single('photo'), (req, res) => {
    const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, url: photoUrl });
});

// Démarrage du serveur
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
