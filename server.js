const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const { ExpressPeerServer } = require('peer');

/* -------------------------------------------------------------------------- */
/*                                Configuration                               */
/* -------------------------------------------------------------------------- */

// create server & websocket server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Utilisation de PeerJS avec Express
const peerServer = ExpressPeerServer(server, {
    debug: true
  });

// Configuration du stockage des photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `photo_${Date.now()}.jpg`)
});

const upload = multer({ storage });

/* -------------------------------------------------------------------------- */
/*                                 Middleware                                 */
/* -------------------------------------------------------------------------- */
app.use(bodyParser.json());
app.use(express.static('public')); // Sert les fichiers HTML, CSS, JS
app.use('/uploads', express.static('uploads')); // Sert les images uploadées
app.use('/peerjs', peerServer);

// const { WebSocketServer } = require('ws');

// const wss = new WebSocketServer({ port: 3001 }); // Port pour WebRTC

const clients = new Map();

// Importer la bibliothèque WebSocket
// const WebSocket = require('ws');

/* -------------------------------------------------------------------------- */
/*                              Websocket Server                              */
/* -------------------------------------------------------------------------- */

// WebSocket pour la signalisation
io.on('connection', (socket) => {
    console.log('Un client connecté', socket.id);
  
    socket.on('offer', (offer) => {
      console.log('Offre reçue: ', offer);
      socket.broadcast.emit('offer', offer); // Transmettre l'offre aux autres clients
    });
  
    socket.on('answer', (answer) => {
      console.log('Réponse reçue: ', answer);
      socket.broadcast.emit('answer', answer); // Transmettre la réponse
    });
  
    socket.on('ice-candidate', (candidate) => {
      console.log('Candidat ICE reçu: ', candidate);
      socket.broadcast.emit('ice-candidate', candidate); // Transmettre les candidats ICE
    });
  
    socket.on('disconnect', () => {
      console.log('Un client s\'est déconnecté');
    });
  });


console.log('WebSocket server for WebRTC running on ws://localhost:3000');


/* -------------------------------------------------------------------------- */
/*                                   Routes                                   */
/* -------------------------------------------------------------------------- */
server.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/attractLoop.html')));
// app.get('/tab', (req, res) => res.sendFile(path.join(__dirname, 'public/tablette.html')));

// Save photo
server.post('/upload', upload.single('photo'), (req, res) => {
    const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, url: photoUrl });
});

// Démarrage du serveur
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
