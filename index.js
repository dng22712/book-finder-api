const express = require("express");
const axios = require("axios");
const app = express();

require("dotenv").config();

app.use(express.json());

const PORT = 3000;


// Route to search for a book by topic
app.post("/functions/books", async (req, res) => {
  const { input } = req.body;
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(input)}&key=${apiKey}`
    );

    const allBooks = response.data.items.map((book) => ({
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors,
      description: book.volumeInfo.description ? book.volumeInfo.description.split('. ').slice(0, 2).join('. ') + '.' : 'No description available.'

    }));

    const books = allBooks.slice(0, 3);

    res.json({  books });


  } catch (error) {
    console.log("Error details:", error);
    if (error.response) {
      // If the error has a response property, it's likely from axios
      console.log("Error response data:", error.response.data);
      res
        .status(error.response.status)
        .send({ error: "Failed to fetch books", details: error.response.data });
    } else {
      // Other types of errors (e.g., programming errors)
      res
        .status(500)
        .send({ error: "Internal Server Error", details: error.message });
    }
  }
});

app.get("/functions/books", (req, res) => {
  res.json({
    name: "Book Finder",
    description: "Find the best books you need.",
    input: {
      type: "string",
      description: "Input the topic in which you are searching for",
      example: "Javascript",
    },
    output: {
      type: "string",
      description: "Returns a list of books matching the topic.",
      example: [
        {
          title: "JavaScript: The Good Parts",
          authors: ["Douglas Crockford"],
          description: "Unearthing the excellence in JavaScript",
        },
      ],
    },
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
