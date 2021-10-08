const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const jsonParser = express.json();
const port = 8000;

app.use(cors());

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }
  console.log(`server is listening on ${port}`);
});

app.post('/add-user', jsonParser, (request, response) => {
  const requestedUser = request.body;

  if (!requestedUser) {
    response.status(400).send('Отсутствуют данные о пользователе');
  } else {
    fs.readFile('./server/db.json', 'utf8', (err, data) => {
      if (err) {
        return response.status(500).send(err);
      } else {
        try {
          const db = JSON.parse(data);
          const users = db.users;
          const userExists = users.some((user) => user.email === requestedUser.email);

          if (userExists) {
            return response.status(400).send('Такой пользователь существует');
          } else {
            users.push(requestedUser);
            json = JSON.stringify(db, null, 2, '\t');
            fs.writeFile('./server/db.json', json, 'utf8', (err) => {
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

app.get('/users', (request, response) => {
  fs.readFile('./server/db.json', 'utf8', (err, data) => {
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
  fs.readFile('./server/db.json', 'utf8', (err, data) => {
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
            return response.status(400).send('Такого пользователя не существует. Пожауйста проверьте еще раз введенные Вами данные!');
          }
        } else {
          return response.status(400).send('Список пользователей пуст');
        }
      } catch (err) {
        return response.status(500).send(err);
      }
    }
  });
});
