
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.set('view engine', 'ejs');

// Mock data for sports
let sports = [
    { id: 1, name: 'Football' },
    { id: 2, name: 'Basketball' }
];

let sessions = [];

// Serve static files for simplicity
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('home');
});
app.get('/register', (req, res) => {
       res.render('register');
     });
  
 app.get('/feedback', (req, res) => {
     res.render('feedback');
});

 app.get('/features', (req, res) => {
    res.render('features');
 });
app.post('/home', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { userType } = req.body;
    if (userType === '1') { // Admin
        res.redirect('/admindash');
    } else if (userType === '2') { // Player
        res.redirect('/playerdash');
    } else {
        res.redirect('/login');
    }
});

app.get('/admindash', (req, res) => {
    res.render('admindash', { sports: sports, sessions: sessions });
});

app.get('/playerdash', (req, res) => {
    res.render('playerdash', { sports: sports, sessions: sessions });
});
app.post("/admindash",(req,res)=>{
    res.redirect("/reports");
})
app.post("/admindash",(req,res)=>{
   res.redirect("/changepassword");
})
app.post('/changepassword', (req, res) => {
        const { email, current, new: newPassword } = req.body;
        
     res.send('Password changed successfully.'); 
});
app.get("/changepassword",(req,res)=>{
        res.render("changepassword");
    });
    app.get('/reports', (req, res) => {
             const reports = [
                 { gameId: 1, sport: 'Soccer', date: '2023-07-01', teams: 'Team A vs Team B', score: '2-1' },
                 { gameId: 2, sport: 'Basketball', date: '2023-07-02', teams: 'Team C vs Team D', score: '98-95' },
                { gameId: 3, sport: 'Tennis', date: '2023-07-03', teams: 'Player 1 vs Player 2', score: '6-4, 6-3' },
            ];
             res.render('reports', { reports: reports });
         });
app.post('/create-session', (req, res) => {
    const { sport_id, team1, team2, date, venue } = req.body;
    const session = {
        id: sessions.length + 1,
        sport: sports.find(sport => sport.id == sport_id).name,
        teams: `${team1} vs ${team2}`,
        date,
        venue
    };
    sessions.push(session);
    res.json(session); // Return the created session as JSON
});

app.post('/join-session', (req, res) => {
    const { session_id } = req.body;
    const session = sessions.find(s => s.id == session_id);
    if (session) {
        // Handle joining logic here if needed
        res.send(`Successfully joined session ${session_id}`);
    } else {
        res.status(404).send('Session not found');
    }
});

app.listen(3004, () => {
    console.log('Server started at 3004');
});
