import { useEffect, useState } from "react";

export default function TestApi() {
  const [message, setMessage] = useState("...Loading...");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:3000/api/hello");
        const data = await res.json();
        setMessage(data.message);
      } catch (err) {
        setMessage("Error: cannot connect to API");
        console.error(err);
      }
    }

    fetchData();
  }, []);

  return <div>Message: {message}</div>;
}