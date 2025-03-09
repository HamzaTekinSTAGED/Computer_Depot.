import { useEffect, useState } from "react";

export default function MyComponent() {
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/posts");
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Something went wrong");
        }

        setPosts(json);
      } catch (error: any) {
        console.error("Fetch error:", error);
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-semibold text-center mb-6">Posts List</h1>
      {error && <p className="text-red-500 text-center">{`Error: ${error}`}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">{post.name}</h2>
              <p className="text-gray-600 text-sm">{post.dept_name}</p>
              <p className="text-gray-800 text-lg mt-2 font-medium">${post.salary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
