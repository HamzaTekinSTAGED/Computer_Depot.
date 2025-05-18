import React, { useState, useEffect, useRef } from "react";
import { Category } from "@/types";
import { FiSearch } from "react-icons/fi";

type PageType = "list-items" | "my-orders" | "sell-orders";

interface FilterProductProps {
  categories: Category[];
  pageType: PageType;
  onFilterChange: (filters: {
    selectedCategoryIds: number[];
    dateRange: string;
    minPrice: string;
    maxPrice: string;
    searchTerm: string;
  }) => void;
}

const FilterProduct: React.FC<FilterProductProps> = ({ categories, pageType, onFilterChange }) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  const getDateOptions = () => {
    switch (pageType) {
      case "list-items":
        return [
          { value: "", label: "All Products" },
          { value: "1week", label: "Added in the Last Week" },
          { value: "1month", label: "Added in the Last Month" },
          { value: "3month", label: "Added in the Last 3 Month" },
          { value: "6month", label: "Added in the Last 6 Month" }
        ];
      case "my-orders":
        return [
          { value: "", label: "All Orders" },
          { value: "1week",  label: "Purchased in the Last Week" },
          { value: "1month", label: "Purchased in the Last Month" },
          { value: "3month", label: "Purchased in the Last 3 Month" },
          { value: "6month", label: "Purchased in the Last 6 Month" }
        ];
      case "sell-orders":
        return [
          { value: "", label: "All Sales" },
          { value: "1week", label: "Sold in the Last Week" },
          { value: "1month", label: "Sold in the Last Month" },
          { value: "3month", label: "Sold in the Last 3 Month" },
          { value: "6month", label: "Sold in the Last 6 Month" }
        ];
      default:
        return [{ value: "", label: "All" }];
    }
  };

  useEffect(() => {
    onFilterChange({ selectedCategoryIds, dateRange, minPrice, maxPrice, searchTerm });
  }, [selectedCategoryIds, dateRange, minPrice, maxPrice, searchTerm, onFilterChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const removeCategory = (categoryId: number) => {
    setSelectedCategoryIds((prev) => prev.filter((id) => id !== categoryId));
  };

  const selectedCategoryNames = selectedCategoryIds
    .map((id) => categories.find((cat) => cat.categoryID === id)?.name)
    .filter((name): name is string => name !== undefined);

  return (
    <>
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-primary-dark">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10 focus:border-primary-dark focus:ring-primary-dark text-primary-dark"
              placeholder="Search product name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FiSearch className="h-5 w-5" />
            </span>
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full md:w-48" ref={dropdownRef}>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100 text-primary-dark flex items-center justify-between gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent"
            >
              <span>Category ({selectedCategoryIds.length})</span>
              <svg
                className={`w-4 h-4 transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="p-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.categoryID}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer text-primary-dark"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(cat.categoryID)}
                        onChange={() => handleCategoryToggle(cat.categoryID)}
                        className="w-4 h-4 accent-primary-dark"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="relative w-full md:w-72" ref={dateDropdownRef}>
            <button
              type="button"
              onClick={() => setIsDateDropdownOpen((prev) => !prev)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-primary-dark flex items-center justify-between gap-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent"
            >
              <span>
                {getDateOptions().find((opt) => opt.value === dateRange)?.label || "Select Date Range"}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${isDateDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDateDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
                {getDateOptions().map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      setDateRange(option.value);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`px-4 py-2 cursor-pointer text-primary-dark hover:bg-gray-100 transition-colors ${dateRange === option.value ? 'bg-gray-100 font-semibold' : ''
                    }`}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Inputs */}
          <input
            type="number"
            className="w-full md:w-32 p-2 border border-gray-300 rounded-md no-spinner text-primary-dark bg-white hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min={0}
          />
          <input
            type="number"
            className="w-full md:w-32 p-2 border border-gray-300 rounded-md no-spinner text-primary-dark bg-white hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min={0}
          />

        </div>
      </div>

      {/* Selected Categories Display */}
      {selectedCategoryNames.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedCategoryNames.map((name) => (
            <div
              key={name}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full text-sm text-primary-dark"
            >
              <span>{name}</span>
              <button
                onClick={() => {
                  const category = categories.find(cat => cat.name === name);
                  if (category) removeCategory(category.categoryID);
                }}
                className="text-primary-dark hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

    </>
  );
};

export default FilterProduct;
