const fileUtil = require("./fileUtil");
const routeHandler = {};
const helper = require("./helper");
routeHandler.Books = (data, callback) => {
  const acceptableHeaders = ["post", "get", "put", "delete"];
  if (acceptableHeaders.indexOf(data.method) > -1) {
    routeHandler._books[data.method](data, callback);
  } else {
    callback(405);
  }
};

//Login route
routeHandler.Login = (data, callback) => {
  const acceptableHeaders = ["post"];
  if (acceptableHeaders.indexOf(data.method) > -1) {
    routeHandler._login[data.method](data, callback);
  } else {
    callback(405);
  }
};

//main book route object
routeHandler._books = {};

//Post route -- for creating a book
routeHandler._books.post = (data, callback) => {
  //validate that all required fields are filled out
  const name =
    typeof data.payload.name === "string" && data.payload.name.trim().length > 0
      ? data.payload.name
      : false;
  const price =
    typeof data.payload.price === "string" &&
    !isNaN(parseInt(data.payload.price))
      ? data.payload.price
      : false;
  const author =
    typeof data.payload.author === "string" &&
    data.payload.author.trim().length > 0
      ? data.payload.author
      : false;
  const publisher =
    typeof data.payload.publisher === "string" &&
    data.payload.publisher.trim().length > 0
      ? data.payload.publisher
      : false;
  const quantity =
    typeof data.payload.quantity === "string" &&
    data.payload.quantity.trim().length > 0 &&
    parseInt(data.payload.quantity) !== NaN
      ? data.payload.quantity
      : false;
  if (name && price && author && publisher && quantity) {
    const fileName = helper.generateRandomString(30);
    fileUtil.create("books", fileName, data.payload, (err) => {
      if (!err) {
        callback(200, { message: "book added successfully", data: null });
      } else {
        callback(400, { message: "could add book" });
      }
    });
  }
};
//Get route -- for geting a book
routeHandler._books.get = (data, callback) => {
  if (data.query.name) {
    fileUtil.read("books", data.query.name, (err, data) => {
      if (!err && data) {
        callback(200, { message: "book retrieved", data: data });
      } else {
        callback(404, {
          err: err,
          data: data,
          message: "could not retrieve book",
        });
      }
    });
  } else {
    callback(404, { message: "book not found", data: null });
  }
};
//Put route -- for updating a book
routeHandler._books.put = (data, callback) => {
  if (data.query.name) {
    fileUtil.update("books", data.query.name, data.payload, (err) => {
      if (!err) {
        callback(200, { message: "book updated successfully" });
      } else {
        callback(400, {
          err: err,
          data: null,
          message: "could not update book",
        });
      }
    });
  } else {
    callback(404, { message: "book not found" });
  }
};
//Delete route -- for deleting a book
routeHandler._books.delete = (data, callback) => {
  if (data.query.name) {
    fileUtil.delete("books", data.query.name, (err) => {
      if (!err) {
        callback(200, { message: "book deleted successfully" });
      } else {
        callback(400, { err: err, message: "could not delete book" });
      }
    });
  } else {
    callback(404, { message: "book not found" });
  }
};

// Register user
routeHandler._register.post = (data, callback) => {
  //validate that all required fields are filled out
  const name =
    typeof data.payload.name === "string" && data.payload.name.trim().length > 0
      ? data.payload.name
      : false;
  const email =
    typeof data.payload.price === "string" &&
    !isNaN(parseInt(data.payload.price))
      ? data.payload.price
      : false;
  const password =
    typeof data.payload.author === "string" &&
    data.payload.author.trim().length > 0
      ? data.payload.author
      : false;
  if (name && email && password) {
    const fileName = helper.generateRandomString(30);
    data.payload.id = fileName;
    fileUtil.create("users", fileName, data.payload, (err) => {
      if (!err) {
        callback(200, { message: "user added successfully", data: null });
      } else {
        callback(400, { message: "could add book" });
      }
    });
  }
};

//Borrow out a book
routeHandler._request.borrow = (data, callback) => {
  const bookname = data.query.name;
  if (bookname) {
    fileUtil.read("books", data.query.name, (err, data) => {
      if (!err && data) {
        if (parseInt(data.quantity > 0)) {
          const newBook = data;
          newBook.quantity = toString(parseInt(data.quantity - 1));
          lib.update("books", bookname, newBook, (err) => {
            if (!err) {
              callback(200, { message: "A copy borrowed out", data: data });
            } else {
              callback(400, { message: "Couldn't rent out book", data: data });
            }
          });
        } else {
          callback(401, { message: "Every copy already rented out" });
        }
      } else {
        callback(404, {
          err: err,
          data: data,
          message: "could not retrieve book",
        });
      }
    });
  }
};

//Return borrowed book
routeHandler._request.return = (data, callback) => {
  const bookname = data.query.name;
  if (bookname) {
    fileUtil.read("books", data.query.name, (err, data) => {
      if (!err && data) {
        const newBook = data;
        newBook.quantity = toString(parseInt(data.quantity + 1));
        lib.update("books", bookname, newBook, (err) => {
          if (!err) {
            callback(200, { message: "A copy returned", data: data });
          } else {
            callback(400, { message: "Couldn't return book", data: data });
          }
        });
      } else {
        callback(404, {
          err: err,
          data: data,
          message: "could not retrieve book",
        });
      }
    });
  }
};

routeHandler.ping = (data, callback) => {
  callback(200, { response: "server is live" });
};
routeHandler.notfound = (data, callback) => {
  callback(404, { response: "not found" });
};

module.exports = routeHandler;

