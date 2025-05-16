import React, { useState, useEffect, useRef } from "react";
import { Category } from "@/types";

type PageType = "list-items" | "my-orders" | "sell-orders";

interface FilterProductProps {
  categories: Category[];
  pageType: PageType;
  onFilterChange: (filters: {
    selectedCategoryIds: number[];
    dateRange: string;
    minPrice: string;
    maxPrice: string;
  }) => void;
}

const FilterProduct: React.FC<FilterProductProps> = ({ categories, pageType, onFilterChange }) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
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
    onFilterChange({ selectedCategoryIds, dateRange, minPrice, maxPrice });
  }, [selectedCategoryIds, dateRange, minPrice, maxPrice, onFilterChange]);

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

  return (
    <div className="mb-6">
      <div className="flex gap-4 flex-wrap items-center">
        {/* Category Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="px-4 py-2 border border-[#cbd5e1] rounded-lg bg-white hover:bg-[#e0e0e0] text-[#1e2a38] flex items-center gap-2 transition-colors"
          >
            <span>Category</span>
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
            <div className="absolute top-full left-0 mt-1 w-64 max-h-96 overflow-y-auto bg-white border border-[#cbd5e1] rounded shadow-lg z-50">
              <div className="p-2">
                {categories.map((cat) => (
                  <label
                    key={cat.categoryID}
                    className="flex items-center gap-2 p-2 hover:bg-[#e0e0e0] cursor-pointer text-[#1e2a38]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(cat.categoryID)}
                      onChange={() => handleCategoryToggle(cat.categoryID)}
                      className="w-4 h-4 accent-[#1e2a38]"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="relative" ref={dateDropdownRef}>
          <button
            type="button"
            onClick={() => setIsDateDropdownOpen((prev) => !prev)}
            className="px-4 py-2 border border-[#cbd5e1] rounded-lg bg-white text-[#1e2a38] flex items-center gap-2 transition-colors hover:bg-[#e0e0e0]"
          >
            <span>
              {getDateOptions().find((opt) => opt.value === dateRange)?.label || "Select"}
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
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[#cbd5e1] rounded shadow-lg z-50">
              {getDateOptions().map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    setDateRange(option.value);
                    setIsDateDropdownOpen(false);
                  }}
                  className={`px-4 py-2 cursor-pointer text-[#1e2a38] hover:bg-[#e0e0e0] transition-colors ${
                    dateRange === option.value ? 'bg-[#e0e0e0] font-semibold' : ''
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
          className="p-2 border border-[#cbd5e1] rounded-lg w-28 no-spinner text-[#1e2a38] bg-white hover:bg-[#e0e0e0] transition-colors"
          placeholder="Min Fiyat"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          min={0}
        />
        <input
          type="number"
          className="p-2 border border-[#cbd5e1] rounded-lg w-28 no-spinner text-[#1e2a38] bg-white hover:bg-[#e0e0e0] transition-colors"
          placeholder="Max Fiyat"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          min={0}
        />
      </div>
      {/* Dashed line below filters */}
      <hr className="border-t-2 border-dashed border-[#cbd5e1] mt-4" />

      {/* Selected Categories Display */}
      {selectedCategoryIds.length > 0 && (
        <>
          <div className="mt-[30px] flex flex-wrap gap-2">
            {selectedCategoryIds.map((categoryId) => {
              const category = categories.find((cat) => cat.categoryID === categoryId);
              return (
                category && (
                  <div
                    key={categoryId}
                    className="flex items-center gap-1 px-3 py-1 bg-[#cbd5e1] rounded-full text-sm text-[#1e2a38]"
                  >
                    <span>{category.name}</span>
                    <button
                      onClick={() => removeCategory(categoryId)}
                      className="text-[#1e2a38] hover:text-[#cbd5e1] transition-colors"
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
                )
              );
            })}
          </div>
          {/* Solid line below selected categories */}
          <hr className="border-t-2 border-[#cbd5e1] mt-4" />
        </>
      )}
    </div>
  );
};

export default FilterProduct;
