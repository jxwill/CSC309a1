import { useEffect, useState } from "react";

interface CodeTemplate {
  id: number;
  title: string;
  description: string;
  code: string;
  createdAt: string;
}

export default function CodeTemplateManager() {
  const [templates, setTemplates] = useState<CodeTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownValue, setDropdownValue] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState<CodeTemplate[]>([]);

  // Fetch templates from the getAll API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/codeTemplate/getAll");
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
          setFilteredTemplates(data); // Initialize filtered templates
        } else {
          console.error("Failed to fetch templates");
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  // Handle Search
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredTemplates(templates); // Reset if no search term
      return;
    }
    const results = templates.filter((template) =>
      dropdownValue === "title"
        ? template.title.toLowerCase().includes(searchTerm.toLowerCase())
        : dropdownValue === "tag" // Add tag logic if needed
        ? template.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );
    setFilteredTemplates(results);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white p-4 shadow-md">
        <h2 className="text-lg font-bold mb-4">Templates</h2>
        <div className="space-y-2">
          {templates.map((template) => (
            <button
              key={template.id}
              className="w-full p-2 text-left bg-blue-50 rounded hover:bg-blue-100"
              onClick={() => console.log(`Selected template: ${template.title}`)}
            >
              {template.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Search Section */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={handleSearch}
          >
            Search By
          </button>
          <select
            value={dropdownValue}
            onChange={(e) => setDropdownValue(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">Select</option>
            <option value="title">Title</option>
            <option value="tag">Tag</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded"
          />
        </div>

        {/* Code Display Section */}
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-bold mb-2">{template.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <textarea
                className="w-full h-40 border rounded p-2"
                value={template.code}
                readOnly
              />
              <p className="text-xs text-gray-500 mt-2">
                Uploaded on: {new Date(template.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}