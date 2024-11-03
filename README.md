<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="https://i.imgur.com/6wj0hh6.jpg" alt="Project logo"></a>
</p>

<h3 align="center">scriptorium</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/kylelobo/The-Documentation-Compendium.svg)](https://github.com/kylelobo/The-Documentation-Compendium/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/kylelobo/The-Documentation-Compendium.svg)](https://github.com/kylelobo/The-Documentation-Compendium/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> Few lines describing your project.
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Built Using](#built_using)
- [TODO](../TODO.md)
- [Contributing](../CONTRIBUTING.md)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

## 🧐 About <a name = "about"></a>

Write about 1-2 paragraphs describing the purpose of your project.

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them.

```
Give examples
```

### Installing

A step by step series of examples that tell you how to get a development env running.

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo.

## 🔧 Running the tests <a name = "tests"></a>

Explain how to run the automated tests for this system.

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

# API

## Code Template

### save.js

This API provides a POST endpoint to create a new code template in the database. Users must be authorized with a valid JWT token, passed in the Authorization header as Bearer <token>. Upon successful validation, the endpoint accepts parameters such as title, description, tags, code, language, and authorId. The authorId must match the ID in the decoded token payload; otherwise, the request will be denied with a 403 Forbidden status. The endpoint responds with the newly created template object upon success (201 Created) or an appropriate error code (401 Unauthorized, 403 Forbidden, 400 Bad Request, 405 Method Not Allowed, or 500 Internal Server Error) if there are issues.

request body:

```
{
  "title": "Example Template",
  "description": "This is an example template description.",
  "tags": "example, code",
  "code": "console.log('Hello, World!');",
  "language": "JavaScript",
  "authorId": 1
}
```

respond:

```
{
  "id": 1,
  "title": "Example Template",
  "description": "This is an example template description.",
  "tags": "example, code",
  "code": "console.log('Hello, World!');",
  "language": "JavaScript",
  "authorId": 1
}
```

### show.js

This API provides a GET endpoint for retrieving code templates based on specific query criteria. Users can specify the search criterion using the options and info query parameters. The options parameter can be userId, title, or tags, and the info parameter provides the corresponding value. For example, when options=userId, info should be an integer representing the author’s ID. When options=title, info should be the template’s title. When options=tags, info should contain a tag to search within the tags field. The endpoint responds with a list of matching templates (200 OK). If options is invalid, it returns a 400 Bad Request. Supported error responses include 405 Method Not Allowed for unsupported HTTP methods and 500 Internal Server Error for any server-side issues.

request body:

```
{
  GET /api/codeTemplate?options=userId&info=1
}
```

respond:

```
[
    {
        "id": 1,
        "title": "Sample Template",
        "description": "A sample template description.",
        "tags": "example, code",
        "code": "console.log('Hello, World!');",
        "language": "JavaScript",
        "authorId": 1
    },
    ...
]
```

### update.js

This API provides a PATCH endpoint to update an existing code template. Users must be authorized with a valid JWT token, passed in the Authorization header as Bearer <token>. The id of the code template to update should be provided as a query parameter. In the request body, fields such as title, description, tags, code, and language can be included to specify which attributes of the template to update. Only fields provided in the request body will be updated, while any fields left out will remain unchanged.

request body:

```
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": "updated, example",
  "code": "console.log('Updated Code');",
  "language": "JavaScript"
}
```

respond:

```
{
  "id": 1,
  "title": "Updated Title",
  "description": "Updated description",
  "tags": "updated, example",
  "code": "console.log('Updated Code');",
  "language": "JavaScript",
  "authorId": 1
}
```

### delete.js

This API provides a DELETE endpoint for deleting an existing code template. Users must be authorized with a valid JWT token, passed in the Authorization header as Bearer <token>. The id of the code template to delete should be provided as a query parameter. The endpoint first checks if the specified template exists; if not, it returns a 404 Not Found response. If the template exists, it is deleted, and a success message is returned.

request body:

```
  DELETE /api/codeTemplate/delete?id=1
```

respond:

```
{
  "message": "Template deleted successfully"
}
```

### execution.js

This API provides a GET endpoint to fetch a code template by its ID and execute the code based on its specified programming language. The endpoint supports various languages including JavaScript, Python, Java, C, and C++. Users can specify the id of the template they want to execute through the query parameter. The endpoint retrieves the template from the database, writes the code to a temporary file, and runs it using appropriate system commands. After execution, it returns the output of the code or any error messages encountered during execution. Note that only supported languages will be executed; unsupported languages will return a 400 error.

request body:

```
  GET /api/codeTemplate/execution?id=1
```

respond:

```
{
  "message": "Template deleted successfully"
}
```

## 🎈 Usage <a name="usage"></a>

Add notes about how to use the system.

## 🚀 Deployment <a name = "deployment"></a>

Add additional notes about how to deploy this on a live system.

## ⛏️ Built Using <a name = "built_using"></a>

- [MongoDB](https://www.mongodb.com/) - Database
- [Express](https://expressjs.com/) - Server Framework
- [VueJs](https://vuejs.org/) - Web Framework
- [NodeJs](https://nodejs.org/en/) - Server Environment

## ✍️ Authors <a name = "authors"></a>

- [@kylelobo](https://github.com/kylelobo) - Idea & Initial work

See also the list of [contributors](https://github.com/kylelobo/The-Documentation-Compendium/contributors) who participated in this project.

## 🎉 Acknowledgements <a name = "acknowledgement"></a>

- Hat tip to anyone whose code was used
- Inspiration
- References
