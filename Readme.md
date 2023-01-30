# Movie Renter API

Restful back-end API for a movie rental service. Built using Node.js, Express.js and MongoDB

<div id="badges" align="center">
  <img href="www.linkedin.com/in/fabio-andres-henao-caviedes" src="https://img.shields.io/badge/LinkedIn-blue?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn Badge"/>
  <img href="https://fabio-writes-code.github.io/" src="https://img.shields.io/badge/Portfolio-green?style=for-the-badge" alt="Portfolio Website"/>
</div>

### Languages and Tools

<div align="center">
  <img src="https://github.com/devicons/devicon/blob/master/icons/javascript/javascript-original.svg" title="JavaScript" alt="JavaScript" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/nodejs/nodejs-original-wordmark.svg" title="NodeJS" alt="NodeJS" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/express/express-original-wordmark.svg" title="Express" alt="Express" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/npm/npm-original-wordmark.svg" title="npm" alt="npm" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/mongodb/mongodb-plain-wordmark.svg" title="MongoDB" alt="MongoDB" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/vscode/vscode-original.svg" title="VSCode" alt="VSCode" width="40" height="40"/>&nbsp;
</div>

## Installation

Install my-project with npm

```bash
  npm install
  cd movie-renter
```

## Running Tests

To run tests, run the following command

```bash
  npm test
```

Add you local MongoDB database to config/test.json

## Environment Variables

To run this project, you will need to add the following environment variables to your .json file

`db` For the database address

`rental_jwtPrivateKey` for authentication

## Demo

The API is hosted in on https://movierentals.onrender.com. Database is hosted in a MongoAtlas Cluster
Please allow 10-15 seconds for the API to spin active

Create a user by sending a POST request to /api/users

![New User](src/readme-images/newUser.JPG)

Login by sending login info to /api/auth add the WebToken for subsequent operations

![Login User](src/readme-images/newAuth.JPG)

You can perform CRUD operations in movies, genres and customers

![Using the API](src/readme-images/getExample.JPG)

## Contributing

Contributions are always welcome!

Please adhere to this project's `code of conduct`.
