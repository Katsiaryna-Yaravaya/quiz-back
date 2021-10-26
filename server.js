const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const jsonParser = express.json();
const port = 3001;

app.use(cors());

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }
  console.log(`server is listening on ${port}`);
});

app.post('/add-user', jsonParser, (request, response) => {
  const requestedUser = request.body;
  console.log(requestedUser)
  if (!requestedUser) {
    response.status(400).send('Missing user data');
  } else {
    fs.readFile('db.json', 'utf8', (err, data) => {
      if (err) {
        return response.status(500).send(err);
      } else {
        try {
          const db = JSON.parse(data);
          const users = db.users;
          const userExists = users.some((user) => user.email === requestedUser.email);

          if (userExists) {
            return response.status(400).json('User already exists');
          } else {
            users.push(requestedUser);
            json = JSON.stringify(db, null, 2, '\t');
            fs.writeFile('db.json', json, 'utf8', (err) => {
              if (err) {
                return response.status(500).send(err);
              }
              return response.status(200).json('OK');
            });
          }
        } catch (err) {
          return response.status(500).send(err);
        }
      }
    });
  }
});

app.patch('/users/:email', jsonParser, (request, response) => {
  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
      return response.status(500).send(err);
    } else {
      try {
        const db = JSON.parse(data);
        const users = db.users;
        users.map(item=> {
          if (item.email === request.params.email){
            if (item.userGames.length === 5) {
              item.userGames.shift()
              item.userGames.push(request.body)
            }
            if (item.userGames.length < 5) {
              item.userGames.push(request.body)
            }
          }
        })
        json = JSON.stringify(db, null, 2, '\t');
        fs.writeFile( "db.json", json, "utf8", function() {
          response.send({success: true});
        } );
      } catch (err) {
        return response.status(500).send(err);
      }
    }
  })
})

app.get('/users', (request, response) => {
  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
      return response.status(500).send(err);
    } else {
      try {
        const db = JSON.parse(data);
        const users = db.users;
        return response.send(users);
      } catch (err) {
        return response.status(500).send(err);
      }
    }
  });
});

app.post('/login', jsonParser, (request, response) => {
  const requestedUser = request.body;
  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
      return response.status(500).send(err);
    } else {
      try {
        const db = JSON.parse(data);
        const users = db.users;

        if (users.length) {
          const user = users.find((user) => user.email === requestedUser.email && user.pass === requestedUser.pass);
          if (user) {
            return response.status(200).send(user);
          } else {
            return response.status(400).send('No such user exists. Please check the data you entered again!');
          }
        } else {
          return response.status(400).send('User list is empty');
        }
      } catch (err) {
        return response.status(500).send(err);
      }
    }
  });
});
