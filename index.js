const express = require("express");
const axios = require("axios");
const cors = require('cors');  // Make sure to install CORS package with npm install cors
require("dotenv").config();

const app = express();
app.use(cors());              // Enable CORS for all origins
app.use(express.json());      // Middleware to parse JSON bodies

// Route to search for a book by topic
app.post("/functions/findbooks", async (req, res) => {
    const { input } = req.body;

    try {
        const apiKey = process.env.GOOGLE_API_KEY;  // Ensure your API key is in an environment variable
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(input)}&key=${apiKey}`;
        const response = await axios.get(url);

        if (!response.data.items) {
            return res.status(404).json({ error: "No books found for the given query." });
        }

        const books = response.data.items.map(book => ({
            title: book.volumeInfo.title,
            authors: book.volumeInfo.authors || ["No authors listed"],
            description: book.volumeInfo.description 
                ? book.volumeInfo.description.split('. ').slice(0, 2).join('. ') + '.' 
                : 'No description available.'
        })).slice(0, 3);

        res.json({ output : books });
    } catch (error) {
        console.error("Error fetching data from Google Books API:", error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return res.status(error.response.status).send({
                error: "Failed to fetch books",
                details: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            return res.status(500).send({ error: "No response received from Google Books API" });
        } else {
            // Something happened in setting up the request that triggered an Error
            return res.status(500).send({ error: "Error making request to Google Books API" });
        }
    }
});

app.get("/functions/findbooks", (req, res) => {
  res.json({
    name: "BookFinder",
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



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
