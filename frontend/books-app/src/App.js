import React, { useState, useEffect } from "react";

const App = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [newBookDescription, setNewBookDescription] = useState("");

  useEffect(() => {
    if (query.length !== 1) {
      fetch(`http://localhost:3000/books?q=${query}`)
        .then((res) => res.json())
        .then((data) => setBooks(data))
        .catch((err) => console.error("Error fetching books:", err));
    }
  }, [query]);

  const highlightText = (text, highlight) => {
    if (highlight.length < 2) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} style={{ backgroundColor: "#c4fc7c" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };
  const handleAddBook = () => {
    fetch("http://localhost:3000/addBooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description: newBookDescription }),
    })
      .then((data) =>
        setBooks((books) => [
          ...books,
          { id: books.length + 1, description: newBookDescription },
        ])
      )
      .then(() => {
        setNewBookDescription(newBookDescription);
        setQuery("");
      })
      .catch((err) => console.error("Error adding book:", err));
  };

  return (
    <div>
      <h1 style={{ color: "#c4fc7c" }}>Books</h1>

      <div>
        <h2 style={{ color: "#082444" }}>Add Book</h2>
        <input
          type="text"
          placeholder="Description"
          value={newBookDescription}
          onChange={(e) => setNewBookDescription(e.target.value)}
        />
        <button onClick={handleAddBook}>Add Book</button>
      </div>

      <div>
        <h2 style={{ color: "#082444" }}>Search Books</h2>
        <input
          type="text"
          placeholder="Search Query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ol>
        {books.map((book) => (
          <li key={book.id}>{highlightText(book.description, query)}</li>
        ))}
      </ol>
    </div>
  );
};

export default App;
