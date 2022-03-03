const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./helpers/uuid');
const notesJson = require('./db/db.json');

const PORT = process.env.PORT || 5501;

const app = express();

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});


app.post('/api/notes', (req, res) => {
    // Destructuring assignment for the items in req.body
    const {
        title,
        text
    } = req.body;

    // If all the required properties are present
    if (title && text) {
        // Variable for the object we will save
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        // Obtain existing notes
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                // Convert string into JSON object
                const parsedNotes = JSON.parse(data);

                // Add a new note
                parsedNotes.push(newNote);

                // Write updated note back to the file
                fs.writeFile(
                    './db/db.json',
                    JSON.stringify(parsedNotes, null, 4),
                    (writeErr) =>
                    writeErr ?
                    console.error(writeErr) :
                    console.info('Successfully updated notes!')
                );
            }
        });

        const response = {
            status: 'success',
            body: newNote,
        };

        console.log(response);
        res.json(response);
    } else {
        res.json('Error in posting review');
    }
});

app.get('/api/notes', (req, res) => {
    const notesJson = fs.readFileSync('./db/db.json');
    res.json(JSON.parse(notesJson));
});

app.delete('/api/notes/:id', (req, res) => {

    const noteId = req.params.id;
    // Obtain existing reviews
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        // Convert string into JSON object
        const parsedNotes = JSON.parse(data);
        // Iterate through the json objects to find the matching id
        for (var i = 0; i < parsedNotes.length; i++) {
            if (parsedNotes[i].id == noteId) {
                // delete the json object with the matching id
                delete parsedNotes[i];
            }
        }
        // remove null elements in the json array
        const updatedNotesJson = parsedNotes.filter(element => {
            return element !== null;
        })

        // write updated json file
        fs.writeFile(
            './db/db.json',
            JSON.stringify(updatedNotesJson, null, 4),
            (writeErr) =>
            writeErr ?
            console.error(writeErr) :
            console.info('Successfully deleted note!')
        );
    })
    const response = {
        status: 'success'
    };
    console.log(response);
    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});