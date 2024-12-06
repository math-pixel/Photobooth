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

const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 3001 }); // Port pour WebRTC

const clients = new Map();

// Importer la bibliothèque WebSocket
const WebSocket = require('ws');

// Gestion des connexions entrantes
wss.on('connection', (ws) => {
    console.log('Nouveau client connecté.');

    // Écoute des messages depuis un client
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`Message reçu :`, data);

            // Gestion de l'enregistrement des rôles
            if (data.type === 'register') {
                clients[data.role] = ws;
                console.log(`${data.role} enregistré.`);
                ws.send(JSON.stringify({ type: 'status', message: `Enregistré en tant que ${data.role}` }));
            }

            // Transmission des offres
            if (data.type === 'offer' && clients['tablet']) {
                console.log("Offre reçue du PC, transmission à la tablette...");
                clients['tablet'].send(JSON.stringify(data));
            }

            // Transmission des réponses
            if (data.type === 'answer' && clients['pc']) {
                console.log("Réponse reçue de la tablette, transmission au PC...");
                clients['pc'].send(JSON.stringify(data));
            }

            // Transmission des candidats ICE
            if (data.type === 'candidate') {
                const target = clients[data.target];
                if (target) {
                    console.log(`Candidat ICE transmis à ${data.target}.`);
                    target.send(JSON.stringify(data));
                } else {
                    console.warn(`Cible ${data.target} introuvable pour le candidat ICE.`);
                }
            }
        } catch (error) {
            console.error("Erreur lors du traitement du message :", error);
        }
    });

    // Gestion de la déconnexion
    ws.on('close', () => {
        console.log('Un client s\'est déconnecté.');
        Object.keys(clients).forEach(role => {
            if (clients[role] === ws) {
                delete clients[role];
                console.log(`${role} supprimé.`);
            }
        });
    });
});


console.log('WebSocket server for WebRTC running on ws://localhost:3001');



// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/attractLoop.html')));
// app.get('/tab', (req, res) => res.sendFile(path.join(__dirname, 'public/tablette.html')));

app.post('/upload', upload.single('photo'), (req, res) => {
    const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, url: photoUrl });
});

// Démarrage du serveur
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
