"use client"

import { useState } from "react"
import { ChevronDown, X } from "lucide-react"

const options = [
  { value: "AAPL", label: "Apple Inc." },
  { value: "GOOGL", label: "Alphabet Inc." },
  { value: "MSFT", label: "Microsoft Corporation" },
  { value: "AMZN", label: "Amazon.com Inc." },
  { value: "TSLA", label: "Tesla Inc." },
]

export function MultiSelectDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen)

  // Select an option
  const handleSelect = (option) => {
    if (!selectedOptions.find((item) => item.value === option.value)) {
      setSelectedOptions([...selectedOptions, option])
    }
  }

  // Remove an option
  const handleRemove = (option) => {
    setSelectedOptions(selectedOptions.filter((item) => item.value !== option.value))
  }

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative w-64">
      {/* Input Field */}
      <div
        className="flex h-10 items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 cursor-pointer dark:border-gray-700 dark:bg-gray-800"
        onClick={toggleDropdown}
      >
        <div className="flex flex-wrap gap-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md text-sm dark:bg-gray-700"
              >
                {option.label}
                <button onClick={(e) => { e.stopPropagation(); handleRemove(option) }}>
                  <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-400 dark:text-gray-500">Select stocks...</span>
          )}
        </div>
        <ChevronDown className="h-5 w-5 text-gray-500" />
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-full rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {/* Search Bar */}
          <input
            type="text"
            className="w-full border-b border-gray-300 px-3 py-1 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking search bar
          />

          {/* Options List */}
          <div className="max-h-40 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

